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
  /** Commit-card strip: where the file chip sits after this step. */
  file?: FileStage
  /** Timeline cards: label revealed by this step. */
  label?: string
}

export type CmdText = string | { label?: string; byOS: Record<OS, string> }
export type TransitionKind = 'slide' | 'drop' | 'split' | 'converge' | 'launch' | 'zoom'

export interface Card {
  id: string
  kicker: string
  title: string
  sentence: string
  bullets?: string[]
  byline?: string
  note?: string
  tryIt?: string
  view: 'title' | 'timeline' | 'terminal' | 'challenge'
  lane: 'main' | 'branch'
  hash: string
  into?: TransitionKind
  strip?: boolean
  steps: Step[]
  drawer: {
    install?: boolean
    commands: CmdText[]
    mistakes: { title: string; fix: string }[]
    happening: string
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

