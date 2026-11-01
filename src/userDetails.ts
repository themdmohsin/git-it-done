import { useSyncExternalStore } from 'react'

export type Field = 'name' | 'email' | 'ghuser' | 'repo'
export type Details = Record<Field, string>
export type Errors = Partial<Record<Field, string>>

export const DEFAULT_REPO = 'my-first-repo'
export const FIELDS: Field[] = ['name', 'email', 'ghuser', 'repo']
export const TOKEN_LABEL: Record<Field, string> = {
  name: 'your name',
  email: 'your email',
  ghuser: 'your GitHub username',
  repo: 'repository name',
}

const KEY = 'gid.details'
const EMPTY: Details = { name: '', email: '', ghuser: '', repo: DEFAULT_REPO }

function load(): Details {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const o = JSON.parse(raw) as Partial<Details>
      return { ...EMPTY, ...Object.fromEntries(FIELDS.filter((f) => typeof o[f] === 'string').map((f) => [f, o[f]])) }
    }
  } catch { /* memory only */ }
  return { ...EMPTY }
}

let state: Details = load()
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
const snapshot = () => state

export const getDetails = () => state

/** Checks one field. Returns the cleaned value to store, or a friendly message. */
export function validate(field: Field, input: string): { value: string } | { error: string } {
  const v = input.trim()
  switch (field) {
    case 'name':
      return { value: v.replace(/\s+/g, ' ') }
    case 'email': {
      if (v === '') return { value: '' }
      const parts = v.split('@')
      const ok = parts.length === 2 && parts[0] !== '' && /^[^\s@]+\.[^\s@]+$/.test(parts[1]) && !/\s/.test(v)
      return ok ? { value: v } : { error: 'That does not look like an email. Try name@example.com' }
    }
    case 'ghuser': {
      const u = v.replace(/^@/, '')
      if (u === '') return { value: '' }
      return /^[A-Za-z0-9-]+$/.test(u) ? { value: u } : { error: 'Use only letters, digits and hyphens (no spaces or @).' }
    }
    case 'repo': {
      const r = v.replace(/\s+/g, '-').replace(/[^A-Za-z0-9_.-]/g, '')
      return { value: r || DEFAULT_REPO }
    }
  }
}

/** Saves every valid field and returns a message for each invalid one (those are not saved). */
export function saveDetails(input: Details): Errors {
  const errors: Errors = {}
  const next = { ...state }
  for (const f of FIELDS) {
    const r = validate(f, input[f])
    if ('error' in r) errors[f] = r.error
    else next[f] = r.value
  }
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* memory only */ }
  listeners.forEach((l) => l())
  return errors
}

export function useUserDetails() {
  const details = useSyncExternalStore(subscribe, snapshot)
  return { details, filled: !!(details.name && details.email && details.ghuser), save: saveDetails }
}

const shellSafe = (s: string) => s.replace(/[\\"$`]/g, '\\$&')
const TOKEN = /\{\{(name|email|ghuser|repo)\}\}/g

function prepared(d: Details): Details {
  return {
    name: shellSafe(d.name.trim().replace(/\s+/g, ' ')),
    email: shellSafe(d.email.trim()),
    ghuser: d.ghuser.trim().replace(/[\s@]/g, ''),
    repo: d.repo.trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9_.-]/g, ''),
  }
}

/** Replaces {{name}}, {{email}}, {{ghuser}}, {{repo}}. Tokens whose value is empty stay in place. */
export function fill(text: string, d: Details = state): string {
  const p = prepared(d)
  return text.replace(TOKEN, (t, f: Field) => p[f] || t)
}

/** True when the text still contains a token whose value is empty. */
export function missing(text: string, d: Details = state): boolean {
  return /\{\{(name|email|ghuser|repo)\}\}/.test(fill(text, d))
}

/* Lets any copy button ask the app to open the "Your details" window, then continue after Save. */
let opener: ((after?: () => void) => void) | null = null
export const setDetailsOpener = (o: typeof opener) => { opener = o }
export const askDetails = (after?: () => void) => opener?.(after)
