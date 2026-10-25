export type OS = 'windows' | 'macos' | 'linux'

export type GraphOp =
  | { type: 'init' }
  | { type: 'commit'; branch: string; id: string; msg: string }
  | { type: 'createBranch'; name: string }
  | { type: 'switchBranch'; name: string }
  | { type: 'merge'; from: string; into: string; id: string }
  | { type: 'deleteBranch'; name: string }
  | { type: 'addRemote' }
  | { type: 'push'; branch: string }
  | { type: 'none' }

export type FileStage = 'none' | 'working' | 'staging' | 'repo'

export interface Step {
  cmd: string
  output: string[]
  /** One op, or a list applied in order (e.g. 'git switch -c' = createBranch + switchBranch). */
  op: GraphOp | GraphOp[]
  /** File-strip cards: where the file chip sits after this step. */
  file?: FileStage
  /** Short title revealed by this step (strip captions, setup stages). */
  label?: string
  /** Longer text for this step, optionally different per operating system. */
  detail?: string | Record<OS, string>
}

export type CmdText = string | { label?: string; byOS: Record<OS, string> }

/** 'zoomout' and 'peel' are the two stack transitions; the rest are single-card transitions. */
export type TransitionKind = 'slide' | 'drop' | 'split' | 'converge' | 'launch' | 'zoom' | 'zoomout' | 'peel'

/** 'rise' = toward the viewer (springy), 'fly' = up and away. */
export type StackMove = 'rise' | 'fly'

/**
 * Layered cards for one position in the storyline.
 * layers run from BACK to FRONT, so the last entry is the front card.
 * zoomed = the stack is pulled back so the cards behind peek out.
 * enter = how the front card arrives when advancing into this scene.
 * leave = how the front card departs when advancing out of this scene.
 */
export interface StackScene {
  layers: string[]
  front: string
  zoomed: boolean
  enter?: StackMove
  leave?: StackMove
}

export type Section = 'hook' | 'stepback' | 'story' | 'git' | 'part2'
export type Lane = 'main' | 'branch' | 'detour'
export type ArtId = 'ring' | 'kernel' | 'linus' | 'chaos' | 'snapshots' | 'born'

export type View =
  | 'messy' | 'hero' | 'story' | 'compare' | 'areas' | 'setup' | 'terminal' | 'stub' | 'challenge'

export interface Card {
  id: string
  /** Short name shown on the rail and on the stack tabs. */
  rail: string
  section: Section
  kicker: string
  title: string
  sentence: string
  bullets?: string[]
  note?: string
  /** Closing line shown as a highlighted chip (recap card). */
  final?: string
  tryIt?: string
  view: View
  art?: ArtId
  hero?: string
  lane: Lane
  into?: TransitionKind
  scene?: StackScene
  strip?: boolean
  /** Where the file chip starts on strip cards. */
  file0?: FileStage
  steps: Step[]
  drawer: {
    install?: boolean
    commands?: CmdText[]
    mistakes?: { title: string; fix: string }[]
    happening: string
    talking?: string[]
  }
}

export interface Commit { id: string; msg: string; branch: string; parents: string[] }

export interface RepoState {
  initialized: boolean
  commits: Commit[]
  branches: Record<string, string | null>
  head: string
  remote: boolean
  pushed: string[]
  remoteTip: string | null
}

/** One moment of a stack transition. wait = ms to hold before the next frame. */
export interface Frame {
  layers: string[]
  zoomed: boolean
  wait: number
}
