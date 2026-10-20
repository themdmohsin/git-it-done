import { useEffect, useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { applyOps, emptyRepo } from '../engine/reducer'
import type { FileStage, GraphOp, Step } from '../engine/types'
import { Graph } from './Graph'

/* ---- Origin timeline ---- */
export function Timeline({ steps, shown, instant, burst }: { steps: Step[]; shown: number; instant: boolean; burst: number }) {
  const reduce = useReducedMotion()
  return (
    <div className="timeline">
      <div className="tl-track">
        {steps.map((s, i) => {
          const on = i < shown
          const accent = i >= 2
          return (
            <div className="tl-item" key={i}>
              {i > 0 && (
                <motion.div
                  className="tl-seg"
                  initial={false}
                  animate={{ scaleX: on ? 1 : 0 }}
                  transition={{ duration: instant || reduce ? 0 : 0.5, ease: 'easeOut' }}
                />
              )}
              <motion.div
                className="tl-node"
                style={{ background: accent ? 'var(--lane-feature)' : 'var(--lane-main)' }}
                initial={false}
                animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
                transition={instant || reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 15, delay: 0.3 }}
              />
              <motion.div
                className="tl-label"
                initial={false}
                animate={{ opacity: on ? 1 : 0, y: on ? 0 : 12 }}
                transition={{ duration: instant || reduce ? 0 : 0.4, delay: instant ? 0 : 0.4 }}
              >
                {s.label}
              </motion.div>
            </div>
          )
        })}
      </div>
      {burst > 0 && (
        <motion.div
          key={burst} className="xp-pop"
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 1], y: [0, -10, -30, -50] }}
          transition={{ duration: 2.2, times: [0, 0.15, 0.7, 1] }}
        >
          +50 XP
        </motion.div>
      )}
    </div>
  )
}

/* ---- Commit card: Working folder -> Staging -> Repository ---- */
const BOXES: { id: FileStage; label: string }[] = [
  { id: 'working', label: 'Working folder' },
  { id: 'staging', label: 'Staging' },
  { id: 'repo', label: 'Repository' },
]
export function FileStrip({ stage, instant }: { stage: FileStage; instant: boolean }) {
  return (
    <LayoutGroup>
      <div className="strip">
        {BOXES.map((b, i) => (
          <div className="strip-wrap" key={b.id}>
            {i > 0 && <span className="strip-arrow" aria-hidden>→</span>}
            <div className={'strip-box' + (stage === b.id ? ' on' : '')}>
              <span className="strip-label">{b.label}</span>
              {stage === b.id && (
                <motion.span
                  layoutId="file-chip" className="file-chip"
                  initial={instant ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={instant ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 22 }}
                >
                  notes.txt
                </motion.span>
              )}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  )
}

/* ---- Title card: calm looping graph ---- */
const AMBIENT: GraphOp[] = [
  { type: 'init' },
  { type: 'commit', branch: 'main', id: '1a2b3c4', msg: 'add notes' },
  { type: 'commit', branch: 'main', id: '5d6e7f8', msg: 'add second line' },
  { type: 'createBranch', name: 'feature' },
  { type: 'switchBranch', name: 'feature' },
  { type: 'commit', branch: 'feature', id: '7b2d410', msg: 'add login page' },
  { type: 'switchBranch', name: 'main' },
  { type: 'commit', branch: 'main', id: '3e9a0b2', msg: 'fix typo' },
  { type: 'merge', from: 'feature', into: 'main', id: '9c4f1de' },
]
export function AmbientGraph() {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? AMBIENT.length : 0)
  useEffect(() => {
    if (reduce) return
    const t = window.setTimeout(() => setN((k) => (k >= AMBIENT.length ? 0 : k + 1)), n >= AMBIENT.length ? 3200 : n === 0 ? 900 : 1300)
    return () => clearTimeout(t)
  }, [n, reduce])
  const repo = AMBIENT.slice(0, n).reduce(applyOps, emptyRepo)
  return <Graph repo={repo} instant={false} />
}
