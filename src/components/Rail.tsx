import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Card } from '../engine/types'

interface Seg { key: string; d: string; color: string; to: number }

export function Rail({ cards, cur, onJump, delay }: { cards: Card[]; cur: number; onJump: (i: number) => void; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [size, setSize] = useState({ w: 1000, h: 120, fs: 14 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const u = Math.min(window.innerWidth / 100, (window.innerHeight * 1.7778) / 100) * (window.innerWidth < 900 ? 2 : 1)
      setSize({ w: el.clientWidth, h: el.clientHeight, fs: Math.max(11, u * 1.15) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h, fs } = size
  const n = cards.length
  const padX = Math.max(40, w * 0.06)
  const xs = (i: number) => padX + (i * (w - 2 * padX)) / (n - 1)
  const mainY = h * 0.26
  const brY = h * 0.62
  const yOf = (i: number) => (cards[i].lane === 'branch' ? brY : mainY)
  const r = Math.max(8, h * 0.075)
  const curve = (a: number, b: number) => {
    const x0 = xs(a), y0 = yOf(a), x1 = xs(b), y1 = yOf(b), m = (x1 - x0) / 2
    return `M${x0} ${y0} C${x0 + m} ${y0} ${x1 - m} ${y1} ${x1} ${y1}`
  }

  const segs: Seg[] = []
  const mains = cards.map((c, i) => (c.lane === 'main' ? i : -1)).filter((i) => i >= 0)
  for (let k = 1; k < mains.length; k++) {
    const a = mains[k - 1], b = mains[k]
    segs.push({ key: `m${a}-${b}`, d: `M${xs(a)} ${mainY} L${xs(b)} ${mainY}`, color: 'var(--green)', to: b })
  }
  cards.forEach((c, i) => {
    if (c.lane !== 'branch') return
    const prev = cards[i - 1]
    const next = cards[i + 1]
    if (prev) segs.push({ key: `b${i - 1}-${i}`, d: curve(i - 1, i), color: 'var(--accent)', to: i })
    if (next) segs.push({ key: `b${i}-${i + 1}`, d: curve(i, i + 1), color: 'var(--accent)', to: i + 1 })
  })

  const headT = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 160, damping: 20, delay }
  return (
    <div className="rail" ref={ref}>
      <svg width={w} height={h} role="navigation" aria-label="Storyline">
        {segs.map((s) => (
          <g key={s.key}>
            <path d={s.d} fill="none" stroke="var(--rail-future)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
            <motion.path
              d={s.d} fill="none" stroke={s.color} strokeWidth="4" strokeLinecap="round"
              initial={false}
              animate={{ pathLength: cur >= s.to ? 1 : 0, opacity: cur >= s.to ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.6, delay: s.to === cur ? delay : 0, ease: 'easeInOut' }}
            />
          </g>
        ))}

        <motion.g initial={false} animate={{ x: xs(cur), y: yOf(cur) }} transition={headT}>
          <circle r={r + 7} fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 4" className="head-ring" />
          <circle r={r + 7} fill="none" stroke="var(--accent)" strokeWidth="3" className="pulse" />
        </motion.g>

        {cards.map((c, i) => {
          const x = xs(i), y = yOf(i)
          const col = c.lane === 'branch' ? 'var(--accent)' : 'var(--green)'
          const past = i <= cur
          return (
            <g
              key={c.id} transform={`translate(${x} ${y})`} role="button" tabIndex={0}
              aria-label={`Go to ${c.title}`} aria-current={i === cur ? 'step' : undefined}
              onClick={() => onJump(i)}
              onKeyDown={(e) => { if (e.key === 'Enter') onJump(i) }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle r={r * 2.6} fill="transparent" />
              <circle r={r} fill="var(--page)" stroke="var(--rail-future)" strokeWidth="3" />
              <motion.circle
                r={r} fill={col}
                initial={false}
                animate={{ scale: past ? 1 : 0.2, opacity: past ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.35, delay: i === cur ? delay : 0 }}
              />
              <text y={r + 6 + fs} textAnchor="middle" fontSize={fs} className={'rail-hash' + (i === cur ? ' cur' : '')}>{c.hash}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
