import { useState, type ReactNode } from 'react'
import { Cmd, CopyButton } from '../components/Copy'
import { Linkify } from '../components/Linkify'
import { guideHref, useGuideSlug } from './router'
import { neighbours, sectionOf } from './sections'

/* ---------- page scaffolding ---------- */

export function PageHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: ReactNode }) {
  return (
    <header className="doc-head">
      <div className="doc-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p className="doc-lead">{lead}</p>
    </header>
  )
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="doc-section">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  )
}

/* ---------- callouts (flat, left-accent bar, not boxed cards) ---------- */

type CalloutTone = 'note' | 'warn' | 'tip'
export function Callout({ tone = 'note', title, children }: { tone?: CalloutTone; title?: string; children: ReactNode }) {
  return (
    <div className={'doc-callout tone-' + tone}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  )
}

/* ---------- copyable commands ---------- */


/** A block of one or more terminal commands. Every line and the whole block can be copied. */
export function CodeBlock({ commands, title }: { commands: string[]; title?: string }) {
  const full = commands.join('\n')
  return (
    <div className="doc-code">
      <div className="doc-code-bar">
        <span>{title ?? 'Terminal'}</span>
        {commands.length > 1 && <CopyButton text={full} label="Copy all" className="doc-copy" />}
      </div>
      <div className="doc-code-body">
        {commands.map((c, i) => (
          <div className="doc-code-line" key={i}>
            <code><Cmd text={c} /></code>
            <CopyButton text={c} className="doc-copy" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- screenshots (clean, obvious, easy to replace) ---------- */

export function Shot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [ok, setOk] = useState(true)
  const path = import.meta.env.BASE_URL + 'img/contrib/' + src
  return (
    <figure className="doc-shot">
      {ok ? (
        <img src={path} alt={alt} onError={() => setOk(false)} loading="lazy" />
      ) : (
        <div className="doc-shot-missing" role="img" aria-label={alt}>
          <strong>Screenshot placeholder</strong>
          <span>{alt}</span>
          <code>public/img/contrib/{src}</code>
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

/* ---------- common mistakes / troubleshooting (native disclosure, no extra JS) ---------- */

export function Mistakes({ items, title = 'Common mistakes' }: { items: { title: string; fix: string }[]; title?: string }) {
  return (
    <Section title={title}>
      <div className="doc-mistakes">
        {items.map((m) => (
          <details key={m.title} className="doc-detail">
            <summary>{m.title}</summary>
            <p><Linkify text={m.fix} /></p>
          </details>
        ))}
      </div>
    </Section>
  )
}

/* ---------- expected result ---------- */

export function Expect({ children }: { children: ReactNode }) {
  return (
    <div className="doc-expect">
      <strong>Expected result</strong>
      <div>{children}</div>
    </div>
  )
}

/* ---------- prev / next footer ---------- */

export function NextUp({ override }: { override?: { label: string; slug: string } }) {
  const slug = useGuideSlug()
  const { prev, next } = neighbours(slug)
  return (
    <nav className="doc-nextup" aria-label="Guide navigation">
      <a className="doc-nextup-link" href={prev ? guideHref(prev.slug) : guideHref()}>
        <span>{prev ? 'Previous' : 'Guide home'}</span>
        <strong>{prev ? prev.short : 'Overview'}</strong>
      </a>
      {(override || next) && (
        <a className="doc-nextup-link next" href={guideHref(override ? override.slug : next!.slug)}>
          <span>Next</span>
          <strong>{override ? override.label : next!.short}</strong>
        </a>
      )}
    </nav>
  )
}

export function Crumb() {
  const slug = useGuideSlug()
  const meta = sectionOf(slug)
  return (
    <div className="doc-crumb">
      <a href={guideHref()}>Guide</a>
      <span aria-hidden>/</span>
      <span>{meta?.group ?? 'Overview'}</span>
    </div>
  )
}

export function ChallengeSteps({ current }: { current: string }) {
  const steps = [
    { slug: 'challenge/start', label: 'Start here' },
    { slug: 'challenge/task', label: 'Find your task' },
    { slug: 'challenge/complete', label: 'Complete the task' },
    { slug: 'challenge/submit', label: 'Submit your PR' },
    { slug: 'challenge/verify', label: 'Verify submission' },
    { slug: 'challenge/troubleshooting', label: 'Troubleshooting' },
  ]
  return (
    <ol className="doc-challenge-steps">
      {steps.map((s, i) => (
        <li key={s.slug} className={s.slug === current ? 'on' : ''}>
          <a href={guideHref(s.slug)}>
            <span className="num">{i + 1}</span>
            {s.label}
          </a>
        </li>
      ))}
    </ol>
  )
}

export function Pending({ children }: { children: ReactNode }) {
  return <span className="doc-pending">PENDING: {children}</span>
}

/** Renders a real link once `href` is configured, otherwise a clearly-marked pending badge. */
export function ConfigLink({ href, label, pendingLabel }: { href: string; label: string; pendingLabel: string }) {
  return href.trim() ? (
    <a className="inline" href={href} target="_blank" rel="noreferrer">{label}</a>
  ) : (
    <Pending>{pendingLabel}</Pending>
  )
}
