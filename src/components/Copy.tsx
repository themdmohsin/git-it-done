import { Fragment, useEffect, useRef, useState } from 'react'
import { askDetails, fill, missing, TOKEN_LABEL, useUserDetails, type Field } from '../userDetails'

function writeClipboard(text: string) {
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

/**
 * The one way anything on the site copies a command. If the text needs a personal value that is still empty,
 * the "Your details" window opens first and the finished command is copied after Save. Closing the window
 * without saving copies nothing. The text is never copied while it still contains a {{token}}.
 * `result` is told whether the copy happened.
 */
export function copyCommand(text: string, result?: (copied: boolean) => void) {
  const attempt = () => {
    const out = fill(text)
    if (out.includes('{{') || out.includes('}}')) return false
    writeClipboard(out)
    return true
  }
  if (!missing(text) && attempt()) { result?.(true); return }
  askDetails(() => result?.(attempt()), () => result?.(false))
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

/** The one copy button. `className` picks the look on each page; the label and note are the same everywhere. */
export function CopyButton({ text, label = 'Copy', className = 'copy-btn' }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)
  const { details } = useUserDetails()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const onClick = () => copyCommand(text, (copied) => {
    setState(copied ? 'done' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), copied ? 1200 : 3500)
  })
  return (
    <span className="copy-wrap">
      <button type="button" className={className} onClick={onClick} aria-label={'Copy ' + fill(text, details)}>
        {state === 'done' ? 'Copied' : label}
      </button>
      {state === 'failed' && <span className="copy-note" role="status">Not copied. Add your details first.</span>}
    </span>
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