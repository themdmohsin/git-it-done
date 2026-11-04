import type { VijayVisualId } from '../engine/types'
import { GraphView } from './BranchGraph'
import {
  BRANCH_LAYOUT,
  BRANCH_SCENES,
  COMMIT_LAYOUT,
  COMMIT_SCENES,
  CREATE_LAYOUT,
  CREATE_SCENES,
  MERGE_LAYOUT,
  MERGE_SCENES,
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
      return <GraphView scene={WHY_SCENES[Math.min(applied, WHY_SCENES.length - 1)]} layout={WHY_LAYOUT} instant={instant} />
    case 'branches':
      return <GraphView scene={BRANCH_SCENES[Math.min(applied, BRANCH_SCENES.length - 1)]} layout={BRANCH_LAYOUT} instant={instant} />
    case 'create':
      return <GraphView scene={CREATE_SCENES[Math.min(applied, CREATE_SCENES.length - 1)]} layout={CREATE_LAYOUT} instant={instant} />
    case 'commit':
      return <GraphView scene={COMMIT_SCENES[Math.min(applied, COMMIT_SCENES.length - 1)]} layout={COMMIT_LAYOUT} instant={instant} />
    case 'merge':
      return <GraphView scene={MERGE_SCENES[Math.min(applied, MERGE_SCENES.length - 1)]} layout={MERGE_LAYOUT} instant={instant} />
    default:
      return <GraphView scene={WHY_SCENES[Math.min(applied, WHY_SCENES.length - 1)]} layout={WHY_LAYOUT} instant={instant} />
  }
}
