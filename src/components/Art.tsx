import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ArtId, Card, OS, Picture, Step } from '../engine/types'
import { OS_LIST, useOS } from '../os'
import { Graph } from './Graph'
import { AMBIENT_REPO } from './Panels'

/* ---------- messy folder: the screenshot, with a drawn stand-in ---------- */
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
/* Open source: many contributors around one shared source file, and the four freedoms a licence gives. */
const DOT_COLORS = ['var(--lane-main)', 'var(--lane-feature)', 'var(--lane-remote)']
const PEOPLE = [40, 75, 105, 140, 220, 255, 285, 320].map((deg, i) => {
  const a = (deg * Math.PI) / 180
  return { x: 400 + 205 * Math.sin(a), y: 320 - 175 * Math.cos(a), c: DOT_COLORS[i % 3], delay: (i * 0.35).toFixed(2) }
})
const FREEDOMS: [string, number, number, string][] = [
  ['Use', 400, 52, 'var(--lane-main)'],
  ['Study', 710, 320, 'var(--lane-remote)'],
  ['Modify', 400, 588, 'var(--lane-feature)'],
  ['Share', 90, 320, 'var(--lane-main)'],
]

function RingArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Many people around one shared source code file, connected to it. Four chips: use, study, modify, share.">
      <defs>
        <radialGradient id="os-glow-fill">
          <stop offset="0" stopColor="#c9e265" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c9e265" stopOpacity="0" />
        </radialGradient>
      </defs>
      {PEOPLE.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y} x2="400" y2="320" stroke="var(--panel-line)" strokeWidth="3" />
          <line className="os-flow" x1={p.x} y1={p.y} x2="400" y2="320" stroke={p.c} strokeWidth="4" strokeLinecap="round" style={{ animationDelay: `-${p.delay}s` }} />
        </g>
      ))}
      <circle className="os-glow" cx="400" cy="320" r="150" fill="url(#os-glow-fill)" />
      <path d="M335 228 H435 L470 263 V402 a14 14 0 0 1 -14 14 H344 a14 14 0 0 1 -14 -14 V242 a14 14 0 0 1 5 -14 Z" fill="var(--panel-2)" stroke="var(--lane-main)" strokeWidth="6" strokeLinejoin="round" />
      <path d="M435 228 V263 H470" fill="none" stroke="var(--lane-main)" strokeWidth="6" strokeLinejoin="round" />
      <text x="400" y="340" textAnchor="middle" className="art-mono" fontSize="56" fill="var(--lane-main)">{'</>'}</text>
      {[0, 1, 2].map((i) => <rect key={i} x="355" y={365 + i * 14} width={90 - i * 22} height="7" rx="3.5" fill="var(--lane-main)" opacity="0.6" />)}
      {PEOPLE.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r="34" fill="var(--panel)" />
          <circle cy="-12" r="11" fill={p.c} />
          <path d="M-19 20 v-4 a19 19 0 0 1 38 0 v4 z" fill={p.c} />
        </g>
      ))}
      <text x="400" y="472" textAnchor="middle" className="art-text" fontSize="32" fill="var(--term-text)">source code</text>
      {FREEDOMS.map(([label, x, y, color]) => (
        <g key={label} transform={`translate(${x} ${y})`}>
          <rect x="-80" y="-30" width="160" height="60" rx="30" fill={color} />
          <text y="11" textAnchor="middle" className="art-text" fontSize="34" fill="var(--panel)">{label}</text>
        </g>
      ))}
    </svg>
  )
}
function KernelArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Apps sit on the kernel, which sits on the hardware">
      <rect x="40" y="30" width="720" height="440" rx="44" fill="var(--panel-2)" stroke="var(--panel-line)" strokeWidth="4" />
      <text x="80" y="92" className="art-text" fontSize="32" fill="var(--term-dim)">Your apps</text>
      <rect x="110" y="120" width="580" height="320" rx="36" fill="none" stroke="var(--lane-remote)" strokeWidth="5" strokeDasharray="14 12" />
      <text x="140" y="168" className="art-text" fontSize="34" fill="var(--lane-remote)">Operating system</text>
      <rect x="220" y="205" width="360" height="190" rx="30" fill="var(--lane-main)" />
      <text x="400" y="285" textAnchor="middle" className="art-text" fontSize="64" fill="var(--panel)">Kernel</text>
      <text x="400" y="340" textAnchor="middle" className="art-text" fontSize="34" fill="var(--panel)">the core</text>
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
          <text x={x} y="48" textAnchor="middle" className="art-text" fontSize="52" fill={lit ? 'var(--lane-main)' : 'var(--term-dim)'}>{year}</text>
          {label && <text x={x} y="170" textAnchor="middle" className="art-text" fontSize="44" fill="var(--term-text)">{label}</text>}
        </g>
      ))}
      {CROWD.map((d, i) => (
        <g key={i}>
          <line x1="400" y1="405" x2={d.x} y2={d.y} stroke="var(--panel-line)" strokeWidth="2" />
          <circle cx={d.x} cy={d.y} r="14" fill={d.c} />
        </g>
      ))}
      <circle cx="400" cy="405" r="68" fill="var(--lane-main)" stroke="var(--panel)" strokeWidth="8" />
      <text x="400" y="420" textAnchor="middle" className="art-text" fontSize="42" fill="var(--panel)">Linus</text>
      <text x="400" y="622" textAnchor="middle" className="art-text" fontSize="42" fill="var(--term-text)">thousands of contributors</text>
    </svg>
  )
}

const asset = (src: string) => import.meta.env.BASE_URL + src

/* ---------- Linus card: a real photo next to the crowd drawing ---------- */
export function LinusPanel({ picture }: { picture?: Picture }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="panel linus-panel">
      {picture && (
        <figure className="linus-photo">
          {ok ? (
            <img src={asset(picture.src)} alt={picture.alt} onError={() => setOk(false)} />
          ) : (
            <div className="photo-missing">Photo missing: add public/{picture.src}</div>
          )}
          {picture.credit && <figcaption>{picture.credit}</figcaption>}
        </figure>
      )}
      <div className="linus-art"><LinusArt /></div>
    </div>
  )
}

/* ---------- Mukti card: motto and links ---------- */
export function MuktiPanel({ tagline, links }: { tagline?: Card['tagline']; links?: Card['links'] }) {
  return (
    <div className="panel mukti-panel">
      {tagline && (
        <div>
          <div className="mk-tag">{tagline.text}</div>
          <div className="mk-trans">{tagline.translation}</div>
        </div>
      )}
      <ul className="mk-links">
        {links?.map((l) => (
          <li key={l.label}>
            <b>{l.label}</b>
            {l.url ? <a className="text-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.url.replace(/^(https?:\/\/|mailto:)/, '')}</a> : <span className="todo">TODO: add the {l.label} link</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Personal software: one person, a few apps, open source underneath ---------- */
function AudienceArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="One person with a few small apps built just for them, all sitting on open source parts">
      <circle cx="110" cy="230" r="46" fill="var(--lane-main)" />
      <rect x="48" y="292" width="124" height="120" rx="52" fill="var(--lane-main)" />
      <text x="110" y="470" textAnchor="middle" className="art-text" fontSize="44" fill="var(--term-text)">You</text>
      {['Timetable', 'Expenses', 'Anything'].map((t, i) => {
        const y = 70 + i * 140
        return (
          <g key={t}>
            <line x1="180" y1="330" x2="330" y2={y + 50} stroke="var(--panel-line)" strokeWidth="4" strokeLinecap="round" />
            <rect x="330" y={y} width="420" height="100" rx="26" fill="var(--panel-2)" stroke={DOT_COLORS[i]} strokeWidth="5" />
            <text x="540" y={y + 66} textAnchor="middle" className="art-text" fontSize="44" fill="var(--term-text)">{t}</text>
          </g>
        )
      })}
      <rect x="40" y="520" width="720" height="84" rx="42" fill="none" stroke="var(--lane-feature)" strokeWidth="5" strokeDasharray="14 12" />
      <text x="400" y="574" textAnchor="middle" className="art-text" fontSize="42" fill="var(--lane-feature)">open source parts</text>
    </svg>
  )
}

/* ---------- Full-bleed screenshot card, with a visible placeholder if the file is missing ---------- */
export function ShotFigure({ picture }: { picture: Picture }) {
  const [ok, setOk] = useState(true)
  return (
    <figure className="fs-fig">
      {ok ? (
        <img className="fs-img" src={asset(picture.src)} alt={picture.alt} onError={() => setOk(false)} />
      ) : (
        <div className="fs-missing" role="img" aria-label={picture.alt}>
          <strong>Screenshot missing</strong>
          <span>Add the file public/{picture.src}</span>
        </div>
      )}
      {picture.caption && <figcaption>{picture.caption}</figcaption>}
    </figure>
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
          <text x={x} y="400" textAnchor="middle" className="art-text" fontSize="34" fill="var(--term-text)">{label}</text>
        </g>
      ))}
    </svg>
  )
}

/* ---------- Open source contribution: forking one project into many hands ---------- */
const FORKS: [number, number][] = [[-220, -60], [0, -100], [220, -60], [-150, 100], [150, 100]]
function CollabArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="One shared project, forked and worked on by several people, feeding changes back">
      <g transform="translate(400 150)">
        <rect x="-130" y="-54" width="260" height="108" rx="20" fill="var(--lane-main)" />
        <text x="0" y="8" textAnchor="middle" className="art-mono" fontSize="34" fill="var(--panel)">{'</>'}</text>
      </g>
      {FORKS.map(([dx, dy], i) => (
        <g key={i} transform={`translate(${400 + dx} ${300 + dy})`}>
          <line x1="0" y1={dy > 0 ? -60 : 60} x2={-dx * 0.18} y2={dy > 0 ? -130 - dy * 0.3 : 130 - dy * 0.1} stroke="var(--panel-line)" strokeWidth="4" />
          <circle r="34" fill="var(--panel-2)" stroke={DOT_COLORS[i % 3]} strokeWidth="5" />
          <text y="10" textAnchor="middle" className="art-mono" fontSize="34" fill={DOT_COLORS[i % 3]}>{'</>'}</text>
        </g>
      ))}
      <text x="400" y="560" textAnchor="middle" className="art-text" fontSize="36" fill="var(--term-text)">Linux &middot; Firefox &middot; VS Code</text>
      <text x="400" y="604" textAnchor="middle" className="art-text" fontSize="28" fill="var(--term-dim)">built in the open, by anyone who shows up</text>
    </svg>
  )
}

/* ---------- Issues: a card with coloured labels ---------- */
const LABELS: [string, string][] = [
  ['good first issue', 'var(--lane-main)'],
  ['help wanted', 'var(--lane-remote)'],
  ['bug', 'var(--lane-feature)'],
  ['enhancement', DOT_COLORS[1]],
]
function IssueLabelsArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="A GitHub issue card with coloured labels: good first issue, help wanted, bug, enhancement">
      <rect x="80" y="70" width="640" height="500" rx="26" fill="var(--panel-2)" stroke="var(--panel-line)" strokeWidth="4" />
      <circle cx="140" cy="140" r="16" fill="var(--lane-main)" />
      <text x="175" y="150" className="art-text" fontSize="36" fill="var(--term-text)">Button click does nothing on mobile</text>
      <text x="140" y="196" className="art-mono" fontSize="34" fill="var(--term-dim)">#42 opened by a contributor</text>
      <line x1="120" y1="230" x2="680" y2="230" stroke="var(--panel-line)" strokeWidth="2" />
      {LABELS.map(([label, color], i) => {
        const w = label.length * 17 + 50
        const x = 140 + (i % 2) * 320
        const y = 280 + Math.floor(i / 2) * 90
        return (
          <g key={label}>
            <rect x={x} y={y} width={w} height="58" rx="29" fill={color} />
            <text x={x + w / 2} y={y + 38} textAnchor="middle" className="art-text" fontSize="28" fill="var(--panel)">{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- Pull requests: changes become a reviewed proposal (vertical, so longer labels have room) ---------- */
const PR_FLOW: [string, string][] = [
  ['Your changes', 'var(--lane-main)'],
  ['Pull request', 'var(--lane-feature)'],
  ['Review', 'var(--lane-remote)'],
  ['Merge?', 'var(--lane-main)'],
]
function PrFlowArt() {
  const rowY = (i: number) => 110 + i * 140
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Your changes become a pull request, go through review, and may be merged">
      <line x1="150" y1={rowY(0)} x2="150" y2={rowY(PR_FLOW.length - 1)} stroke="var(--panel-line)" strokeWidth="8" strokeLinecap="round" />
      {PR_FLOW.map(([label, color], i) => {
        const y = rowY(i)
        return (
          <g key={label}>
            <circle cx="150" cy={y} r="38" fill={color} stroke="var(--panel)" strokeWidth="8" />
            <text x="150" y={y + 11} textAnchor="middle" className="art-text" fontSize="32" fill="var(--panel)">{i + 1}</text>
            <text x="230" y={y + 12} className="art-text" fontSize="36" fill="var(--term-text)">{label}</text>
          </g>
        )
      })}
      <text x="400" y="600" textAnchor="middle" className="art-text" fontSize="28" fill="var(--term-dim)">opening a PR does not mean it is accepted</text>
    </svg>
  )
}

/* ---------- Fork / pull request direction: two repositories and an arrow between them ---------- */
function RepoFlowArt({ left, right, badge, reverse }: { left: string; right: string; badge?: string; reverse?: boolean }) {
  const a = reverse ? right : left
  const b = reverse ? left : right
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label={`${left} and ${right}, connected by an arrow`}>
      <rect x="60" y="230" width="260" height="140" rx="22" fill="var(--panel-2)" stroke="var(--lane-main)" strokeWidth="6" />
      <text x="190" y="290" textAnchor="middle" className="art-mono" fontSize="30" fill="var(--lane-main)">{'</>'}</text>
      <text x="190" y="332" textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">{a}</text>

      <rect x="480" y="230" width="260" height="140" rx="22" fill="var(--panel-2)" stroke="var(--lane-remote)" strokeWidth="6" />
      <text x="610" y="290" textAnchor="middle" className="art-mono" fontSize="30" fill="var(--lane-remote)">{'</>'}</text>
      <text x="610" y="332" textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">{b}</text>

      <path d="M330 300 H470" stroke="var(--term-dim)" strokeWidth="8" strokeLinecap="round" />
      <path d="M460 272 L500 300 L460 328 Z" fill="var(--term-dim)" />
      {badge && (
        <g transform="translate(400 190)">
          <rect x="-120" y="-30" width="240" height="56" rx="28" fill="var(--lane-feature)" />
          <text y="8" textAnchor="middle" className="art-text" fontSize="30" fill="var(--panel)">{badge}</text>
        </g>
      )}
    </svg>
  )
}
function ForkArt() { return <RepoFlowArt left="Original repository" right="Your fork" /> }
function PrDirectionArt() { return <RepoFlowArt left="Your fork" right="Original repository" badge="Pull request" reverse /> }

/* ---------- Complete workflow: eight steps, two rows ---------- */
const WF_STEPS = ['Find issue', 'Fork it', 'Clone it', 'Edit files', 'Commit', 'Push', 'Open PR', 'Merge']
function WorkflowArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Eight workflow steps: find an issue, fork, clone, make changes, commit, push, open a pull request, review and merge">
      {[0, 1].map((row) => (
        <line key={row} x1="90" y1={230 + row * 220} x2="710" y2={230 + row * 220} stroke="var(--panel-line)" strokeWidth="6" strokeLinecap="round" />
      ))}
      {WF_STEPS.map((label, i) => {
        const row = i < 4 ? 0 : 1
        const col = i % 4
        const x = 90 + col * (620 / 3)
        const y = 230 + row * 220
        return (
          <g key={label}>
            <circle cx={x} cy={y} r="34" fill={DOT_COLORS[i % 3]} stroke="var(--panel)" strokeWidth="7" />
            <text x={x} y={y + 10} textAnchor="middle" className="art-text" fontSize="28" fill="var(--panel)">{i + 1}</text>
            <text x={x} y={y + 64} textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- MUKTI challenge: the six steps participants will follow ---------- */
const CHALLENGE_STEPS = ['Start here', 'Find task', 'Complete it', 'Submit PR', 'Verify it', 'Troubleshoot']
function ChallengeStepsArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="Six challenge steps: start here, find your task, complete it, submit your pull request, verify it, troubleshoot">
      {CHALLENGE_STEPS.map((label, i) => {
        const col = i % 3, row = Math.floor(i / 3)
        const x = 160 + col * 240
        const y = 210 + row * 230
        return (
          <g key={label}>
            <rect x={x - 108} y={y - 70} width="216" height="140" rx="22" fill="var(--panel-2)" stroke={DOT_COLORS[i % 3]} strokeWidth="5" />
            <text x={x} y={y - 18} textAnchor="middle" className="art-text" fontSize="34" fill={DOT_COLORS[i % 3]}>{i + 1}</text>
            <text x={x} y={y + 30} textAnchor="middle" className="art-text" fontSize="30" fill="var(--term-text)">{label}</text>
          </g>
        )
      })}
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
    case 'audience': return <AudienceArt />
    case 'collab': return <CollabArt />
    case 'issueLabels': return <IssueLabelsArt />
    case 'prFlow': return <PrFlowArt />
    case 'forkFlow': return <ForkArt />
    case 'prDirection': return <PrDirectionArt />
    case 'workflowSteps': return <WorkflowArt />
    case 'challengeSteps': return <ChallengeStepsArt />
    case 'githubSignup': return <SignupArt />
    case 'codespaces': return <CodespacesArt />
    case 'ready': return <ReadyArt />
    case 'mukti': return null
  }
}

/* ---------- Workshop: operating system tiles ---------- */
const OS_BLURB: Record<OS, string> = {
  windows: 'Windows 10 or 11',
  macos: 'MacBook, iMac or Mac mini',
  linux: 'Ubuntu, Debian, Fedora and friends',
}
export function OSTiles() {
  const { os, setOS, detected } = useOS()
  return (
    <div className="os-tiles" role="radiogroup" aria-label="Operating system">
      {OS_LIST.map((o) => (
        <button
          key={o.id} role="radio" aria-checked={os === o.id}
          className={'os-tile' + (os === o.id ? ' on' : '')}
          onClick={() => setOS(o.id)}
        >
          <span className="os-tile-name">{o.label}</span>
          <span className="os-tile-sub">{OS_BLURB[o.id]}</span>
          {detected === o.id && <span className="os-detected">detected</span>}
          <span className="os-tile-check" aria-hidden>{os === o.id ? '\u2713' : ''}</span>
        </button>
      ))}
    </div>
  )
}

/* ---------- Workshop: illustrations (no terminal needed) ---------- */
function SignupArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="A sign up form with email, password and username fields and a free plan button">
      <rect x="130" y="70" width="540" height="500" rx="28" fill="var(--panel-2)" stroke="var(--lane-remote)" strokeWidth="6" />
      <text x="400" y="145" textAnchor="middle" className="art-text" fontSize="44" fill="var(--term-text)">Sign up for GitHub</text>
      {['Email', 'Password', 'Username'].map((label, i) => (
        <g key={label}>
          <rect x="190" y={180 + i * 90} width="420" height="64" rx="14" fill="var(--panel)" stroke="var(--panel-line)" strokeWidth="3" />
          <text x="215" y={222 + i * 90} className="art-text" fontSize="30" fill="var(--term-dim)">{label}</text>
        </g>
      ))}
      <rect x="190" y="470" width="420" height="64" rx="32" fill="var(--lane-main)" />
      <text x="400" y="512" textAnchor="middle" className="art-text" fontSize="32" fill="var(--panel)">Choose the free plan</text>
    </svg>
  )
}

function CodespacesArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="A browser window containing a code editor and a terminal">
      <rect x="60" y="80" width="680" height="480" rx="28" fill="var(--panel-2)" stroke="var(--lane-remote)" strokeWidth="6" />
      <line x1="60" y1="150" x2="740" y2="150" stroke="var(--panel-line)" strokeWidth="3" />
      {[0, 1, 2].map((i) => <circle key={i} cx={105 + i * 36} cy="115" r="10" fill={DOT_COLORS[i]} />)}
      <rect x="250" y="98" width="440" height="34" rx="17" fill="var(--panel)" />
      <text x="470" y="123" textAnchor="middle" className="art-mono" fontSize="30" fill="var(--term-dim)">github.com/codespaces</text>
      <rect x="90" y="180" width="270" height="230" rx="14" fill="var(--panel)" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x="115" y={210 + i * 48} width={170 - i * 22} height="16" rx="8" fill="var(--lane-remote)" opacity="0.7" />)}
      <rect x="380" y="180" width="330" height="230" rx="14" fill="var(--panel)" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="405" y={208 + i * 38} width={250 - ((i * 53) % 110)} height="14" rx="7" fill="var(--term-dim)" opacity="0.6" />)}
      <rect x="90" y="430" width="620" height="110" rx="14" fill="var(--panel)" />
      <text x="115" y="480" className="art-mono" fontSize="28" fill="var(--lane-main)">$ git --version</text>
      <text x="115" y="520" className="art-mono" fontSize="28" fill="var(--term-text)">git version 2.x.y</text>
    </svg>
  )
}

const READY_ITEMS = ['Visual Studio Code', 'Git', 'GitHub account', 'GitHub command line', 'Your identity']
function ReadyArt() {
  return (
    <svg className="art" viewBox="0 0 800 640" role="img" aria-label="A checklist of the five things installed, all ticked">
      {READY_ITEMS.map((label, i) => {
        const y = 90 + i * 100
        return (
          <g key={label}>
            <rect x="120" y={y} width="560" height="76" rx="20" fill="var(--panel-2)" stroke={DOT_COLORS[i % 3]} strokeWidth="4" />
            <circle cx="170" cy={y + 38} r="22" fill={DOT_COLORS[i % 3]} />
            <path d={`M${160} ${y + 38} l8 9 l16 -18`} fill="none" stroke="var(--panel)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <text x="220" y={y + 49} className="art-text" fontSize="34" fill="var(--term-text)">{label}</text>
          </g>
        )
      })}
    </svg>
  )
}
/* ---------- Going remote: a laptop, a cloud, and an arrow that is not used yet ---------- */
export function RemoteArt() {
  return (
    <svg className="art" viewBox="0 0 960 640" role="img" aria-label="A laptop holding commits and a cloud, joined by a grey dashed arrow that is not connected yet">
      <rect x="50" y="130" width="220" height="190" rx="16" fill="var(--panel-2)" stroke="var(--lane-main)" strokeWidth="7" />
      <path d="M20 340 H300 L282 368 H38 Z" fill="var(--lane-main)" />
      <line x1="95" y1="225" x2="225" y2="225" stroke="var(--lane-main)" strokeWidth="6" />
      {[95, 160, 225].map((x) => <circle key={x} cx={x} cy="225" r="20" fill="var(--lane-main)" stroke="var(--panel)" strokeWidth="5" />)}
      <text x="160" y="440" textAnchor="middle" className="art-text" fontSize="40" fill="var(--lane-main)">Your laptop</text>
      <text x="160" y="490" textAnchor="middle" className="art-text" fontSize="32" fill="var(--term-text)">Git lives here</text>

      <path
        transform="translate(765 265) scale(2.3)"
        d="M-52 24 H44 A26 26 0 0 0 46 -26 A34 34 0 0 0 -18 -34 A30 30 0 0 0 -52 24 Z"
        fill="rgba(127,214,224,0.12)" stroke="var(--lane-remote)" strokeWidth="3" strokeLinejoin="round"
      />
      <text x="765" y="440" textAnchor="middle" className="art-text" fontSize="40" fill="var(--lane-remote)">GitHub</text>
      <text x="765" y="490" textAnchor="middle" className="art-text" fontSize="32" fill="var(--term-text)">A copy online</text>

      <line x1="335" y1="240" x2="545" y2="240" stroke="var(--term-dim)" strokeWidth="9" strokeDasharray="22 16" strokeLinecap="round" />
      <path d="M540 212 L594 240 L540 268 Z" fill="var(--term-dim)" />
      <text x="450" y="330" textAnchor="middle" className="art-text" fontSize="32" fill="var(--term-dim)">not connected yet</text>
    </svg>
  )
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
      <div className="stub-sub">Part 2</div>
    </div>
  )
}




/* ---------- Keep going: the same links as tiles (left) and as a list with visible addresses (right) ---------- */
type Resource = NonNullable<Card['resources']>[number]
export function ResourceTiles({ items }: { items: Resource[] }) {
  return (
    <ul className="res-tiles">
      {items.map((r) => (
        <li key={r.url}>
          <a className="res-tile" href={r.url} target="_blank" rel="noopener noreferrer">
            <b>{r.title}</b>
            <span>{r.line}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
export function ResourceList({ items }: { items: Resource[] }) {
  return (
    <ol className="res-list">
      {items.map((r) => (
        <li key={r.url}>
          <a className="text-link" href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
          <code>{r.address.split('/').map((p, i, all) => i < all.length - 1 ? <span key={i}>{p}/<wbr /></span> : p)}</code>
        </li>
      ))}
    </ol>
  )
}

