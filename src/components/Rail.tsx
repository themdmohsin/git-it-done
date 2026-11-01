import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Card } from '../engine/types'

type SegKind = 'main' | 'detour' | 'branch'
interface Seg { key: string; d: string; kind: SegKind; to: number }

const labelOf = (c: Card) => (c.section === 'part2' && c.id !== 'challenge' ? `Part 2 (Vijay): ${c.rail}` : c.rail)

export function Rail({ cards, cur, onJump, delay }: { cards: Card[]; cur: number; onJump: (i: number) => void; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [size, setSize] = useState({ w: 1000, h: 120, fs: 14 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const u = Math.min(window.innerWidth / 100, (window.innerHeight * 1.7778) / 100) * (window.innerWidth < 900 ? 2 : 1)
      setSize({ w: el.clientWidth, h: el.clientHeight, fs: Math.max(14, u * 1.5) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h, fs } = size
  const n = cards.length
  const padX = Math.max(40, w * 0.05)
  const xs = (i: number) => padX + (i * (w - 2 * padX)) / (n - 1)
  const mainY = h * 0.24
  const lowY = h * 0.68
  const yOf = (i: number) => (cards[i].lane === 'main' ? mainY : lowY)
  const r = Math.max(7, h * 0.058)
  const curve = (a: number, b: number) => {
    const x0 = xs(a), y0 = yOf(a), x1 = xs(b), y1 = yOf(b), m = (x1 - x0) / 2
    return `M${x0} ${y0} C${x0 + m} ${y0} ${x1 - m} ${y1} ${x1} ${y1}`
  }

  const segs: Seg[] = []
  for (let i = 1; i < n; i++) {
    const la = cards[i - 1].lane, lb = cards[i].lane
    if (la === 'main' && lb === 'main') {
      segs.push({ key: `m${i}`, d: `M${xs(i - 1)} ${mainY} L${xs(i)} ${mainY}`, kind: 'main', to: i })
    } else if (la === 'detour' || lb === 'detour') {
      segs.push({ key: `d${i}`, d: la === lb ? `M${xs(i - 1)} ${lowY} L${xs(i)} ${lowY}` : curve(i - 1, i), kind: 'detour', to: i })
    } else {
      segs.push({ key: `b${i}`, d: curve(i - 1, i), kind: 'branch', to: i })
    }
  }
  cards.forEach((c, i) => {
    if (c.lane === 'branch' && cards[i - 1]?.lane === 'main' && cards[i + 1]?.lane === 'main') {
      segs.push({ key: `skip${i}`, d: `M${xs(i - 1)} ${mainY} L${xs(i + 1)} ${mainY}`, kind: 'main', to: i + 1 })
    }
  })
  const stroke: Record<SegKind, string> = { main: 'var(--green)', detour: 'var(--lane-remote)', branch: 'var(--accent)' }

  const headT = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 160, damping: 20, delay }

  const label = labelOf(cards[cur])
  const lw = label.length * fs * 0.56 + fs
  const lx = Math.min(Math.max(xs(cur), lw / 2 + 6), w - lw / 2 - 6)
  const ly = yOf(cur) + r + 8

  return (
    <div className="rail" ref={ref}>
      <svg width={w} height={h} role="navigation" aria-label="Storyline">
        {segs.map((s) => {
          const detour = s.kind === 'detour'
          return (
            <g key={s.key}>
              <path d={s.d} fill="none" stroke="var(--rail-future)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
              {detour ? (
                <motion.path
                  d={s.d} fill="none" stroke={stroke.detour} strokeWidth="5" strokeLinecap="butt" strokeDasharray="12 9"
                  initial={false} animate={{ opacity: cur >= s.to ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.5, delay: s.to === cur ? delay : 0 }}
                />
              ) : (
                <motion.path
                  d={s.d} fill="none" stroke={stroke[s.kind]} strokeWidth="4" strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: cur >= s.to ? 1 : 0, opacity: cur >= s.to ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.6, delay: s.to === cur ? delay : 0, ease: 'easeInOut' }}
                />
              )}
            </g>
          )
        })}

        <motion.g initial={false} animate={{ x: xs(cur), y: yOf(cur) }} transition={headT}>
          <circle r={r + 6} fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 4" className="head-ring" />
          <circle r={r + 6} fill="none" stroke="var(--accent)" strokeWidth="3" className="pulse" />
        </motion.g>

        {cards.map((c, i) => {
          const x = xs(i), y = yOf(i)
          const col = c.lane === 'detour' ? 'var(--lane-remote)' : c.section === 'part2' ? 'var(--accent)' : 'var(--green)'
          const past = i <= cur
          return (
            <g
              key={c.id} transform={`translate(${x} ${y})`} role="button" tabIndex={0}
              aria-label={`Go to ${c.title}`} aria-current={i === cur ? 'step' : undefined}
              onClick={() => onJump(i)}
              onKeyDown={(e) => { if (e.key === 'Enter') onJump(i) }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle r={Math.max(r * 1.9, 14)} fill="transparent" />
              <circle r={r} fill="var(--page)" stroke={c.lane === 'detour' ? 'var(--ink)' : 'var(--rail-future)'} strokeWidth="3" />
              <motion.circle
                r={r} fill={col}
                initial={false}
                animate={{ scale: past ? 1 : 0.2, opacity: past ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.35, delay: i === cur ? delay : 0 }}
              />
            </g>
          )
        })}

        <motion.g
          key={cur} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : delay }}
          style={{ pointerEvents: 'none' }}
        >
          <rect x={lx - lw / 2} y={ly - 2} width={lw} height={fs * 1.3} rx={fs * 0.4} fill="var(--page)" opacity="0.92" />
          <text x={lx} y={ly + fs} textAnchor="middle" fontSize={fs} className="rail-label">{label}</text>
        </motion.g>
      </svg>
    </div>
  )
}
