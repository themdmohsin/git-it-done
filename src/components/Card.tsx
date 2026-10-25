import { useMemo } from 'react'
import { cards } from '../cards'
import { fileStage, replay } from '../engine/reducer'
import { Compare, Hero, MessyShot, SetupPanel, StoryArt, StubPanel } from './Art'
import { CommandChip } from './Copy'
import { Graph } from './Graph'
import { FileStrip } from './Panels'
import { Terminal } from './Terminal'

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

export function Card({ cardIdx, done, applied, playing, instant, onStepDone, framed = false }: CardProps) {
  const card = cards[cardIdx]
  const repo = useMemo(() => replay(cards, cardIdx, applied), [cardIdx, applied])

  let panel
  switch (card.view) {
    case 'messy':
      panel = <div className="panel shotpanel"><MessyShot /></div>
      break
    case 'hero':
      panel = <div className="panel center"><Hero word={card.hero ?? ''} /></div>
      break
    case 'story':
      panel = <div className="panel center">{card.art && <StoryArt art={card.art} />}</div>
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
    case 'setup':
      panel = <div className="panel"><SetupPanel steps={card.steps} shown={applied} /></div>
      break
    case 'stub':
      panel = <div className="panel center"><StubPanel /></div>
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
      panel = (
        <div className={'panel split' + (card.strip ? ' has-strip' : '')}>
          <Terminal steps={card.steps.slice(0, done)} playing={playing} onDone={onStepDone} />
          <div className="graph-area">
            {card.strip && <FileStrip stage={fileStage(card, applied)} instant={instant} />}
            <div className="graph-wrap">
              <Graph repo={repo} instant={instant} compact={!!card.strip} />
              {repo.commits.length === 0 && <div className="graph-empty">No commits yet</div>}
            </div>
          </div>
        </div>
      )
  }

  return (
    <div className={'card' + (framed ? ' framed' : '') + (card.view === 'messy' ? ' wide' : '')}>
      <div className="card-left">
        <div className="kicker">{card.kicker}</div>
        <h1>{card.title}</h1>
        <p className="sentence">{card.sentence}</p>
        {card.bullets && (
          <ul className="bullets">
            {card.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
        {card.note && <div className="note-chip">{card.note}</div>}
        {card.final && <div className="final-chip">{card.final}</div>}
        {card.tryIt && <CommandChip label="Try it" cmd={card.tryIt} />}
      </div>
      <div className="card-right">{panel}</div>
    </div>
  )
}
