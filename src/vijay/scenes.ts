/* Scripted scenes for the branching cards. Pure data: a scene is a function of the step number only,
   so forward, back, replay and deep links always draw the same picture.

   All five branching cards share one drawing language (BranchGraph.tsx):
   circular commit nodes, curved branch lines, colored branch pills, hashes under each commit,
   and (from card 3 onward) a HEAD tag that sits next to whichever pill is current. */

export type Tone = 'main' | 'login' | 'dash'
export const TONE: Record<Tone, string> = {
  main: 'var(--lane-main)',
  login: 'var(--lane-feature)',
  dash: 'var(--lane-remote)',
}

export interface GCommit {
  id: string
  lane: number
  col: number
  tone: Tone
  parent?: string
  delay?: number
  /** Staged but not committed yet: drawn dashed/translucent, labelled "staged" instead of a hash. */
  ghost?: boolean
}
export interface GPill {
  name: string
  at: string
  tone: Tone
  /** Card 1 only: a contextual name shown inside the pill under the branch name. */
  owner?: string
}
export interface GScene {
  commits: GCommit[]
  /** Pills at the same commit stack upwards in array order. */
  pills: GPill[]
  /** Name of the pill that HEAD points at: draws a HEAD tag beside that exact pill. */
  head?: string
  /** Commit that pulses (the shared commit). */
  pulse?: string
  /** A file that exists in the working directory but isn't staged yet: floats above the given slot. */
  fileTag?: { lane: number; col: number; label: string }
  caption: string
}
export interface GLayout { viewBox: string; lanes: number[]; x0: number; dx: number; fs: number }

const c = (id: string, lane: number, col: number, tone: Tone, parent?: string, delay = 0): GCommit =>
  ({ id, lane, col, tone, parent, delay })

/* ---------- Shared commit history for cards 1 and 2: main, then feature-login (Mohsin) and
   feature-dashboard (Vijay) branch off the same commit and grow independently. ---------- */
export const BRANCH_LAYOUT: GLayout = { viewBox: '0 0 800 440', lanes: [360, 220, 80], x0: 70, dx: 112, fs: 25 }
export const WHY_LAYOUT = BRANCH_LAYOUT

const MAIN = [c('a1b2c3d', 0, 0, 'main'), c('b2c3d4e', 0, 1, 'main', 'a1b2c3d'), c('c3d4e5f', 0, 2, 'main', 'b2c3d4e')]
const L1 = c('4d5e6f7', 1, 3, 'login', 'c3d4e5f')
const D1 = c('9a8b7c6', 2, 3, 'dash', 'c3d4e5f')
const L2 = c('5e6f7a8', 1, 4, 'login', '4d5e6f7')
const L3 = c('6f7a8b9', 1, 5, 'login', '5e6f7a8', 0.35)
const D2 = c('8b7c6d5', 2, 4, 'dash', '9a8b7c6', 0.2)
const mainPill: GPill = { name: 'main', at: 'c3d4e5f', tone: 'main' }

/* ---------- Card 1: Why branch? Same graph, with Mohsin and Vijay as contextual owners. ---------- */
export const WHY_SCENES: GScene[] = [
  { commits: [], pills: [], caption: 'No commits yet' },
  { commits: MAIN, pills: [mainPill], caption: 'main: the stable, trusted version' },
  {
    commits: [...MAIN, L1],
    pills: [mainPill, { name: 'feature-login', at: L1.id, tone: 'login', owner: 'Mohsin' }],
    pulse: 'c3d4e5f', caption: 'Mohsin branches off \u2014 feature-login',
  },
  {
    commits: [...MAIN, L1, D1],
    pills: [
      mainPill,
      { name: 'feature-login', at: L1.id, tone: 'login', owner: 'Mohsin' },
      { name: 'feature-dashboard', at: D1.id, tone: 'dash', owner: 'Vijay' },
    ],
    pulse: 'c3d4e5f', caption: 'Vijay branches off \u2014 same commit, same time',
  },
  {
    commits: [...MAIN, L1, D1, L2, L3, D2],
    pills: [
      mainPill,
      { name: 'feature-login', at: L3.id, tone: 'login', owner: 'Mohsin' },
      { name: 'feature-dashboard', at: D2.id, tone: 'dash', owner: 'Vijay' },
    ],
    caption: 'Each branch grows on its own. main has not moved.',
  },
]

/* ---------- Card 2: What is branching? Same history, no owners \u2014 a technical, reusable definition. ---------- */
export const BRANCH_SCENES: GScene[] = [
  { commits: [], pills: [], caption: 'No commits yet' },
  { commits: MAIN, pills: [mainPill], caption: 'main: the stable line of commits' },
  {
    commits: [...MAIN, L1], pills: [mainPill, { name: 'feature-login', at: L1.id, tone: 'login' }],
    pulse: 'c3d4e5f', caption: 'A branch is a pointer \u2014 feature-login starts from a shared commit',
  },
  {
    commits: [...MAIN, L1, D1],
    pills: [mainPill, { name: 'feature-login', at: L1.id, tone: 'login' }, { name: 'feature-dashboard', at: D1.id, tone: 'dash' }],
    pulse: 'c3d4e5f', caption: 'feature-dashboard starts from the same commit',
  },
  {
    commits: [...MAIN, L1, D1, L2, L3, D2],
    pills: [mainPill, { name: 'feature-login', at: L3.id, tone: 'login' }, { name: 'feature-dashboard', at: D2.id, tone: 'dash' }],
    caption: 'Each branch grows on its own. main has not moved.',
  },
]

/* ---------- Card 3: create & switch. One shared commit; the HEAD tag is the whole point. ---------- */
export const CREATE_LAYOUT: GLayout = { viewBox: '0 40 800 260', lanes: [170], x0: 400, dx: 0, fs: 30 }
const S0 = c('c3d4e5f', 0, 0, 'main')
const mainOnly: GPill = { name: 'main', at: S0.id, tone: 'main' }
const loginHere: GPill = { name: 'feature-login', at: S0.id, tone: 'login' }

export const CREATE_SCENES: GScene[] = [
  { commits: [S0], pills: [mainOnly], head: 'main', caption: 'You are on main.' },
  { commits: [S0], pills: [mainOnly], head: 'main', caption: 'git branch \u2014 the * marks main, your current branch.' },
  { commits: [S0], pills: [mainOnly, loginHere], head: 'main', caption: 'git branch feature-login \u2014 created, but HEAD is still on main.' },
  { commits: [S0], pills: [mainOnly, loginHere], head: 'main', caption: 'git branch \u2014 feature-login exists, but the * is still on main.' },
  { commits: [S0], pills: [mainOnly, loginHere], head: 'feature-login', caption: 'git checkout feature-login \u2014 HEAD moves. Same commit, nothing else changes.' },
  { commits: [S0], pills: [mainOnly, loginHere], head: 'feature-login', caption: 'git branch \u2014 the * has moved to feature-login.' },
  { commits: [S0], pills: [mainOnly], head: 'main', caption: 'Fresh start \u2014 same goal, one command.' },
  { commits: [S0], pills: [mainOnly, loginHere], head: 'feature-login', caption: 'git checkout -b feature-login \u2014 created AND switched, in one step.' },
]

/* ---------- Card 4: making changes on a branch. Same three-commit main history as cards 1-2;
   feature-login branches off the last commit. echo -> add (ghost, no hash) -> commit (real node). ---------- */
export const COMMIT_LAYOUT: GLayout = { viewBox: '0 0 800 440', lanes: [360, 190], x0: 70, dx: 150, fs: 27 }
const commitTip = c('b7e4f91', 1, 3, 'login', 'c3d4e5f')
const commitGhost: GCommit = { id: 'g-staged', lane: 1, col: 3, tone: 'login', parent: 'c3d4e5f', ghost: true }
const commitMainPill: GPill = { name: 'main', at: 'c3d4e5f', tone: 'main' }
const commitLoginAtMain: GPill = { name: 'feature-login', at: 'c3d4e5f', tone: 'login' }
const commitLoginAtTip: GPill = { name: 'feature-login', at: commitTip.id, tone: 'login' }

export const COMMIT_SCENES: GScene[] = [
  {
    commits: MAIN, pills: [commitMainPill, commitLoginAtMain],
    head: 'main', caption: 'main and feature-login both point at c3d4e5f.',
  },
  {
    commits: MAIN, pills: [commitMainPill, commitLoginAtMain],
    head: 'feature-login', caption: 'git checkout feature-login \u2014 HEAD moves onto the branch.',
  },
  {
    commits: MAIN, pills: [commitMainPill, commitLoginAtMain],
    head: 'feature-login', fileTag: { lane: 1, col: 3, label: 'notes.txt' },
    caption: 'echo ... > notes.txt \u2014 a new file in the working directory.',
  },
  {
    commits: [...MAIN, commitGhost], pills: [commitMainPill, commitLoginAtMain],
    head: 'feature-login', caption: 'git add notes.txt \u2014 staged, not a commit yet.',
  },
  {
    commits: [...MAIN, commitTip], pills: [commitMainPill, commitLoginAtTip],
    head: 'feature-login', pulse: commitTip.id,
    caption: 'git commit \u2014 feature-login moved forward. main stays at c3d4e5f.',
  },
]

