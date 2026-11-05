import { Fragment, useState } from 'react'
import { cards } from '../cards'
import type { OS } from '../engine/types'
import { INSTALL_BY_ID, INSTALL_COUNT, INSTALL_STEPS, type Instruction, type OSGuide, type Section, type Verify } from '../install'
import { INSTALL_VIDEOS, resolveVideo } from '../installVideos'
import { OS_LIST, useOS } from '../os'
import { askDetails, useUserDetails } from '../userDetails'
import { copyText } from './Copy'

/* ---------- tiny inline markup: **bold**  `code`  [[Key]]  [label](url) and bare github.com ---------- */
const TOKENS = /(\[\[.+?\]\]|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*.+?\*\*)/
const GITHUB = /(\bgithub\.com\b)/i
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

function Plain({ text }: { text: string }) {
  return (
    <>
      {text.split(GITHUB).map((p, i) => GITHUB.test(p) && i % 2 === 1
        ? <a key={i} className="inst-link" href="https://github.com/" {...ext}>{p}</a>
        : <Fragment key={i}>{p}</Fragment>)}
    </>
  )
}

export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKENS).map((p, i) => {
        if (!p) return null
        let m: RegExpExecArray | null
        if ((m = /^\[\[(.+)\]\]$/.exec(p))) return <kbd key={i}>{m[1]}</kbd>
        if ((m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p))) return <a key={i} className="inst-link" href={m[2]} {...ext}>{m[1]}</a>
        if ((m = /^`([^`]+)`$/.exec(p))) return <code key={i} className="inst-inline">{m[1]}</code>
        if ((m = /^\*\*(.+)\*\*$/.exec(p))) return <strong key={i}><Plain text={m[1]} /></strong>
        return <Plain key={i} text={p} />
      })}
    </>
  )
}

/* ---------- copyable commands ---------- */
function CmdLine({ cmd }: { cmd: string }) {
  const [done, setDone] = useState(false)
  return (
    <div className="inst-cmd">
      <code>{cmd}</code>
      <button type="button" className="copy-btn" aria-label={'Copy ' + cmd} onClick={() => { copyText(cmd); setDone(true); setTimeout(() => setDone(false), 1200) }}>
        {done ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function Steps({ steps }: { steps: Instruction[] }) {
  return (
    <ol className="inst-steps">
      {steps.map((s, i) => (
        <li key={i}>
          <div className="inst-text"><Rich text={s.text} /></div>
          {s.sub && <ul className="inst-sub">{s.sub.map((t) => <li key={t}><Rich text={t} /></li>)}</ul>}
          {s.cmds?.map((c) => <CmdLine key={c} cmd={c} />)}
          {s.why && <div className="inst-why"><b>What this does:</b> <Rich text={s.why} /></div>}
        </li>
      ))}
    </ol>
  )
}

function VerifyBox({ v, label = 'Check it worked' }: { v: Verify; label?: string }) {
  return (
    <div className="inst-verify">
      <b>{label}</b>
      <div><Rich text={v.text} /></div>
      {v.cmds?.map((c) => <CmdLine key={c} cmd={c} />)}
      <div className="inst-expect"><span>Expected</span> <Rich text={v.expect} /></div>
    </div>
  )
}

function Warnings({ items, title = 'Watch out' }: { items?: string[]; title?: string }) {
  if (!items?.length) return null
  return (
    <div className="inst-warn" role="note">
      <b>{title}</b>
      <ul>{items.map((w) => <li key={w}><Rich text={w} /></li>)}</ul>
    </div>
  )
}

function Block({ g }: { g: OSGuide | Section }) {
  return (
    <>
      {g.title && <h3 className="inst-h">{g.title}</h3>}
      {g.intro && <p className="inst-intro"><Rich text={g.intro} /></p>}
      <Steps steps={g.steps} />
      {g.verify && <VerifyBox v={g.verify} />}
      <Warnings items={g.warnings} />
    </>
  )
}

/* ---------- video: configurable source, clean placeholder ---------- */
export function InstallVideo({ id, os }: { id: string; os: OS }) {
  const cfg = INSTALL_VIDEOS[id]
  const v = resolveVideo(cfg, os)
  const title = cfg?.title ?? 'Installation video'
  return (
    <div className="inst-video" data-video={v.kind}>
      {v.kind === 'iframe' && (
        <iframe key={v.url} src={v.url} title={title} loading="lazy" allowFullScreen
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
      )}
      {v.kind === 'file' && <video key={v.url} src={v.url} title={title} controls preload="metadata" playsInline />}
      {v.kind === 'none' && (
        <div className="inst-video-empty" role="img" aria-label={title + ': video coming soon'}>
          <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M26 21l18 11-18 11z" fill="currentColor" /></svg>
          <strong>Video coming soon</strong>
          <span>{title}</span>
          {import.meta.env.DEV && <code>Add it in src/installVideos.ts → {id}</code>}
        </div>
      )}
    </div>
  )
}

const hrefOf = (id: string) => '#/' + id

function neighbours(id: string) {
  const i = cards.findIndex((c) => c.id === id)
  return { prev: cards[i - 1], next: cards[i + 1] }
}

export function InstallCard({ id, framed }: { id: string; framed: boolean }) {
  const step = INSTALL_BY_ID[id]
  const { os, setOS } = useOS()
  const { filled } = useUserDetails()
  const n = INSTALL_STEPS.indexOf(step) + 1
  const { prev, next } = neighbours(id)
  const guide: OSGuide | undefined = step.os ? step.os[os] : step.all
  const osName = OS_LIST.find((o) => o.id === os)!.label

  return (
    <div className={'card install-card' + (framed ? ' framed' : '')}>
      <header className="inst-head">
        <div className="inst-titles">
          <div className="kicker">Workshop &middot; Step {n} of {INSTALL_COUNT}</div>
          <h1>{step.title}</h1>
        </div>
        <ol className="inst-progress" aria-label={`Installation progress: step ${n} of ${INSTALL_COUNT}`}>
          {INSTALL_STEPS.map((s, i) => (
            <li key={s.id} className={i + 1 === n ? 'on' : i + 1 < n ? 'done' : ''}>
              <a href={hrefOf(s.id)} aria-current={i + 1 === n ? 'step' : undefined} title={s.title}>
                <span className="num">{i + 1}</span><span className="lbl">{s.short}</span>
              </a>
            </li>
          ))}
        </ol>
      </header>

      <div className="inst-grid">
        <section className="inst-pane" aria-label="Instructions" tabIndex={0}>
          <p className="inst-why-top"><Rich text={step.why} /></p>
          <a className="btn inst-official" href={step.official.url} {...ext}>Official site: {step.official.label} &#8599;</a>

          {step.before && (
            <div className="inst-verify before">
              <b>{step.before.title}</b>
              <div><Rich text={step.before.text} /></div>
              {step.before.cmds?.map((c) => <CmdLine key={c} cmd={c} />)}
              <div className="inst-expect"><span>Result</span> <Rich text={step.before.expect} /></div>
            </div>
          )}

          {step.os && (
            <div className="inst-tabs" role="tablist" aria-label="Your operating system">
              {OS_LIST.map((o) => (
                <button key={o.id} type="button" role="tab" aria-selected={o.id === os} className={'inst-tab' + (o.id === os ? ' on' : '')} onClick={() => setOS(o.id)}>{o.label}</button>
              ))}
            </div>
          )}

          {guide && <div className="inst-os" key={step.os ? os : 'all'}>
            {step.os && !guide.title && <h3 className="inst-h">{osName}</h3>}
            {step.os && guide.title && <h3 className="inst-h">{guide.title} <span className="inst-os-tag">{osName}</span></h3>}
            {!step.os && <h3 className="inst-h">Steps</h3>}
            {guide.intro && <p className="inst-intro"><Rich text={guide.intro} /></p>}
            <Steps steps={guide.steps} />
            {guide.verify && <VerifyBox v={guide.verify} />}
            <Warnings items={guide.warnings} />
          </div>}

          {step.more?.map((s) => <div className="inst-os" key={s.title}><Block g={s} /></div>)}

          {step.fallback && (
            <details className="inst-fallback">
              <summary>{step.fallback.title}</summary>
              <p className="inst-intro">{step.fallback.intro}</p>
              <Steps steps={step.fallback.steps} />
              <Warnings items={step.fallback.warnings} title="Keep your token safe" />
            </details>
          )}

          <Warnings items={step.warnings} title="Common mistakes" />

          {step.detailsButton && (
            <button type="button" className="btn ghost inst-details" onClick={() => askDetails()}>
              {filled ? 'Edit your details' : 'Optional: save your details'} (press U)
            </button>
          )}

          <p className="inst-stuck">Stuck? Raise your hand, or use <a className="inst-link" href="#/codespaces">Plan B: GitHub Codespaces</a>.</p>

          <nav className="inst-nav" aria-label="Step navigation">
            {prev && <a className="btn ghost" href={hrefOf(prev.id)}>&larr; Previous</a>}
            {next && <a className="btn" href={hrefOf(next.id)}>Next &rarr;</a>}
          </nav>
        </section>

        <aside className="inst-side" aria-label="Video">
          <InstallVideo id={id} os={os} />
          <p className="inst-video-cap">Step {n} of {INSTALL_COUNT}: {step.title}{step.os ? ` (${osName})` : ''}</p>
        </aside>
      </div>
    </div>
  )
}

