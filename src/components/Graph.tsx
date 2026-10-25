import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { RepoState } from '../engine/types'

const X0 = 70
const DX = 120
const LANE_MAIN = 195
const LANE_FEATURE = 95
const CLOUD = { x: 690, y: 62 }
const laneY = (b: string) => (b === 'main' ? LANE_MAIN : LANE_FEATURE)
const laneColor = (b: string) => (b === 'main' ? 'var(--lane-main)' : 'var(--lane-feature)')
const pillW = (t: string) => t.length * 14 + 28

interface Props { repo: RepoState; instant: boolean }

export function Graph({ repo, instant }: Props) {
  const reduce = useReducedMotion()
  const snap = instant
  const pos = (id: string) => {
    const i = repo.commits.findIndex((c) => c.id === id)
    return { x: X0 + i * DX, y: laneY(repo.commits[i].branch), i }
  }
  const spring = { type: 'spring' as const, stiffness: 420, damping: 15 }
  const pop = reduce
    ? { initial: snap ? false : { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: snap ? false : { scale: 0 }, animate: { scale: 1 } }

  // Edges
  const edges: { key: string; d: string; color: string }[] = []
  repo.commits.forEach((c) => {
    const to = pos(c.id)
    const merge = c.parents.length > 1
    c.parents.forEach((pid) => {
      const from = pos(pid)
      const mx = (from.x + to.x) / 2
      let d: string
      if (from.y !== to.y) d = `M${from.x} ${from.y} C${mx} ${from.y} ${mx} ${to.y} ${to.x} ${to.y}`
      else if (merge) d = `M${from.x} ${from.y} C${mx} ${from.y + 34} ${mx} ${to.y + 34} ${to.x} ${to.y}`
      else d = `M${from.x} ${from.y} L${to.x} ${to.y}`
      const fromCommit = repo.commits.find((x) => x.id === pid)!
      edges.push({ key: pid + '>' + c.id, d, color: laneColor(merge ? fromCommit.branch : c.branch) })
    })
  })

  // Pills
  const byTip: Record<string, string[]> = {}
  Object.entries(repo.branches).forEach(([name, tip]) => {
    if (tip) (byTip[tip] ??= []).push(name)
  })
  const pills = Object.entries(byTip).flatMap(([tip, names]) =>
    names.sort((a, b) => (a === 'main' ? -1 : b === 'main' ? 1 : 0)).map((name, k) => {
      const p = pos(tip)
      return { name, x: p.x, y: p.y - 48 - k * 38, color: laneColor(name), head: repo.head === name }
    }),
  )
  const mainPill = pills.find((p) => p.name === 'main')
  let originPill: { x: number; y: number } | null = null
  if (repo.remoteTip && repo.commits.some((c) => c.id === repo.remoteTip)) {
    const p = pos(repo.remoteTip)
    originPill = { x: p.x, y: p.y - 48 }
    if (mainPill && mainPill.x === p.x) originPill.x = p.x + pillW('main') / 2 + 8 + pillW('origin/main') / 2
  }

  const headTip = repo.branches[repo.head]
  const head = headTip && repo.commits.some((c) => c.id === headTip) ? pos(headTip) : null
  const pushedCommits = repo.commits.filter((c) => repo.pushed.includes(c.id))
  const hold = snap ? 0 : 0.3

  return (
    <svg className="graph" viewBox="0 0 800 262" role="img" aria-label="Commit graph">
      {/* remote cloud */}
      {repo.remote && (
        <motion.g initial={snap ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <path
            transform={`translate(${CLOUD.x} ${CLOUD.y})`}
            d="M-52 24 H44 A26 26 0 0 0 46 -26 A34 34 0 0 0 -18 -34 A30 30 0 0 0 -52 24 Z"
            fill="rgba(127,214,224,0.08)" stroke="var(--lane-remote)" strokeWidth="4" strokeLinejoin="round"
          />
          <text x={CLOUD.x} y={CLOUD.y + 58} textAnchor="middle" className="g-hash" fill="var(--lane-remote)">GitHub</text>
        </motion.g>
      )}
      {repo.remote && pushedCommits.map((c, i) => {
        const p = pos(c.id)
        const slot = { x: CLOUD.x - 36 + (i % 3) * 36, y: CLOUD.y - 8 + Math.floor(i / 3) * 26 }
        return (
          <g key={'fly' + c.id} transform={`translate(${slot.x} ${slot.y})`}>
            <motion.circle
              r="9" fill="var(--lane-remote)"
              initial={snap ? false : { x: p.x - slot.x, y: p.y - slot.y, scale: 2, opacity: 0 }}
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.35, ease: 'easeInOut' }}
            />
          </g>
        )
      })}

      {/* edges */}
      {edges.map((e) => (
        <motion.path
          key={e.key} d={e.d} fill="none" stroke={e.color} strokeWidth="5" strokeLinecap="round"
          initial={snap ? false : reduce ? { opacity: 0 } : { pathLength: 0 }}
          animate={reduce ? { opacity: 1 } : { pathLength: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      ))}

      {/* commits */}
      {repo.commits.map((c) => {
        const p = pos(c.id)
        const col = laneColor(c.branch)
        const pushed = repo.pushed.includes(c.id)
        return (
          <g key={c.id} transform={`translate(${p.x} ${p.y})`}>
            <motion.g {...pop} transition={reduce ? { duration: 0.3 } : { ...spring, delay: snap ? 0 : hold + 0.15 }}>
              <circle r="22" fill="none" stroke={pushed ? 'var(--lane-remote)' : col} strokeWidth="3" />
              <circle r="14" fill={col} />
            </motion.g>
            <motion.text
              y="58" textAnchor="middle" className="g-hash" fill="var(--term-text)"
              initial={snap ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: snap ? 0 : hold + 0.3 }}
            >
              {c.id}
            </motion.text>
          </g>
        )
      })}

      {/* branch pills */}
      <AnimatePresence>
        {pills.map((p) => (
          <motion.g
            key={p.name}
            initial={snap ? false : { x: p.x, y: p.y, opacity: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={snap ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 24, delay: hold + 0.2 }}
          >
            <rect x={-pillW(p.name) / 2} y="-17" width={pillW(p.name)} height="34" rx="17" fill={p.color}
              stroke={p.head ? 'var(--head)' : 'none'} strokeWidth="3" />
            <text textAnchor="middle" y="7" className="g-pill">{p.name}</text>
          </motion.g>
        ))}
      </AnimatePresence>
      {originPill && (
        <motion.g
          key="origin"
          initial={snap ? false : { x: originPill.x, y: originPill.y, opacity: 0 }}
          animate={{ x: originPill.x, y: originPill.y, opacity: 1 }}
          transition={snap ? { duration: 0 } : { delay: pushedCommits.length * 0.35 + 0.8, duration: 0.4 }}
        >
          <rect x={-pillW('origin/main') / 2} y="-17" width={pillW('origin/main')} height="34" rx="17" fill="var(--lane-remote)" />
          <text textAnchor="middle" y="7" className="g-pill">origin/main</text>
        </motion.g>
      )}

      {/* HEAD */}
      {head && (
        <motion.g
          initial={snap ? false : { x: head.x, y: head.y }}
          animate={{ x: head.x, y: head.y }}
          transition={snap ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 18, delay: hold + 0.35 }}
        >
          <circle r="31" fill="none" stroke="var(--head)" strokeWidth="3" strokeDasharray="7 7" className="head-ring" />
        </motion.g>
      )}

    </svg>
  )
}

