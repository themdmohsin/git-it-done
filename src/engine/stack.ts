import type { Card, Frame, StackMove, StackScene } from './types'

export const PULL_MS = 520
export const PEEL_MS = 170
export const FRONT_MS = 260
export const SETTLE_MS = 750

export function sceneOf(card: Card): StackScene {
  return card.scene ?? { layers: [card.id], front: card.id, zoomed: false }
}

/** Frames for moving forward from scene a to scene b. Frame 0 is the starting picture. */
function forwardFrames(a: StackScene, b: StackScene): Frame[] {
  const frames: Frame[] = [{ layers: a.layers, zoomed: a.zoomed, wait: 0 }]
  const added = b.layers.filter((id) => !a.layers.includes(id))
  const removed = a.layers.filter((id) => !b.layers.includes(id))
  let cur = a.layers
  if (!a.zoomed && b.zoomed) {
    frames.push({ layers: cur, zoomed: true, wait: PULL_MS })
  }
  const steps: { layers: string[]; wait: number }[] = []
  for (const id of [...removed].reverse()) {
    cur = cur.filter((x) => x !== id)
    steps.push({ layers: cur, wait: PEEL_MS })
  }
  for (const id of added) {
    cur = [...cur, id]
    steps.push({ layers: cur, wait: FRONT_MS })
  }
  steps.forEach((s, i) => {
    const last = i === steps.length - 1
    frames.push({ layers: s.layers, zoomed: last ? b.zoomed : true, wait: s.wait })
  })
  const end = frames[frames.length - 1]
  if (end.zoomed !== b.zoomed || end.layers.length !== b.layers.length) {
    frames.push({ layers: b.layers, zoomed: b.zoomed, wait: 0 })
  }
  frames[frames.length - 1] = { ...frames[frames.length - 1], wait: SETTLE_MS }
  return frames
}

/**
 * Pure planner. dir -1 plays the forward plan of (b -> a) backwards, so reverse motion
 * mirrors the forward motion frame for frame.
 */
export function planFrames(from: StackScene, to: StackScene, dir: 1 | -1): Frame[] {
  if (dir === 1) return forwardFrames(from, to)
  const fwd = forwardFrames(to, from)
  const n = fwd.length
  return fwd.map((_, k) => ({ ...fwd[n - 1 - k], wait: k === n - 1 ? SETTLE_MS : fwd[n - 2 - k].wait }))
}

export function totalMs(frames: Frame[]) {
  return frames.reduce((t, f) => t + f.wait, 0)
}

/** Which motion entering and leaving layers use for a given move between scenes. */
export function movesFor(from: StackScene, to: StackScene, dir: 1 | -1): { enter: StackMove; exit: StackMove } {
  if (dir === 1) return { enter: to.enter ?? 'rise', exit: from.leave ?? 'fly' }
  return { enter: to.leave ?? 'fly', exit: from.enter ?? 'rise' }
}
