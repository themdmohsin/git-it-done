import { useState } from 'react'

export function copyText(text: string) {
  try {
    if (navigator.clipboard) { void navigator.clipboard.writeText(text); return }
  } catch { /* fall through */ }
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy') } catch { /* ignore */ }
  document.body.removeChild(ta)
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="copy-btn"
      onClick={() => { copyText(text); setDone(true); setTimeout(() => setDone(false), 1200) }}
      aria-label={'Copy ' + text}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

export function CommandChip({ label, cmd }: { label?: string; cmd: string }) {
  return (
    <div className="chip-cmd">
      {label && <span className="chip-label">{label}</span>}
      <code>{cmd}</code>
      <CopyButton text={cmd} />
    </div>
  )
}
