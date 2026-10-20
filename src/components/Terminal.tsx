import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { Step } from '../engine/types'
import { REPO, prompt, useOS } from '../os'

const CHAR_MS = 30
const LINE_MS = 220

function Entry({ step, animate, onDone }: { step: Step; animate: boolean; onDone?: () => void }) {
  const { os } = useOS()
  const reduce = useReducedMotion()
  const [n, setN] = useState(animate ? 0 : step.cmd.length)
  const [o, setO] = useState(animate ? 0 : step.output.length)
  const cb = useRef(onDone)
  cb.current = onDone

  useEffect(() => {
    if (!animate) return
    const timers: number[] = []
    const t = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))
    if (reduce) {
      setN(step.cmd.length); setO(step.output.length)
      t(() => cb.current?.(), 200)
      return () => timers.forEach(clearTimeout)
    }
    let i = 0
    const iv = window.setInterval(() => {
      i++
      setN(i)
      if (i >= step.cmd.length) {
        clearInterval(iv)
        const lines = step.output.length
        t(() => {}, 0)
        for (let k = 1; k <= lines; k++) t(() => setO(k), 250 + k * LINE_MS)
        t(() => cb.current?.(), 350 + lines * LINE_MS + 300)
      }
    }, CHAR_MS)
    return () => { clearInterval(iv); timers.forEach(clearTimeout) }
  }, [animate, reduce, step])

  const typing = animate && n < step.cmd.length
  const shownN = animate ? n : step.cmd.length
  const shownO = animate ? o : step.output.length
  return (
    <div className="t-entry">
      <div className="t-line">
        <span className="t-prompt">{prompt(os)} </span>
        <span>{step.cmd.slice(0, shownN)}</span>
        {typing && <span className="t-cursor" />}
      </div>
      {step.output.slice(0, shownO).map((l, i) => (
        <div key={i} className={'t-out' + (animate ? ' fade' : '')}>{l}</div>
      ))}
    </div>
  )
}

export function Terminal({ steps, playing, onDone }: { steps: Step[]; playing: boolean; onDone: () => void }) {
  const { os } = useOS()
  const body = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = inner.current
    if (!el) return
    const ro = new ResizeObserver(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const last = steps.length - 1
  const idle = !playing
  return (
    <div className="terminal">
      <div className="t-bar">
        <span className="dot" style={{ background: 'var(--lane-feature)' }} />
        <span className="dot" style={{ background: 'var(--lane-main)' }} />
        <span className="dot" style={{ background: 'var(--lane-remote)' }} />
        <span className="t-title">{REPO}</span>
      </div>
      <div className="t-body" ref={body}>
        <div ref={inner}>
          {steps.map((s, i) => (
            <Entry key={i} step={s} animate={playing && i === last} onDone={i === last ? onDone : undefined} />
          ))}
          {idle && (
            <div className="t-line">
              <span className="t-prompt">{prompt(os)} </span>
              <span className="t-cursor" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
