import { useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { TransitionKind } from '../engine/types'

export type Kind = TransitionKind | 'none'
export interface Trans {
  id: number
  kind: Kind
  dir: 1 | -1
  /** Snapshot of the card we are leaving (null for in-place rebuilds such as replay). */
  from: { cardIdx: number; done: number } | null
}

/** How long the outgoing layer must stay mounted. */
const DURATION: Record<Kind, number> = { none: 0, slide: 450, drop: 1300, split: 1200, converge: 1200, launch: 1600, zoom: 1200 }
/** Seconds before the rail should animate (so it syncs with the card effect). */
export const RAIL_DELAY: Record<Kind, number> = { none: 0, slide: 0, drop: 0.2, split: 0, converge: 0.5, launch: 0.9, zoom: 0.5 }

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

interface StageProps {
  trans: Trans
  renderPrev: (from: { cardIdx: number; done: number }) => ReactNode
  children: ReactNode
}

export function Stage({ trans, renderPrev, children }: StageProps) {
  const reduce = !!useReducedMotion()
  const [doneId, setDoneId] = useState(-1)
  useEffect(() => {
    const ms = reduce ? 300 : DURATION[trans.kind]
    const t = window.setTimeout(() => setDoneId(trans.id), ms)
    return () => clearTimeout(t)
  }, [trans.id, trans.kind, reduce])
  const showPrev = trans.from && doneId !== trans.id
  const running = doneId !== trans.id
  return (
    <div className="stage">
      {showPrev && trans.from && (
        <Layer key={'out' + trans.id} role="out" trans={trans} reduce={reduce}>{renderPrev(trans.from)}</Layer>
      )}
      <Layer key={'in' + trans.id} role="in" trans={trans} reduce={reduce}>{children}</Layer>
      {running && !reduce && trans.kind !== 'none' && <Overlay key={'ov' + trans.id} trans={trans} />}
    </div>
  )
}

