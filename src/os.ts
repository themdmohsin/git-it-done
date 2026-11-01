import { createContext, useContext } from 'react'
import type { OS } from './engine/types'

export const OS_LIST: { id: OS; label: string }[] = [
  { id: 'windows', label: 'Windows' },
  { id: 'macos', label: 'macOS' },
  { id: 'linux', label: 'Linux' },
]

export function detectOS(): OS {
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac')) return 'macos'
  return 'linux'
}

const KEY = 'gid.os'
export function loadOS(): OS | null {
  try { const v = localStorage.getItem(KEY); if (v === 'windows' || v === 'macos' || v === 'linux') return v } catch { /* memory only */ }
  return null
}
export function saveOS(os: OS) { try { localStorage.setItem(KEY, os) } catch { /* memory only */ } }

export const REPO = '~/your-first-repo'
export function prompt(os: OS) {
  if (os === 'windows') return 'MINGW64 ' + REPO + ' $'
  if (os === 'macos') return REPO + ' %'
  return 'user@laptop:' + REPO + '$'
}

export const OPEN_TERMINAL: Record<OS, string> = {
  windows: 'Start menu > Git Bash',
  macos: 'Cmd+Space > Terminal',
  linux: 'Ctrl+Alt+T',
}
export const TERMINAL_NAME: Record<OS, string> = { windows: 'Git Bash', macos: 'Terminal', linux: 'your terminal' }

export const INSTALL: Record<OS, { text: string; cmd: string }[]> = {
  windows: [{ text: 'Download from git-scm.com, then run:', cmd: 'git --version' }],
  macos: [{ text: 'Run this (accept the Command Line Tools prompt):', cmd: 'git --version' }],
  linux: [
    { text: 'Debian / Ubuntu:', cmd: 'sudo apt install git' },
    { text: 'Fedora:', cmd: 'sudo dnf install git' },
  ],
}

export interface OSCtx { os: OS; detected: OS; setOS: (o: OS) => void; openPicker: () => void }
export const OSContext = createContext<OSCtx>({ os: 'linux', detected: 'linux', setOS: () => {}, openPicker: () => {} })
export const useOS = () => useContext(OSContext)


