import type { Card, OS, OSPart } from './engine/types'
import { workshopContent } from './workshopContent'

/*
 * The hands-on workshop section: choose a system, then set up the laptop (five steps, written in install.ts),
 * then continue to the separate hands-on tutorial page (#/workshop). Drawer wording lives in workshopContent.ts.
 */
const base: Card[] = [
  {
    id: 'os',
    rail: 'Which laptop',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Start',
    title: 'Which laptop do you have?',
    sentence: 'Pick yours and every instruction from here on matches it.',
    view: 'oschoice',
    lane: 'main',
    steps: [],
    drawer: { happening: 'You install five things, once per laptop.' },
  },
  {
    id: 'vscode',
    rail: 'Visual Studio Code',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 1 of 5',
    title: 'Install Visual Studio Code',
    sentence: 'One window with your files and a terminal.',
    view: 'install',
    lane: 'main',
    steps: [],
    drawer: { happening: 'Visual Studio Code (VS Code) is the editor used all day in this workshop.' },
  },
  {
    id: 'git-install',
    rail: 'Git',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 2 of 5',
    title: 'Install Git',
    sentence: 'Git is the program that keeps your history. First, check if you already have it.',
    view: 'install',
    lane: 'main',
    steps: [],
    drawer: { happening: 'Git is the program that keeps your history.' },
  },
  {
    id: 'github-account',
    rail: 'GitHub account',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 3 of 5',
    title: 'Create a GitHub account',
    sentence: 'A free online home for your projects. It is the same on every operating system.',
    view: 'install',
    lane: 'main',
    steps: [],
    drawer: { happening: 'GitHub is the website that stores your projects online.' },
  },
  {
    id: 'gh-install',
    rail: 'GitHub CLI and log in',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 4 of 5',
    title: 'Install GitHub CLI and log in',
    sentence: 'It logs Git in to GitHub for you, so the first push just works.',
    view: 'install',
    lane: 'main',
    steps: [],
    drawer: { happening: 'GitHub CLI (command line interface) logs Git in to GitHub. You sign in once, in the browser, and Git remembers it.' },
  },
  {
    id: 'identity',
    rail: 'Your identity',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 5 of 5',
    title: 'Set up your Git identity',
    sentence: 'A label stamped on every commit. It is not a login.',
    view: 'install',
    lane: 'main',
    steps: [],
    drawer: { happening: 'Your name and email are written into every commit you make.' },
  },
  {
    id: 'codespaces',
    rail: 'Plan B',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Plan B',
    title: 'Laptop won\u2019t cooperate? Use GitHub Codespaces.',
    sentence: 'Your browser becomes the laptop.',
    view: 'story',
    art: 'codespaces',
    lane: 'main',
    steps: [],
    drawer: { happening: 'GitHub Codespaces is a computer in the cloud that you use from a browser.' },
  },
  {
    id: 'ready',
    rail: 'Ready',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Done',
    title: 'You\u2019re set. Now let\u2019s make commits.',
    sentence: 'Go back to the command slides and copy each command as we go.',
    view: 'story',
    art: 'ready',
    lane: 'main',
    steps: [],
    drawer: { happening: 'Setup is finished.' },
  },
]

const mergeOS = (a: Card['os'], b: Record<OS, OSPart> | undefined): Card['os'] => {
  if (!a || !b) return a ?? b
  const out = {} as Record<OS, OSPart>
  ;(['windows', 'macos', 'linux'] as OS[]).forEach((o) => { out[o] = { ...a[o], ...b[o], drawer: { ...a[o].drawer, ...b[o].drawer } } })
  return out
}

export const workshopCards: Card[] = base.map((c) => {
  const extra = workshopContent[c.id]
  if (!extra) return c
  return { ...c, ...extra, os: mergeOS(c.os, extra.os), drawer: { ...c.drawer, ...extra.drawer } }
})
