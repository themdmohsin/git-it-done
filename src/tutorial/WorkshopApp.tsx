import { Fragment, useEffect, useState, type ReactNode } from 'react'
import '../contrib/contrib.css'
import './tutorial.css'
import { cards } from '../cards'
import { Rich } from '../components/Install'
import { copyText } from '../components/Copy'
import { Callout, Mistakes, PageHeader, Section } from '../contrib/ui'
import { STAGES, STAGE_BY_SLUG, WHERE, type Action, type Shot, type Stage, type Where } from './stages'
import { useWorkshopSlug, workshopHref } from './router'

/** The presentation card that follows the setup, used by "Back to the workshop". */
const afterSetup = () => {
  const i = cards.findIndex((c) => c.id === 'ready')
  return '#/' + (cards[i + 1]?.id ?? 'ready')
}
const BACK_TO_SETUP = '#/ready'

/* ---------- small pieces ---------- */
const isShellCommand = (s: string) => /^(git|gh|code)\b/.test(s)

function Copyable({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  const cmd = isShellCommand(text)
  return (
    <div className={'tut-cmd' + (cmd ? ' is-cmd' : '')}>
      <code>{text}</code>
      <button type="button" className="doc-copy" aria-label={'Copy ' + text} onClick={() => { copyText(text); setDone(true); setTimeout(() => setDone(false), 1200) }}>
        {done ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function Tag({ where }: { where: Where }) {
  return <span className={'tut-tag ' + where} title={WHERE[where].hint}>{WHERE[where].label}</span>
}

function Figure({ shot }: { shot: Shot }) {
  const [ok, setOk] = useState(true)
  const src = import.meta.env.BASE_URL + 'img/workshop/' + shot.file
  return (
    <figure className="doc-shot tut-shot">
      {ok ? (
        <a href={src} target="_blank" rel="noopener noreferrer" aria-label={'Open full size: ' + shot.alt}>
          <img src={src} alt={shot.alt} width={1920} height={1080} loading="lazy" onError={() => setOk(false)} />
        </a>
      ) : (
        <div className="doc-shot-missing" role="img" aria-label={shot.alt}><strong>Screenshot unavailable</strong><span>{shot.alt}</span></div>
      )}
      <figcaption>{shot.caption}</figcaption>
    </figure>
  )
}

/** Actions in order, with each screenshot placed right after the action it illustrates. */
function Steps({ stage }: { stage: Stage }) {
  const blocks: ReactNode[] = []
  let run: { a: Action; i: number }[] = []
  const flush = () => {
    if (!run.length) return
    const start = run[0].i + 1
    blocks.push(
      <ol className="tut-steps" key={'o' + start}>
        {run.map(({ a, i }) => (
          <li key={i} data-n={i + 1}>
            <Tag where={a.where} />
            <div className="tut-text"><Rich text={a.text} /></div>
            {a.cmds?.map((c) => <Copyable key={c} text={c} />)}
          </li>
        ))}
      </ol>,
    )
    run = []
  }
  const lastIndex = stage.actions.length
  stage.actions.forEach((a, i) => {
    run.push({ a, i })
    const here = stage.shots.filter((s) => (s.after ?? lastIndex) === i + 1)
    if (here.length) { flush(); here.forEach((s) => blocks.push(<Figure shot={s} key={s.file + i} />)) }
  })
  flush()
  return <>{blocks}</>
}

function Legend() {
  return (
    <div className="tut-legend" aria-label="What the colour tags mean">
      {(Object.keys(WHERE) as Where[]).map((w) => <span key={w}><Tag where={w} /><small>{WHERE[w].hint}</small></span>)}
    </div>
  )
}

function Celebration() {
  return (
    <section className="tut-success" aria-live="polite">
      <div className="tut-confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ ['--i' as string]: i }} />)}</div>
      <div className="tut-trophy" aria-hidden="true">&#127881;</div>
      <h2>Congratulations! You&rsquo;ve just made your first GitHub repository and pushed your first commits!</h2>
      <p>You created a repository, tracked a file, made two commits and uploaded them to GitHub. This is the loop you will use for every project from now on.</p>
      <div className="tut-success-actions">
        <a className="btn" href={afterSetup()}>Back to the workshop &rarr;</a>
        <a className="btn ghost" href="#/keep-going">Where to practise next</a>
      </div>
    </section>
  )
}

/* ---------- pages ---------- */
function StageNav({ n }: { n: number }) {
  const prev = STAGES[n - 2]
  const next = STAGES[n]
  return (
    <nav className="doc-nextup" aria-label="Tutorial navigation">
      <a className="doc-nextup-link" href={prev ? workshopHref(prev.slug) : workshopHref()}>
        <span>Previous</span>
        <strong>{prev ? `Stage ${prev.n}: ${prev.short}` : 'Tutorial overview'}</strong>
      </a>
      {next ? (
        <a className="doc-nextup-link next" href={workshopHref(next.slug)}>
          <span>Next</span>
          <strong>{`Stage ${next.n}: ${next.short}`}</strong>
        </a>
      ) : (
        <a className="doc-nextup-link next" href={afterSetup()}>
          <span>Finished</span>
          <strong>Back to the workshop</strong>
        </a>
      )}
    </nav>
  )
}

function StagePage({ stage }: { stage: Stage }) {
  return (
    <div className="doc-content tut-content">
      <div className="doc-crumb"><a href={workshopHref()}>Tutorial</a><span aria-hidden>/</span><span>Stage {stage.n} of {STAGES.length}</span></div>
      <PageHeader eyebrow={`Stage ${stage.n} of ${STAGES.length}`} title={stage.title} lead={<Rich text={stage.why} />} />
      <Legend />
      <Section title="Do this">
        <Steps stage={stage} />
      </Section>
      <div className="doc-expect"><strong>What you should see</strong><div><Rich text={stage.expect} /></div></div>
      {stage.explain && (
        <Section title={stage.explain.title}>
          <ul>{stage.explain.items.map((t) => <li key={t}><Rich text={t} /></li>)}</ul>
        </Section>
      )}
      {stage.callouts?.map((c) => <Callout key={c.title} tone={c.tone} title={c.title}><Rich text={c.text} /></Callout>)}
      {stage.mistakes && <Mistakes items={stage.mistakes.map((m) => ({ title: m.title, fix: m.fix }))} title="If something goes wrong" />}
      {stage.n === STAGES.length && <Celebration />}
      <StageNav n={stage.n} />
    </div>
  )
}

function Overview() {
  return (
    <div className="doc-content tut-content">
      <PageHeader
        eyebrow="Git It Done · Hands-on tutorial"
        title="Let’s Build Something with Git"
        lead="You have installed everything. Now you will use it: make a project, save two versions of it with Git, and put it on GitHub for the world to see. It takes about 30 minutes."
      />
      <Section title="What you will do">
        <ol className="tut-tiles">
          {STAGES.map((s) => (
            <li key={s.slug}>
              <a href={workshopHref(s.slug)}>
                <span className="tn">{s.n}</span>
                <span className="tt">{s.short}</span>
              </a>
            </li>
          ))}
        </ol>
      </Section>
      <Section title="Before you start">
        <p>This tutorial assumes the setup is already done: Visual Studio Code, Git, a GitHub account, GitHub CLI (logged in) and your Git identity. If any of that is missing, go back to the <a className="inline" href="#/os">installation steps</a> first.</p>
      </Section>
      <Section title="How to read each stage">
        <p>Every instruction is tagged so you always know <strong>where</strong> to do it:</p>
        <Legend />
        <p>Commands have a <strong>Copy</strong> button. Paste them into the terminal and press <kbd>Enter</kbd>. After each stage, check <strong>What you should see</strong> before moving on.</p>
        <Callout tone="note" title="About the screenshots">
          They are annotated illustrations of the GitHub and VS Code screens, drawn for this tutorial. The terminal text in them is real Git output.
          Your colours or menus may look a little different, and your username replaces <code className="inst-inline">USERNAME</code>.
        </Callout>
      </Section>
      <p><a className="btn" href={workshopHref('1')}>Start Stage 1 &rarr;</a></p>
    </div>
  )
}

/* ---------- shell ---------- */
export function WorkshopApp() {
  const slug = useWorkshopSlug()
  const [sideOpen, setSideOpen] = useState(false)
  const stage = STAGE_BY_SLUG[slug]

  useEffect(() => {
    document.documentElement.classList.add('guide-mode')
    const old = document.title
    document.title = 'Hands-on tutorial · Git It Done'
    return () => { document.documentElement.classList.remove('guide-mode'); document.title = old }
  }, [])
  useEffect(() => { window.scrollTo(0, 0); setSideOpen(false) }, [slug])

  return (
    <div className="contrib-app tut">
      <header className="doc-top">
        <button className="doc-burger" onClick={() => setSideOpen((v) => !v)} aria-label="Toggle stage list" aria-expanded={sideOpen}>Stages</button>
        <a className="doc-brand" href={workshopHref()}><b>Git It Done</b> Hands-on tutorial</a>
        <div className="doc-top-spacer" />
        <ol className="tut-pills" aria-label="Stages">
          {STAGES.map((s) => (
            <li key={s.slug}><a className={slug === s.slug ? 'on' : ''} href={workshopHref(s.slug)} aria-current={slug === s.slug ? 'page' : undefined} title={s.title}>{s.n}</a></li>
          ))}
        </ol>
        <a className="doc-back" href={BACK_TO_SETUP}>&larr; Back to the workshop</a>
      </header>
      <div className="doc-body">
        <nav className={'doc-side' + (sideOpen ? ' open' : '')} aria-label="Tutorial stages">
          <div className="doc-side-group">
            <h3>Tutorial</h3>
            <ul>
              <li><a className={slug === '' ? 'on' : ''} href={workshopHref()} aria-current={slug === '' ? 'page' : undefined}>Overview</a></li>
              {STAGES.map((s) => (
                <Fragment key={s.slug}>
                  <li><a className={slug === s.slug ? 'on' : ''} href={workshopHref(s.slug)} aria-current={slug === s.slug ? 'page' : undefined}>{s.n}. {s.short}</a></li>
                </Fragment>
              ))}
            </ul>
          </div>
        </nav>
        <main className="doc-main" id="main">
          {stage ? <StagePage stage={stage} /> : <Overview />}
        </main>
      </div>
    </div>
  )
}
