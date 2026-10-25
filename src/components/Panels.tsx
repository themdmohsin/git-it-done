import { LayoutGroup, motion } from 'framer-motion'
import { applyOps, emptyRepo } from '../engine/reducer'
import type { FileStage, GraphOp } from '../engine/types'

/* ---- Working folder -> Staging -> Repository ---- */
const BOXES: { id: FileStage; label: string }[] = [
  { id: 'working', label: 'Working folder' },
  { id: 'staging', label: 'Staging area' },
  { id: 'repo', label: 'Repository' },
]
const ARROW_LABELS = ['git add', 'git commit']

export function FileStrip({ stage, instant, big = false }: { stage: FileStage; instant: boolean; big?: boolean }) {
  return (
    <LayoutGroup>
      <div className={'strip' + (big ? ' big' : '')}>
        {BOXES.map((b, i) => (
          <div className="strip-wrap" key={b.id}>
            {i > 0 && (
              <span className="strip-arrow" aria-hidden>
                {big && <small>{ARROW_LABELS[i - 1]}</small>}
                {'\u2192'}
              </span>
            )}
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

/* ---- A small finished repository, used as an illustration ---- */
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
export const AMBIENT_REPO = AMBIENT.reduce(applyOps, emptyRepo)
