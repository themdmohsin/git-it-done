import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ArtId, OS, Step } from '../engine/types'
import { OS_LIST, useOS } from '../os'
import { Graph } from './Graph'
import { AMBIENT_REPO } from './Panels'

/* ---------- messy folder: the speaker's screenshot, with a drawn stand-in ---------- */
const FILES: [string, string][] = [
  ['final_report.docx', '12 Mar, 09:14'],
  ['final_report (1).docx', '12 Mar, 09:20'],
  ['very_final_report.docx', '14 Mar, 22:03'],
  ['very_final_report (2).docx', '14 Mar, 22:41'],
  ['final_REAL_use_this_one.docx', '15 Mar, 01:12'],
  ['final_REAL_use_this_one_v2.docx', '15 Mar, 07:30'],
  ['Mohsin_final_report_1.docx', '15 Mar, 10:05'],
  ['Mohsin_final_report_2.docx', '15 Mar, 11:48'],
  ['Mohsin_final_report_3.docx', '15 Mar, 16:19'],
  ['Vijay_final_report_FINAL.docx', '15 Mar, 17:02'],
  ['Vijay_copy_of_final_report.docx', '15 Mar, 17:03'],
  ['Copy of Copy of final_report.docx', '13 Mar, 08:55'],
  ['report_NEW_new_DONT_DELETE.docx', '11 Mar, 20:10'],
  ['report_old_backup_maybe.docx', '02 Mar, 14:26'],
]

function FakeExplorer() {
  return (
    <div className="fx" role="img" aria-label="A messy folder full of copies of the same report">
      <div className="fx-bar">
        <span className="dot" style={{ background: 'var(--lane-feature)' }} />
        <span className="dot" style={{ background: 'var(--lane-main)' }} />
        <span className="dot" style={{ background: 'var(--lane-remote)' }} />
        <span className="fx-path">Documents &gt; Report</span>
      </div>
      <div className="fx-head"><span>Name</span><span>Date modified</span></div>
      <div className="fx-list">
        {FILES.map(([name, date]) => (
          <div className="fx-row" key={name}>
            <span className="fx-name"><i className="fx-icon" />{name}</span>
            <span>{date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MessyShot() {
  const [ok, setOk] = useState(true)
  if (!ok) return <FakeExplorer />
  return (
    <img
      className="shot" alt="A messy folder full of copies of the same report"
      src={import.meta.env.BASE_URL + 'messy-folder.png'} onError={() => setOk(false)}
    />
  )
}

/* ---------- hero word ---------- */
export function Hero({ word }: { word: string }) {
  return (
    <div className="hero">
      <div className="hero-word">{word}<span className="hero-dot" /></div>
    </div>
  )
}

/* ---------- story illustrations (inline scalable vector graphics, no external images) ---------- */
const RING = Array.from({ length: 24 }, (_, i) => i)
const RING_LABELS: Record<number, [string, string]> = {
  0: ['read', 'var(--lane-main)'],
  6: ['use', 'var(--lane-feature)'],
  12: ['change', 'var(--lane-remote)'],
  18: ['share', 'var(--lane-main)'],
}
const DOT_COLORS = ['var(--lane-main)', 'var(--lane-feature)', 'var(--lane-remote)']
const polar = (cx: number, cy: number, r: number, i: number, n: number) => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function RingArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="A ring of people around open source code">
      <g className="art-spin">
        {RING.filter((i) => [2, 3, 4].includes(i % 6)).map((i) => {
          const p = polar(400, 320, 250, i, 24)
          return (
            <g key={i}>
              <line x1="400" y1="320" x2={p.x} y2={p.y} stroke="var(--panel-line)" strokeWidth="3" />
              <circle cx={p.x} cy={p.y} r="26" fill={DOT_COLORS[i % 3]} />
            </g>
          )
        })}
      </g>
      <circle cx="400" cy="320" r="120" fill="var(--panel-2)" stroke="var(--lane-main)" strokeWidth="5" strokeDasharray="14 12" />
      <text x="400" y="342" textAnchor="middle" className="art-mono" fontSize="76" fill="var(--lane-main)">{'</>'}</text>
      <text x="400" y="395" textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">open source</text>
      {Object.entries(RING_LABELS).map(([k, [label, color]]) => {
        const p = polar(400, 320, 250, Number(k), 24)
        return (
          <g key={k} transform={`translate(${p.x} ${p.y})`}>
            <rect x="-88" y="-30" width="176" height="60" rx="30" fill={color} />
            <text y="10" textAnchor="middle" className="art-text" fontSize="32" fill="var(--panel)">{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function KernelArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Apps sit on the kernel, which sits on the hardware">
      <rect x="40" y="30" width="720" height="440" rx="44" fill="var(--panel-2)" stroke="var(--panel-line)" strokeWidth="4" />
      <text x="80" y="92" className="art-text" fontSize="32" fill="var(--term-dim)">Your apps</text>
      <rect x="110" y="120" width="580" height="320" rx="36" fill="none" stroke="var(--lane-remote)" strokeWidth="5" strokeDasharray="14 12" />
      <text x="140" y="168" className="art-text" fontSize="30" fill="var(--lane-remote)">Operating system</text>
      <rect x="220" y="205" width="360" height="190" rx="30" fill="var(--lane-main)" />
      <text x="400" y="285" textAnchor="middle" className="art-text" fontSize="64" fill="var(--panel)">Kernel</text>
      <text x="400" y="340" textAnchor="middle" className="art-text" fontSize="30" fill="var(--panel)">the core</text>
      <rect x="40" y="490" width="720" height="62" rx="20" fill="var(--panel-2)" stroke="var(--lane-feature)" strokeWidth="4" />
      <text x="400" y="532" textAnchor="middle" className="art-text" fontSize="32" fill="var(--lane-feature)">Hardware</text>
      {[['Web servers', 40], ['Phones', 292], ['Supercomputers', 456]].map(([t, x]) => (
        <g key={t as string}>
          <rect x={x as number} y="580" width={t === 'Supercomputers' ? 304 : t === 'Phones' ? 144 : 232} height="48" rx="24" fill="var(--panel-2)" stroke="var(--panel-line)" strokeWidth="3" />
          <text x={(x as number) + (t === 'Supercomputers' ? 152 : t === 'Phones' ? 72 : 116)} y="613" textAnchor="middle" className="art-text" fontSize="31" fill="var(--term-text)">{t}</text>
        </g>
      ))}
    </svg>
  )
}

const MINI: [number, string, string, boolean][] = [
  [130, '1991', 'Linux', true],
  [400, '2005', '', false],
  [670, '2008', '', false],
]
const CROWD = Array.from({ length: 44 }, (_, i) => {
  const a = i * 2.39996
  const r = 40 + 190 * Math.sqrt((i + 1) / 44)
  return { x: 400 + r * Math.cos(a) * 1.5, y: 405 + r * Math.sin(a) * 0.8, c: DOT_COLORS[i % 3] }
})

function LinusArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Linux begins in 1991, then thousands of people send changes to one place">
      <line x1="130" y1="100" x2="670" y2="100" stroke="var(--panel-line)" strokeWidth="6" strokeLinecap="round" />
      {MINI.map(([x, year, label, lit]) => (
        <g key={year} opacity={lit ? 1 : 0.35}>
          <circle cx={x} cy="100" r="22" fill={lit ? 'var(--lane-main)' : 'var(--panel-2)'} stroke="var(--lane-main)" strokeWidth="4" />
          <text x={x} y="48" textAnchor="middle" className="art-text" fontSize="40" fill={lit ? 'var(--lane-main)' : 'var(--term-dim)'}>{year}</text>
          {label && <text x={x} y="160" textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">{label}</text>}
        </g>
      ))}
      {CROWD.map((d, i) => (
        <g key={i}>
          <line x1="400" y1="405" x2={d.x} y2={d.y} stroke="var(--panel-line)" strokeWidth="2" />
          <circle cx={d.x} cy={d.y} r="14" fill={d.c} />
        </g>
      ))}
      <circle cx="400" cy="405" r="68" fill="var(--lane-main)" stroke="var(--panel)" strokeWidth="8" />
      <text x="400" y="416" textAnchor="middle" className="art-text" fontSize="32" fill="var(--panel)">Linus</text>
      <text x="400" y="622" textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">thousands of contributors</text>
    </svg>
  )
}

const DOCS: [number, number, number, string, boolean][] = [
  [-190, -40, -14, 'old_v1', false],
  [170, -50, 12, 'copy_of', false],
  [-110, 40, -6, 'final_2', false],
  [100, 50, 8, 'REAL', false],
  [0, -10, 0, 'FINAL!!', true],
]
function ChaosArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="A pile of conflicting copies of the same file">
      <g transform="translate(400 270)">
        {DOCS.map(([x, y, rot, label, top]) => (
          <g key={label} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <rect x="-96" y="-124" width="192" height="248" rx="14" fill="var(--card)" stroke={top ? 'var(--accent)' : 'var(--card-border)'} strokeWidth="5" />
            <text x="0" y="-78" textAnchor="middle" className="art-mono" fontSize="31" fill="var(--ink)">{label}</text>
            {[-36, 0, 36, 72].map((ly) => <rect key={ly} x="-66" y={ly} width="132" height="12" rx="6" fill="var(--rail-future)" />)}
          </g>
        ))}
        <g transform="translate(0 -10)" stroke="var(--accent)" strokeWidth="22" strokeLinecap="round">
          <line x1="-70" y1="-70" x2="70" y2="70" />
          <line x1="70" y1="-70" x2="-70" y2="70" />
        </g>
      </g>
      {[['Lost work', 40, 190], ['Overwritten', 250, 230], ['No undo', 500, 170]].map(([t, x, w]) => (
        <g key={t as string}>
          <rect x={x as number} y="520" width={w as number} height="64" rx="32" fill="var(--accent)" />
          <text x={(x as number) + (w as number) / 2} y="562" textAnchor="middle" className="art-text" fontSize="30" fill="var(--accent-ink)">{t}</text>
        </g>
      ))}
    </svg>
  )
}

function SnapshotsArt() {
  return (
    <div className="snap-art">
      <div className="snap-card">
        <div className="snap-id">snapshot 5d6e7f8</div>
        <div className="snap-row"><b>Who</b> Mohsin</div>
        <div className="snap-row"><b>When</b> today, 10:42</div>
        <div className="snap-row"><b>Why</b> fix typo</div>
      </div>
      <Graph repo={AMBIENT_REPO} instant />
    </div>
  )
}

const TL: [number, string, string, string][] = [
  [130, '1991', 'Linux begins', 'var(--lane-main)'],
  [400, '2005', 'Git is written', 'var(--lane-feature)'],
  [670, '2008', 'GitHub launches', 'var(--lane-remote)'],
]
function BornArt() {
  const reduce = useReducedMotion()
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Timeline: Linux in 1991, Git in 2005, GitHub in 2008">
      <line x1="130" y1="300" x2="670" y2="300" stroke="var(--lane-main)" strokeWidth="8" strokeLinecap="round" />
      {TL.map(([x, year, label, color], i) => (
        <g key={year}>
          <motion.circle
            cx={x} cy="300" r={i === 1 ? 44 : 34} fill={color} stroke="var(--panel)" strokeWidth="10"
            initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.2 + i * 0.25 }}
            style={{ transformOrigin: `${x}px 300px`, transformBox: 'view-box' }}
          />
          <text x={x} y="200" textAnchor="middle" className="art-text" fontSize="56" fill={color}>{year}</text>
          <text x={x} y="400" textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">{label}</text>
        </g>
      ))}
      <text x="400" y="460" textAnchor="middle" className="art-mono" fontSize="30" fill="var(--term-dim)">about two weeks</text>
    </svg>
  )
}

export function StoryArt({ art }: { art: ArtId }) {
  switch (art) {
    case 'ring': return <RingArt />
    case 'kernel': return <KernelArt />
    case 'linus': return <LinusArt />
    case 'chaos': return <ChaosArt />
    case 'snapshots': return <SnapshotsArt />
    case 'born': return <BornArt />
  }
}

/* ---------- Git versus GitHub ---------- */
export function Compare() {
  return (
    <div className="compare">
      <div className="cmp-col">
        <svg viewBox="0 0 200 140" className="cmp-icon" aria-hidden>
          <rect x="30" y="10" width="140" height="94" rx="12" fill="var(--panel-2)" stroke="var(--lane-main)" strokeWidth="7" />
          <path d="M10 118 H190 L176 132 H24 Z" fill="var(--lane-main)" />
          <text x="100" y="72" textAnchor="middle" className="art-mono" fontSize="40" fill="var(--lane-main)">$ _</text>
        </svg>
        <h2 style={{ color: 'var(--lane-main)' }}>Git</h2>
        <p>The tool on your computer</p>
      </div>
      <div className="cmp-mid">
        <span>git push</span>
        <span className="cmp-arrow">{'\u2192'}</span>
        <span className="cmp-arrow">{'\u2190'}</span>
        <span>git pull</span>
      </div>
      <div className="cmp-col">
        <svg viewBox="0 0 200 140" className="cmp-icon" aria-hidden>
          <path
            transform="translate(90 100) scale(1.3)"
            d="M-52 24 H44 A26 26 0 0 0 46 -26 A34 34 0 0 0 -18 -34 A30 30 0 0 0 -52 24 Z"
            fill="rgba(127,214,224,0.1)" stroke="var(--lane-remote)" strokeWidth="5" strokeLinejoin="round"
          />
        </svg>
        <h2 style={{ color: 'var(--lane-remote)' }}>GitHub</h2>
        <p>A website that stores Git projects online</p>
      </div>
    </div>
  )
}

/* ---------- Setup: three stages, advanced one at a time ---------- */
export function SetupPanel({ steps, shown }: { steps: Step[]; shown: number }) {
  const { os } = useOS()
  const osLabel = OS_LIST.find((o) => o.id === os)!.label
  const detailOf = (d: Step['detail']) => (typeof d === 'string' ? d : d ? d[os as OS] : '')
  return (
    <div className="setup">
      <div className="setup-os">Your system: <strong>{osLabel}</strong> <span>(press O to change)</span></div>
      {steps.map((s, i) => {
        const state = i < shown - 1 ? 'done' : i === shown - 1 ? 'now' : 'next'
        return (
          <motion.div
            key={i} className={'setup-row ' + state} layout
            initial={false} animate={{ opacity: state === 'next' ? 0.4 : 1 }} transition={{ duration: 0.35 }}
          >
            <span className="setup-num">{state === 'done' ? '\u2713' : i + 1}</span>
            <div>
              <div className="setup-title">{s.label}</div>
              {state === 'now' && <div className="setup-detail">{detailOf(s.detail)}</div>}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function StubPanel() {
  return (
    <div className="stub">
      <div className="stub-title">Content coming</div>
      <div className="stub-sub">Part 2 (Vijay)</div>
    </div>
  )
}
