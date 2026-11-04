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
  /** Terminal cards: this step is a reset. The terminal clears and later entries start from an empty screen. */
  fresh?: boolean
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

export type Section = 'hook' | 'stepback' | 'story' | 'git' | 'workshop' | 'part2'
export type Lane = 'main' | 'branch' | 'detour'
export type VijayVisualId =
  | 'why' | 'branches' | 'create' | 'commit' | 'merge'
  | 'why-branch' | 'problems' | 'branch-what' | 'branch-create' | 'switcher' | 'branch-work' | 'branch-merge'
export type ArtId =
  | 'ring' | 'kernel' | 'linus' | 'chaos' | 'snapshots' | 'born' | 'mukti' | 'audience'
  | 'issueLabels' | 'forkFlow' | 'prMock' | 'workflowSteps' | 'challengeSteps'
  | 'githubSignup' | 'codespaces' | 'ready'

export type View =
  | 'messy' | 'hero' | 'story' | 'compare' | 'areas' | 'remote' | 'setup' | 'terminal' | 'stub' | 'challenge' | 'fullshot' | 'vijay' | 'oschoice'

/** A real picture with alt text. credit is shown under it when set. */
export interface Picture { src: string; alt: string; credit?: string; caption?: string }

/** Per operating system overrides for a card. Steps must have the same length on every system. */
export interface OSPart {
  sentence?: string
  bullets?: string[]
  tryIt?: string
  note?: string
  steps?: Step[]
  drawer?: Partial<Card['drawer']>
}

export interface Card {
  id: string
  /** Short name shown on the rail and on the stack tabs. */
  rail: string
  section: Section
  kicker: string
  title: string
  /** Short quoted line shown under the title, above the description (pull-requests card). */
  subheading?: string
  sentence: string
  bullets?: string[]
  /** Numbered explanation points (01, 02, 03...) shown instead of plain bullets (pull-requests card). */
  numberedPoints?: { number: string; title: string; text: string; code?: boolean; badgeTone?: 'accent' | 'main' }[]
  note?: string
  /** Bottom callout box with a heading and a few label/text lines (pull-requests card: "Remember"). */
  remember?: { heading: string; lines: { label: string; text: string }[] }
  /** Bottom callout box with a heading and a single paragraph (fork card: "Why fork?"). */
  calloutBox?: { heading: string; text: string }
  /** Closing line shown as a highlighted chip (recap card). */
  final?: string
  tryIt?: string
  /** A single call-to-action button rendered under the other chips (used to hand off to the contribution guide). */
  cta?: { label: string; href: string }
  /** Show the kicker as large plain text (workshop opener line). */
  bigKicker?: boolean
  /** Mukti card: motto and its translation. */
  tagline?: { text: string; translation: string }
  /** Mukti card: contact links. A missing url is shown as a TODO. */
  links?: { label: string; url?: string }[]
  /** Linus card: photo shown beside the art. fullshot view: the screenshot. */
  picture?: Picture
  view: View
  art?: ArtId
  /** Branching section: which scripted visual to draw (view 'vijay', or beside the terminal on a 'terminal' card). */
  visual?: VijayVisualId
  hero?: string
  lane: Lane
  into?: TransitionKind
  scene?: StackScene
  strip?: boolean
  /** Where the file chip starts on strip cards. */
  file0?: FileStage
  /** Terminal cards whose commands run in a separate practice repo: shows this note instead of the shared Git graph. */
  noGraph?: string
  /** Terminal cards: show only the terminal (the commit graph is hidden). */
  hideGraph?: boolean
  /** Terminal cards: overrides the directory shown in the terminal's title bar (defaults to the shared REPO constant). */
  termRepo?: string
  /** Several copy chips under the bullets (one copy button per command). */
  chips?: string[]
  /** Small link line under the bullets. */
  aside?: { text: string; href: string }
  /** A button that opens the "Your details" window. */
  detailsButton?: boolean
  /** Small boxed panel under the bullets: a heading plus a row of coloured label pills (oss-issues card). */
  labelsPanel?: { heading: string; labels: { text: string; color: string }[] }
  /** Overrides applied for the chosen operating system. */
  os?: Record<OS, OSPart>
  /** Steps are the same on every system, so `steps` is also what the engine counts. */
  steps: Step[]
  drawer: {
    install?: boolean
    /** Exact click-path instructions, shown as a numbered list. */
    clicks?: string[]
    /** Extra titled lists, shown after the common mistakes (for example a backup method or safety rules). */
    sections?: { title: string; items: string[]; ordered?: boolean }[]
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
