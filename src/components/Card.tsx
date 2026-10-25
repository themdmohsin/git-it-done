import { useMemo } from 'react'
import { cards } from '../cards'
import { fileStage, replay } from '../engine/reducer'
import { TERMINAL_NAME, useOS } from '../os'
import { CommandChip } from './Copy'
import { Graph } from './Graph'
import { OSPicker } from './OSPicker'
import { AmbientGraph, FileStrip, Timeline } from './Panels'
import { Terminal } from './Terminal'

export interface CardProps {
  cardIdx: number
  done: number      // steps started
  applied: number   // steps whose graph op has landed
  playing: boolean
  instant: boolean
  onStepDone: () => void
}

export function Card({ cardIdx, done, applied, playing, instant, onStepDone }: CardProps) {
  const card = cards[cardIdx]
  const { os } = useOS()
  const repo = useMemo(() => replay(cards, cardIdx, applied), [cardIdx, applied])

  let panel
  if (card.view === 'title') panel = <div className="panel center"><AmbientGraph /></div>
  else if (card.view === 'timeline') panel = <div className="panel center"><Timeline steps={card.steps} shown={applied} instant={instant} /></div>
  else if (card.view === 'challenge') {
    panel = (
      <div className="panel challenge">
        <div className="ghost"><Graph repo={repo} instant /></div>
        <span className="challenge-label">Start challenge</span>
        <button className="btn" disabled>Coming soon</button>
      </div>
    )
  } else {
    panel = (
      <div className="panel split">
        <Terminal steps={card.steps.slice(0, done)} playing={playing} onDone={onStepDone} />
        <div className="graph-area">
          {card.strip && <FileStrip stage={fileStage(card, applied)} instant={instant} />}
          <Graph repo={repo} instant={instant} />
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-left">
        <div className="kicker">{card.kicker}</div>
        <h1>{card.title}</h1>
        <p className="sentence">{card.sentence}</p>
        {card.byline && <p className="byline">{card.byline}</p>}
        {card.bullets && (
          <ul className="bullets">
            {card.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
        {card.note && <div className="note-chip">{card.note}</div>}
        {card.view === 'title' && <OSPicker />}
        {card.tryIt && <CommandChip label={'Try it · ' + TERMINAL_NAME[os]} cmd={card.tryIt} />}
      </div>
      <div className="card-right">{panel}</div>
    </div>
  )
}

