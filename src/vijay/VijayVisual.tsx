import type { VijayVisualId } from '../engine/types'
import { GraphView } from './BranchGraph'
import { MergeTriptych } from './MergeTriptych'
import {
  BRANCH_LAYOUT,
  BRANCH_SCENES,
  COMMIT_LAYOUT,
  COMMIT_SCENES,
  CREATE_LAYOUT,
  CREATE_SCENES,
  WHY_LAYOUT,
  WHY_SCENES,
} from './scenes'
import './vijay.css'

/**
 * The visual component of each branching card.
 * All five cards share one Git commit graph component (BranchGraph)
 * for complete visual continuity across the entire branching section.
 */
export function VijayVisual({
  visual,
  applied,
  instant,
}: {
  visual: VijayVisualId
  applied: number
  instant: boolean
}) {
  switch (visual) {
    case 'why':
    case 'why-branch':
    case 'problems':
      return <GraphView scene={WHY_SCENES[Math.min(applied, WHY_SCENES.length - 1)]} layout={WHY_LAYOUT} instant={instant} />
    case 'branches':
    case 'branch-what':
      return <GraphView scene={BRANCH_SCENES[Math.min(applied, BRANCH_SCENES.length - 1)]} layout={BRANCH_LAYOUT} instant={instant} />
    case 'create':
    case 'branch-create':
    case 'switcher':
      return <GraphView scene={CREATE_SCENES[Math.min(applied, CREATE_SCENES.length - 1)]} layout={CREATE_LAYOUT} instant={instant} />
    case 'commit':
    case 'branch-work':
      return <GraphView scene={COMMIT_SCENES[Math.min(applied, COMMIT_SCENES.length - 1)]} layout={COMMIT_LAYOUT} instant={instant} />
    case 'merge-triptych':
      return <MergeTriptych />
    default:
      return <GraphView scene={WHY_SCENES[Math.min(applied, WHY_SCENES.length - 1)]} layout={WHY_LAYOUT} instant={instant} />
  }
}
