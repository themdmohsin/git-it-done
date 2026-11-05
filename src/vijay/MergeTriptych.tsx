/* Card 5 (merge): a static, three-stage diagram - Before merge / Merging (Fast-forward) / After merge -
   replacing the single animated graph used by the other branching cards. Hand-built (not driven by the
   scene engine in scenes.ts) because each stage needs a one-off element the generic engine doesn't draw:
   a curved branch line (stage 1), a dashed "pointer moving forward" arrow (stage 2), and a highlight
   burst on the commit both branches now share (stage 3). All three stages reuse the exact same three
   commits - no commit is ever added or removed, and feature-login is never deleted. */

const FS = 22
const RING_R = 18
const DOT_R = 11
const VB = '0 0 780 190'

const MAIN = 'var(--lane-main)'
const FEATURE = 'var(--lane-feature)'

const X0 = 60
const X1 = 220
const X2 = 380
const X3 = 620
const Y_MAIN = 140
const Y_FEATURE = 60

const pillW = (text: string) => text.length * FS * 0.6 + 30
const PILL_H = FS * 1.4

function Commit({ x, y, color, hash, burst }: { x: number; y: number; color: string; hash: string; burst?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {burst && (
        <g stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" opacity="0.85">
          <line x1={RING_R + 4} y1={-RING_R - 2} x2={RING_R + 14} y2={-RING_R - 12} />
          <line x1={RING_R + 8} y1={0} x2={RING_R + 20} y2={0} />
          <line x1={RING_R + 4} y1={RING_R + 2} x2={RING_R + 14} y2={RING_R + 12} />
        </g>
      )}
      <circle r={RING_R} fill="none" stroke={color} strokeWidth="3" />
      <circle r={DOT_R} fill={color} />
      <text y={RING_R + FS * 0.95} textAnchor="middle" className="mt-hash">{hash}</text>
    </g>
  )
}

function Pill({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const w = pillW(text)
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-PILL_H / 2} width={w} height={PILL_H} rx={PILL_H / 2} fill={color} />
      <text y={FS * 0.3} textAnchor="middle" className="mt-pill-text">{text}</text>
    </g>
  )
}

function Head({ label, n }: { label: string; n: number }) {
  const w = label.length * FS * 0.58 + 34
  return (
    <g transform="translate(40 36)">
      <circle r="19" fill="var(--page)" stroke="var(--ink)" strokeWidth="2.5" />
      <text y={FS * 0.3} textAnchor="middle" className="mt-badge-text">{n}</text>
      <g transform="translate(44 -16)">
        <rect width={w} height={PILL_H} rx={PILL_H / 2} fill="var(--panel-2)" />
        <text x={w / 2} y={PILL_H / 2 + FS * 0.3} textAnchor="middle" className="mt-head-text">{label}</text>
      </g>
    </g>
  )
}

/** Stage 1: feature-login branches off c3d4e5f. main and feature-login point at different commits. */
function BeforeMerge() {
  return (
    <svg className="mt-graph" viewBox={VB} role="img" aria-label="Before merge: main and feature-login point at different commits">
      <Head n={1} label="Before merge" />
      <path d={`M${X0} ${Y_MAIN} L${X2} ${Y_MAIN}`} fill="none" stroke={MAIN} strokeWidth="4" strokeLinecap="round" />
      <path d={`M${X2} ${Y_MAIN} C${(X2 + X3) / 2} ${Y_MAIN} ${(X2 + X3) / 2} ${Y_FEATURE} ${X3} ${Y_FEATURE}`} fill="none" stroke={FEATURE} strokeWidth="4" strokeLinecap="round" />
      <Commit x={X0} y={Y_MAIN} color={MAIN} hash="a1b2c3d" />
      <Commit x={X1} y={Y_MAIN} color={MAIN} hash="b2c3d4e" />
      <Commit x={X2} y={Y_MAIN} color={MAIN} hash="c3d4e5f" />
      <Commit x={X3} y={Y_FEATURE} color={FEATURE} hash="b7e4f91" />
      <Pill x={X2} y={Y_MAIN - RING_R - PILL_H * 0.9} text="main" color={MAIN} />
      <Pill x={X3} y={Y_FEATURE - RING_R - PILL_H * 0.9} text="feature-login" color={FEATURE} />
    </svg>
  )
}

/** Stage 2: merging. feature-login's commit is the SAME existing b7e4f91 - main's pointer is shown
    advancing toward it (dashed arrow), nothing new is created. */
function Merging() {
  return (
    <svg className="mt-graph" viewBox={VB} role="img" aria-label="Merging, fast-forward: main's pointer moves forward to the same feature-login commit">
      <Head n={2} label="Merging (Fast-forward)" />
      <path d={`M${X0} ${Y_MAIN} L${X2} ${Y_MAIN}`} fill="none" stroke={MAIN} strokeWidth="4" strokeLinecap="round" />
      <defs>
        <marker id="mt-arrow" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={MAIN} />
        </marker>
      </defs>
      <path
        d={`M${X2 + RING_R + 6} ${Y_MAIN} L${X3 - RING_R - 10} ${Y_MAIN}`}
        fill="none" stroke={MAIN} strokeWidth="4" strokeLinecap="round" strokeDasharray="3 10"
        markerEnd="url(#mt-arrow)"
      />
      <Commit x={X0} y={Y_MAIN} color={MAIN} hash="a1b2c3d" />
      <Commit x={X1} y={Y_MAIN} color={MAIN} hash="b2c3d4e" />
      <Commit x={X2} y={Y_MAIN} color={MAIN} hash="c3d4e5f" />
      <Commit x={X3} y={Y_MAIN} color={FEATURE} hash="b7e4f91" />
      <Pill x={X2} y={Y_MAIN - RING_R - PILL_H * 0.9} text="main" color={MAIN} />
      <Pill x={X3} y={Y_MAIN - RING_R - PILL_H * 0.9} text="feature-login" color={FEATURE} />
    </svg>
  )
}

/** Stage 3: after merge. main and feature-login both point at the SAME existing b7e4f91 - no new
    commit, feature-login is not deleted. */
function AfterMerge() {
  return (
    <svg className="mt-graph" viewBox={VB} role="img" aria-label="After merge: main and feature-login both point at the same commit, b7e4f91">
      <Head n={3} label="After merge" />
      <path d={`M${X0} ${Y_MAIN} L${X3} ${Y_MAIN}`} fill="none" stroke={MAIN} strokeWidth="4" strokeLinecap="round" />
      <Commit x={X0} y={Y_MAIN} color={MAIN} hash="a1b2c3d" />
      <Commit x={X1} y={Y_MAIN} color={MAIN} hash="b2c3d4e" />
      <Commit x={X2} y={Y_MAIN} color={MAIN} hash="c3d4e5f" />
      <Commit x={X3} y={Y_MAIN} color={MAIN} hash="b7e4f91" burst />
      <Pill x={X3} y={Y_MAIN - RING_R - PILL_H * 2.1} text="main" color={MAIN} />
      <Pill x={X3} y={Y_MAIN - RING_R - PILL_H * 0.9} text="feature-login" color={FEATURE} />
    </svg>
  )
}

export function MergeTriptych() {
  return (
    <div className="mt-wrap">
      <BeforeMerge />
      <Merging />
      <AfterMerge />
      <div className="vj-caption">main now includes the changes from feature-login.</div>
    </div>
  )
}
