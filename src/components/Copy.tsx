import { Fragment, useState } from 'react'
import { askDetails, fill, missing, TOKEN_LABEL, useUserDetails, type Field } from '../userDetails'

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

/** Shows a command with the saved values filled in; any still-empty value shows as a coral label. */
export function Cmd({ text }: { text: string }) {
  const { details } = useUserDetails()
  return (
    <>
      {fill(text, details).split(/(\{\{(?:name|email|ghuser|repo)\}\})/).map((p, i) => {
        const m = /^\{\{(\w+)\}\}$/.exec(p)
        return m ? <span key={i} className="tok">{'<' + TOKEN_LABEL[m[1] as Field] + '>'}</span> : <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  const { details } = useUserDetails()
  const copy = () => { copyText(fill(text)); setDone(true); setTimeout(() => setDone(false), 1200) }
  return (
    <button
      className="copy-btn"
      onClick={() => {
        if (missing(text)) askDetails(() => { if (!missing(text)) copy() })
        else copy()
      }}
      aria-label={'Copy ' + fill(text, details)}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

export function CommandChip({ label, cmd }: { label?: string; cmd: string }) {
  return (
    <div className="chip-cmd">
      {label && <span className="chip-label">{label}</span>}
      <code><Cmd text={cmd} /></code>
      <CopyButton text={cmd} />
    </div>
  )
}