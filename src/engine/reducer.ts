import type { Card, GraphOp, RepoState } from './types'

export const emptyRepo: RepoState = {
  initialized: false, commits: [], branches: { main: null }, head: 'main',
  remote: false, pushed: [], remoteTip: null,
}

export function opsOf(op: GraphOp | GraphOp[]): GraphOp[] { return Array.isArray(op) ? op : [op] }

function ancestors(s: RepoState, tip: string | null): Set<string> {
  const seen = new Set<string>()
  const walk = (id: string | null) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    s.commits.find((c) => c.id === id)?.parents.forEach(walk)
  }
  walk(tip)
  return seen
}

/** Pure reducer: state = applyOp(state, op). */
export function applyOp(s: RepoState, op: GraphOp): RepoState {
  switch (op.type) {
    case 'init': return { ...emptyRepo, initialized: true }
    case 'commit': {
      const tip = s.branches[op.branch] ?? null
      return {
        ...s,
        commits: [...s.commits, { id: op.id, msg: op.msg, branch: op.branch, parents: tip ? [tip] : [] }],
        branches: { ...s.branches, [op.branch]: op.id },
      }
    }
    case 'createBranch':
      return { ...s, branches: { ...s.branches, [op.name]: s.branches[s.head] ?? null } }
    case 'switchBranch': return { ...s, head: op.name }
    case 'merge': {
      const a = s.branches[op.into] ?? null
      const b = s.branches[op.from] ?? null
      return {
        ...s,
        commits: [...s.commits, { id: op.id, msg: 'merge ' + op.from, branch: op.into, parents: [a, b].filter(Boolean) as string[] }],
        branches: { ...s.branches, [op.into]: op.id },
        head: op.into,
      }
    }
    case 'deleteBranch': {
      const { [op.name]: _gone, ...rest } = s.branches
      void _gone
      return { ...s, branches: rest }
    }
    case 'addRemote': return { ...s, remote: true }
    case 'push': {
      const tip = s.branches[op.branch] ?? null
      const reach = ancestors(s, tip)
      return { ...s, pushed: s.commits.filter((c) => reach.has(c.id)).map((c) => c.id), remoteTip: tip }
    }
    default: return s
  }
}

export function applyOps(s: RepoState, op: GraphOp | GraphOp[]): RepoState {
  return opsOf(op).reduce(applyOp, s)
}

/** Rebuild the repo: every earlier card in full, plus the first steps steps of card cardIdx. */
export function replay(cards: Card[], cardIdx: number, steps: number): RepoState {
  let s = emptyRepo
  for (let i = 0; i <= cardIdx && i < cards.length; i++) {
    const list = cards[i].steps
    const n = i < cardIdx ? list.length : Math.min(steps, list.length)
    for (let j = 0; j < n; j++) s = applyOps(s, list[j].op)
  }
  return s
}

/** File chip stage after steps steps of a card. */
export function fileStage(card: Card, steps: number) {
  for (let i = Math.min(steps, card.steps.length) - 1; i >= 0; i--) {
    const f = card.steps[i].file
    if (f) return f
  }
  return 'none' as const
}

