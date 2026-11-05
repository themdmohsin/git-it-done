import { Fragment } from 'react'

/* Addresses written as plain text in sentences. Commands and code blocks never go through here. */
const ADDRESS = /\b(?:cli\.github\.com|docs\.github\.com|code\.visualstudio\.com|git-scm\.com|github\.com|kernel\.org|opensource\.org|brew\.sh)(?:\/[\w.~\-/]*[\w~\-/])?/g
const EXAMPLE_PATH = /^\/</
const EXAMPLE_USER = /^\/(?:you|username|your-username)\b/
/* Example addresses used for illustration that do not point at a real page. */
const NOT_LINKED = new Set(['github.com/dilipg/tensorflow'])

export const externalLink = { target: '_blank', rel: 'noopener noreferrer' } as const

/** Turns web addresses in plain text into links with an explicit https:// address that open in a new tab. */
export function Linkify({ text }: { text: string }) {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(ADDRESS)) {
    const at = m.index ?? 0
    const after = text.slice(at + m[0].length)
    if (NOT_LINKED.has(m[0]) || EXAMPLE_PATH.test(after) || EXAMPLE_USER.test(m[0].slice(m[0].indexOf('/')))) continue
    if (at > last) out.push(<Fragment key={last}>{text.slice(last, at)}</Fragment>)
    out.push(<a key={at} className="text-link" href={'https://' + m[0]} {...externalLink}>{m[0]}</a>)
    last = at + m[0].length
  }
  if (last < text.length) out.push(<Fragment key={last}>{text.slice(last)}</Fragment>)
  return <>{out}</>
}
