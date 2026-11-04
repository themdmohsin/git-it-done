import { useEffect, useMemo } from 'react'
import { cards } from '../cards'
import { fileStage, replay } from '../engine/reducer'
import { Compare, Hero, OSTiles, LinusPanel, MessyShot, MuktiPanel, RemoteArt, SetupPanel, ShotFigure, StoryArt, StubPanel } from './Art'
import { CommandChip } from './Copy'
import { Graph } from './Graph'
import { FileStrip } from './Panels'
import { Terminal } from './Terminal'
import { VijayVisual } from '../vijay/VijayVisual'
import { resolveCard } from '../osCards'
import { useOS } from '../os'
import { askDetails, useUserDetails } from '../userDetails'

export interface CardProps {
  cardIdx: number
  done: number      // steps started
  applied: number   // steps whose graph op has landed
  playing: boolean
  instant: boolean
  onStepDone: () => void
  /** Drawn as a card with a frame, while it is part of a zoomed-out stack. */
  framed?: boolean
}

/** Keeps a command option such as --version in one piece when a line wraps. */
const nb = (s: string) => s.replace(/--(?=\w)/g, '--\u2060')

/** Renders `backtick` tokens inside note/final text as a small ref pill (e.g. `main`). */
const richText = (s: string) => nb(s).split(/`([^`]+)`/g).map((p, i) => (i % 2 ? <code key={i} className="ref-pill">{p}</code> : p))

export function Card({ cardIdx, done, applied, playing, instant, onStepDone, framed = false }: CardProps) {
  const { os } = useOS()
  const { filled } = useUserDetails()
  const card = useMemo(() => resolveCard(cards[cardIdx], os), [cardIdx, os])
  const repo = useMemo(() => replay(cards, cardIdx, applied), [cardIdx, applied])

  // A reset step ("fresh") types nothing: finish it at once so it never costs an extra press.
  const lastStep = card.steps[done - 1]
  useEffect(() => { if (playing && lastStep?.fresh) onStepDone() }, [playing, lastStep, onStepDone])
  // The terminal restarts after the latest reset step.
  let from = 0
  card.steps.slice(0, done).forEach((st, i) => { if (st.fresh) from = i + 1 })

  let panel
  switch (card.view) {
    case 'messy':
      panel = <div className="panel shotpanel"><MessyShot /></div>
      break
    case 'hero':
      panel = <div className="panel center"><Hero word={card.hero ?? ''} /></div>
      break
    case 'story':
      if (card.art === 'linus') panel = <LinusPanel picture={card.picture} />
      else if (card.tagline || card.links) panel = <MuktiPanel tagline={card.tagline} links={card.links} />
      else if (card.picture) panel = <div className="panel shotpanel"><ShotFigure picture={card.picture} /></div>
      else panel = <div className="panel center">{card.art && <StoryArt art={card.art} />}</div>
      break
    case 'fullshot':
      panel = null
      break
    case 'compare':
      panel = <div className="panel center"><Compare /></div>
      break
    case 'areas':
      panel = (
        <div className="panel areas">
          <FileStrip stage={fileStage(card, applied)} instant={instant} big />
          <div className="areas-caption" key={applied}>{applied > 0 ? card.steps[applied - 1].label : 'Press Space to follow one file'}</div>
        </div>
      )
      break
    case 'remote':
      panel = <div className="panel center"><RemoteArt /></div>
      break
    case 'setup':
      panel = <div className="panel"><SetupPanel steps={card.steps} shown={applied} /></div>
      break
    case 'oschoice':
      panel = <div className="panel os-tiles-panel"><OSTiles /></div>
      break
    case 'stub':
      panel = <div className="panel center"><StubPanel /></div>
      break
    case 'vijay':
      panel = <div className="panel vj-panel"><VijayVisual visual={card.visual ?? 'why'} applied={applied} instant={instant} /></div>
      break
    case 'challenge':
      panel = (
        <div className="panel challenge">
          <div className="ghost"><Graph repo={repo} instant /></div>
          <span className="challenge-label">Start challenge</span>
          <button className="btn" disabled>Coming soon</button>
        </div>
      )
      break
    default:
      panel = card.hideGraph ? (
        <div className="panel terminal-only">
          <Terminal key={from} steps={card.steps.slice(from, done)} playing={playing} onDone={onStepDone} repo={card.termRepo} />
        </div>
      ) : (
        <div className={'panel split' + (card.strip ? ' has-strip' : '') + (card.visual ? ' vj-split' : '')}>

          <Terminal key={from} steps={card.steps.slice(from, done)} playing={playing} onDone={onStepDone} repo={card.termRepo} />
          <div className="graph-area">
            {card.strip && <FileStrip stage={fileStage(card, applied)} instant={instant} />}
            <div className="graph-wrap">
              {card.noGraph ? <div className="graph-empty">{card.noGraph}</div>
                : card.visual ? <VijayVisual visual={card.visual} applied={applied} instant={instant} />
                : <Graph repo={repo} instant={instant} compact={!!card.strip} />}
              {!card.visual && !card.noGraph && repo.commits.length === 0 && <div className="graph-empty">No commits yet</div>}
            </div>
          </div>
        </div>
      )
  }

  if (card.view === 'fullshot' && card.picture) {
    return (
      <div className={'card fullshot' + (framed ? ' framed' : '')}>
        <div className="fs-head">
          <div className="kicker">{card.kicker}</div>
          <h1>{card.title}</h1>
          <p className="sentence">{card.sentence}</p>
        </div>
        <ShotFigure picture={card.picture} />
      </div>
    )
  }

  const weight = card.sentence.length + (card.bullets ?? []).join('').length + (card.note ?? '').length
    + (card.subheading ?? '').length
    + (card.numberedPoints ?? []).map((p) => p.title + p.text).join('').length
    + (card.remember ? card.remember.heading + card.remember.lines.map((l) => l.label + l.text).join('') : '').length
  const dense = (card.view === 'story' && weight > 260) || card.view === 'vijay' || card.section === 'workshop' || !!card.visual
  const vjWide = card.view === 'vijay' || !!card.visual

  return (
    <div data-card-id={card.id} className={'card' + (framed ? ' framed' : '') + (card.view === 'messy' ? ' wide' : '') + (dense ? ' dense' : '') + (vjWide ? ' vj-wide' : '') + (card.section === 'workshop' && card.view === 'terminal' ? ' wide-left' : '') + (card.chips ? ' wider-left' : '')}>
      <div className="card-left">
        <div className={'kicker' + (card.bigKicker ? ' big' : '')}>{card.kicker}</div>
        <h1>{card.title}</h1>
        {card.subheading && <p className="subheading">{nb(card.subheading)}</p>}
        <p className="sentence">{nb(card.sentence)}</p>
        {card.bullets && (
          <ul className="bullets">
            {card.bullets.map((b) => <li key={b}>{nb(b)}</li>)}
          </ul>
        )}
        {card.numberedPoints && (
          <div className="numbered-points">
            {card.numberedPoints.map((p) => (
              <div className="numbered-point" key={p.number}>
                <span className={'numbered-badge' + (p.badgeTone === 'main' ? ' tone-main' : '')}>{p.number}</span>
                <div className="numbered-point-body">
                  {p.code ? <code className="numbered-point-cmd">{p.title}</code> : <div className="numbered-point-title">{p.title}</div>}
                  <div className="numbered-point-text">{nb(p.text)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {card.note && <div className="note-chip">{richText(card.note)}</div>}
        {card.remember && (
          <div className="remember-box">
            <div className="remember-heading">{card.remember.heading}</div>
            {card.remember.lines.map((l) => (
              <div className="remember-line" key={l.label}><strong>{l.label}</strong> = {l.text}</div>
            ))}
          </div>
        )}
        {card.calloutBox && (
          <div className="remember-box">
            <div className="remember-heading">{card.calloutBox.heading}</div>
            <div className="remember-line">{nb(card.calloutBox.text)}</div>
          </div>
        )}
        {card.labelsPanel && (
          <div className="labels-panel">
            <div className="labels-panel-heading">
              <span className="labels-panel-icon" aria-hidden="true">&#128269;</span>
              {card.labelsPanel.heading}
            </div>
            <div className="labels-panel-row">
              {card.labelsPanel.labels.map((l) => (
                <span key={l.text} className="label-pill" style={{ color: l.color, borderColor: l.color }}>{l.text}</span>
              ))}
            </div>
          </div>
        )}
        {card.final && <div className="final-chip">{card.final}</div>}
        {card.tryIt && <CommandChip label="Try it" cmd={card.tryIt} />}
        {card.chips && (
          <div className="chip-stack">
            {card.chips.map((c) => <CommandChip key={c} cmd={c} />)}
          </div>
        )}
        {card.detailsButton && (
          <button className="btn details-btn" onClick={() => askDetails()}>
            {filled ? 'Edit your details' : 'Add your details'} (press U)
          </button>
        )}
        {card.aside && <a className="aside-link" href={card.aside.href}>{card.aside.text} &rarr;</a>}
        {card.cta && <a className={'btn cta-btn' + (card.id === 'ready' ? ' big' : '')} href={card.cta.href}>{card.cta.label} &rarr;</a>}
      </div>
      <div className="card-right">{panel}</div>
    </div>
  )
}
