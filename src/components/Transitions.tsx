import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cards } from '../cards'
import { sceneOf, totalMs } from '../engine/stack'
import type { Frame, StackMove, TransitionKind } from '../engine/types'

export type Kind = TransitionKind | 'none'
export interface Trans {
  id: number
  kind: Kind
  dir: 1 | -1
  /** Snapshot of the card we are leaving (null for in-place rebuilds such as replay). */
  from: { cardIdx: number; done: number } | null
  /** Stack transitions only: the frames to play, and how entering and leaving layers move. */
  frames?: Frame[]
  moves?: { enter: StackMove; exit: StackMove }
}

/** How long the outgoing layer must stay mounted. */
const DURATION: Record<Kind, number> = { none: 0, slide: 450, drop: 1300, split: 1200, converge: 1200, launch: 1600, zoom: 1200, zoomout: 0, peel: 0 }
/** Seconds before the rail should animate (so it syncs with the card effect). */
export const RAIL_DELAY: Record<Kind, number> = { none: 0, slide: 0, drop: 0.2, split: 0, converge: 0.5, launch: 0.9, zoom: 0.5, zoomout: 0.6, peel: 0.1 }

interface Spec {
  z: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transition?: any
}

const OPEN = 'inset(0% 0% 0% 0%)'
const SHUT = 'inset(0% 50% 0% 50%)'

function spec(role: 'in' | 'out', kind: Kind, dir: 1 | -1, reduce: boolean): Spec {
  const isIn = role === 'in'
  if (kind === 'none') return { z: isIn ? 2 : 1, initial: false }
  if (reduce) {
    return isIn
      ? { z: 2, initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25 } }
      : { z: 1, initial: false }
  }
  const back = dir === -1
  switch (kind) {
    case 'drop':
      if (!back) return isIn
        ? { z: 2, initial: { y: '-100%' }, animate: { y: 0 }, transition: { type: 'spring', stiffness: 170, damping: 11, mass: 0.9 } }
        : { z: 1, initial: false }
      return isIn
        ? { z: 1, initial: false }
        : { z: 3, initial: { y: 0 }, animate: { y: '-100%' }, transition: { duration: 0.55, ease: 'easeIn' } }
    case 'split':
      if (!back) return isIn
        ? { z: 2, initial: { clipPath: SHUT }, animate: { clipPath: OPEN }, transition: { duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] } }
        : { z: 1, initial: false }
      return isIn
        ? { z: 1, initial: false }
        : { z: 3, initial: { clipPath: OPEN }, animate: { clipPath: SHUT }, transition: { duration: 0.65, ease: [0.55, 0, 0.8, 0.3] } }
    case 'converge':
      return isIn
        ? { z: 2, initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0, delay: 0.5 } }
        : { z: 1, initial: false }
    case 'launch':
      if (!back) return isIn
        ? { z: 2, initial: { opacity: 0, y: -24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: 1.0, ease: 'easeOut' } }
        : { z: 1, initial: { scale: 1, opacity: 1 }, animate: { scale: 0.05, opacity: 0 }, transition: { duration: 0.5, ease: 'easeIn' } }
      return isIn
        ? { z: 2, initial: { scale: 0.05, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.55, delay: 0.6, ease: 'easeOut' } }
        : { z: 3, initial: { opacity: 1 }, animate: { opacity: 0 }, transition: { duration: 0.3 } }
    case 'zoom':
      return isIn
        ? { z: 2, initial: { scale: 0.05, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.55, delay: 0.55, ease: 'easeOut' } }
        : { z: 1, initial: { scale: 1, opacity: 1 }, animate: { scale: 0.05, opacity: 0 }, transition: { duration: 0.5, ease: 'easeIn' } }
    default:
      return isIn
        ? { z: 2, initial: { opacity: 0, x: 24 * dir }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.35, ease: 'easeOut' } }
        : { z: 1, initial: { opacity: 1, x: 0 }, animate: { opacity: 0, x: -24 * dir }, transition: { duration: 0.3 } }
  }
}

function Layer({ role, trans, reduce, children }: { role: 'in' | 'out'; trans: Trans; reduce: boolean; children: ReactNode }) {
  const s = spec(role, trans.kind, trans.dir, reduce)
  return (
    <motion.div
      className="layer"
      style={{ zIndex: s.z }}
      initial={s.initial}
      animate={s.animate}
      transition={s.transition}
      aria-hidden={role === 'out'}
    >
      {children}
    </motion.div>
  )
}

function Overlay({ trans }: { trans: Trans }) {
  const back = trans.dir === -1
  switch (trans.kind) {
    case 'split':
      return (
        <motion.div
          className="ov-line"
          initial={{ scaleY: back ? 1 : 0, opacity: 1 }}
          animate={back ? { scaleY: 0, opacity: 1 } : { scaleY: [0, 1, 1], opacity: [1, 1, 0] }}
          transition={back ? { duration: 0.5, delay: 0.2 } : { duration: 1.1, times: [0, 0.35, 1] }}
        />
      )
    case 'converge':
      return (
        <>
          <motion.div
            className="ov-panel left"
            initial={{ x: '-101%' }}
            animate={{ x: ['-101%', '0%', '-101%'] }}
            transition={{ duration: 1.1, times: [0, 0.45, 1], ease: 'easeInOut' }}
          />
          <motion.div
            className="ov-panel right"
            initial={{ x: '101%' }}
            animate={{ x: ['101%', '0%', '101%'] }}
            transition={{ duration: 1.1, times: [0, 0.45, 1], ease: 'easeInOut' }}
          />
        </>
      )
    case 'launch':
      return back ? (
        <motion.div
          className="ov-dot"
          initial={{ y: '-60vh', opacity: 1, scale: 1 }}
          animate={{ y: [ '-60vh', '0vh', '0vh' ], opacity: [1, 1, 0], scale: [1, 1, 0.3] }}
          transition={{ duration: 0.7, times: [0, 0.7, 1], ease: 'easeIn' }}
        />
      ) : (
        <motion.div
          className="ov-dot"
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 1], scale: [0, 1, 1, 1], y: ['0vh', '0vh', '0vh', '-70vh'], scaleY: [1, 1, 1, 3] }}
          transition={{ duration: 1.2, times: [0, 0.3, 0.5, 1], ease: 'easeIn' }}
        />
      )
    case 'zoom':
      return (
        <motion.div
          className="ov-node"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 1.4] }}
          transition={{ duration: 1.1, times: [0, 0.35, 0.65, 1] }}
        />
      )
    default:
      return null
  }
}

/* ---------- stack scene: layered cards ---------- */
const STEP_U = 2
const BAND_U = 6.4
const depthScale = (d: number) => 1 - 0.045 * Math.min(d, 3)
const FLY_EASE_OUT = [0.55, 0, 0.85, 0.35] as const
const FLY_EASE_IN = [0.65, 0.15, 0.45, 1] as const

function useU() {
  const get = () => Math.min(window.innerWidth / 100, (window.innerHeight * 1.7778) / 100)
  const [u, setU] = useState(get)
  useEffect(() => {
    const on = () => setU(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return u
}

interface StackProps {
  trans: Trans
  curCard: number
  finished: boolean
  reduce: boolean
  renderStack: (cardIdx: number, zoomed: boolean) => ReactNode
}

function StackLayer({ id, index, depth, frame, fi, snap, soft, moves, reduce, u, H, renderStack }: {
  id: string; index: number; depth: number; frame: Frame; fi: number; snap: boolean; soft: boolean
  moves: { enter: StackMove; exit: StackMove }; reduce: boolean; u: number; H: number
  renderStack: (cardIdx: number, zoomed: boolean) => ReactNode
}) {
  const mountFi = useRef(fi).current
  const entering = fi === mountFi && !snap
  const cardIdx = cards.findIndex((c) => c.id === id)
  const d = Math.min(depth, 3)
  const B = BAND_U * u
  const pose = frame.zoomed
    ? { x: 0, y: B - d * STEP_U * u, scale: depthScale(depth), rotate: 0, opacity: 1 }
    : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
  const rise = { x: 0, y: B + 3 * u, scale: 1.1, rotate: 0, opacity: 0 }
  const fly = { x: 5 * u, y: -H * 1.08, scale: 1.04, rotate: -5, opacity: 0 }
  const from = moves.enter === 'rise' ? rise : fly

  let transition: object
  if (snap) transition = { duration: 0 }
  else if (reduce) transition = { default: { duration: 0 }, opacity: { duration: 0.25 } }
  else if (entering && moves.enter === 'fly') transition = { duration: 0.55, ease: FLY_EASE_IN }
  else if (entering) transition = { default: { type: 'spring', stiffness: 420, damping: 19, mass: 0.8 }, opacity: { duration: 0.1 } }
  else if (soft) transition = { type: 'spring', stiffness: 110, damping: 19 }
  else transition = { type: 'spring', stiffness: 320, damping: 24 }

  const exit = reduce
    ? { opacity: 0, transition: { duration: 0.2 } }
    : moves.exit === 'fly'
      ? { ...fly, opacity: [1, 1, 0], transition: { duration: 0.55, ease: FLY_EASE_OUT } }
      : { ...rise, opacity: [1, 1, 0], transition: { duration: 0.28, ease: 'easeIn' as const } }

  return (
    <motion.div
      className="slayer"
      style={{ zIndex: index + 1, transformOrigin: '50% 0%', ['--ts' as string]: 1 / depthScale(depth) }}
      initial={snap ? false : reduce ? { opacity: 0 } : from}
      animate={{ ...pose, transition }}
      exit={exit}
    >
      {renderStack(cardIdx, frame.zoomed)}
      <motion.div
        className="stab" aria-hidden
        initial={false} animate={{ opacity: frame.zoomed && depth >= 1 ? 1 : 0 }} transition={{ duration: snap ? 0 : 0.3 }}
      >
        {cards[cardIdx].rail}
      </motion.div>
      <motion.div
        className="shade" aria-hidden
        initial={false} animate={{ opacity: frame.zoomed ? Math.min(depth, 3) * 0.07 : 0 }} transition={{ duration: snap ? 0 : 0.4 }}
      />
    </motion.div>
  )
}

function StackLayers({ trans, curCard, finished, reduce, renderStack }: StackProps) {
  const u = useU()
  const frames = useMemo<Frame[]>(() => {
    if (trans.frames) return trans.frames
    const s = sceneOf(cards[curCard])
    return [{ layers: s.layers, zoomed: s.zoomed, wait: 0 }]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trans.id])
  const last = frames.length - 1
  const [fi, setFi] = useState(trans.frames ? 0 : last)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (!trans.frames) return
    if (reduce) { setFi(last); return }
    let t = 0
    for (let k = 0; k < last; k++) {
      t += frames[k].wait
      timers.current.push(window.setTimeout(() => setFi(k + 1), t))
    }
    const list = timers.current
    return () => list.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!finished) return
    timers.current.forEach(clearTimeout)
    setFi(last)
  }, [finished, last])

  const f = frames[Math.min(fi, last)]
  const snap = fi === 0 || finished || !trans.frames
  const soft = fi > 0 && frames[fi - 1].zoomed !== f.zoomed
  const moves = trans.moves ?? { enter: 'rise' as const, exit: 'fly' as const }
  const H = window.innerHeight

  return (
    <AnimatePresence initial={false}>
      {f.layers.map((id, i) => (
        <StackLayer
          key={id} id={id} index={i} depth={f.layers.length - 1 - i} frame={f} fi={fi}
          snap={snap} soft={soft} moves={moves} reduce={reduce} u={u} H={H} renderStack={renderStack}
        />
      ))}
    </AnimatePresence>
  )
}

interface StageProps {
  trans: Trans
  cur: number
  finishTick: number
  onBusy: (busy: boolean) => void
  renderPrev: (from: { cardIdx: number; done: number }) => ReactNode
  renderStack: (cardIdx: number, zoomed: boolean) => ReactNode
  children: ReactNode
}

const isStackKind = (k: Kind) => k === 'zoomout' || k === 'peel'

export function Stage({ trans, cur, finishTick, onBusy, renderPrev, renderStack, children }: StageProps) {
  const reduce = !!useReducedMotion()
  const [doneId, setDoneId] = useState(-1)
  const [skipId, setSkipId] = useState(-1)
  const tick = useRef(finishTick)

  useEffect(() => {
    const ms = reduce ? 300 : trans.frames ? totalMs(trans.frames) + 150 : DURATION[trans.kind]
    const t = window.setTimeout(() => setDoneId(trans.id), ms)
    return () => clearTimeout(t)
  }, [trans.id, trans.kind, trans.frames, reduce])

  useEffect(() => {
    if (finishTick === tick.current) return
    tick.current = finishTick
    setSkipId(trans.id)
    setDoneId(trans.id)
  }, [finishTick, trans.id])

  const running = doneId !== trans.id
  const finished = skipId === trans.id
  useEffect(() => { onBusy(running && trans.kind !== 'none') }, [running, trans.kind, onBusy])

  const stacked = sceneOf(cards[cur]).zoomed || (isStackKind(trans.kind) && running)
  if (stacked) {
    return (
      <div className="stage stack">
        <StackLayers key={trans.id} trans={trans} curCard={cur} finished={finished} reduce={reduce} renderStack={renderStack} />
      </div>
    )
  }

  const eff: Trans = finished || isStackKind(trans.kind) ? { ...trans, kind: 'none' } : trans
  const showPrev = eff.from && running && !finished && eff.kind !== 'none'
  return (
    <div className="stage">
      {showPrev && eff.from && (
        <Layer key={'out' + trans.id} role="out" trans={eff} reduce={reduce}>{renderPrev(eff.from)}</Layer>
      )}
      <Layer key={'in' + trans.id + (finished ? 's' : '')} role="in" trans={eff} reduce={reduce}>{children}</Layer>
      {running && !finished && !reduce && eff.kind !== 'none' && <Overlay key={'ov' + trans.id} trans={eff} />}
    </div>
  )
}