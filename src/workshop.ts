import type { Card, OS, OSPart, Step } from './engine/types'
import { workshopContent } from './workshopContent'

/*
 * The hands-on workshop section: choose a system, then set up the laptop, then go back to the command cards.
 * Structure, routes and terminal steps live here. Wording from the volunteer handbook lives in workshopContent.ts.
 * None of these cards change the repository state, so every step uses op: none and the commit graph is hidden.
 */
const none = { type: 'none' } as const
const step = (cmd: string, output: string[] = []): Step => ({ cmd, output, op: none })
const everyOS = (steps: Step[]): Record<OS, Step[]> => ({ windows: steps, macos: steps, linux: steps })

const ANY_VERSION = '(any version number is fine)'

const STEPS: Record<string, Record<OS, Step[]>> = {
  vscode: everyOS([
    step('code --version', ['1.x.y ' + ANY_VERSION]),
    step('code .'),
  ]),
  'git-install': {
    windows: [step('git --version', ['git version 2.x.y ' + ANY_VERSION]), step('which git', ['/mingw64/bin/git'])],
    macos: [step('brew --version', ['Homebrew 4.x.y ' + ANY_VERSION]), step('git --version', ['git version 2.x.y ' + ANY_VERSION])],
    linux: [step('git --version', ['git version 2.x.y ' + ANY_VERSION]), step('which git', ['/usr/bin/git'])],
  },
  'gh-install': {
    windows: [step('winget install --id GitHub.cli', ['Found GitHub CLI [GitHub.cli]', 'Successfully installed']), step('gh --version', ['gh version 2.x.y ' + ANY_VERSION])],
    macos: [step('brew install gh', ['==> Installing gh', '==> Summary: gh is installed']), step('gh --version', ['gh version 2.x.y ' + ANY_VERSION])],
    linux: [step('sudo apt install gh', ['Reading package lists... Done', 'Setting up gh ...']), step('gh --version', ['gh version 2.x.y ' + ANY_VERSION])],
  },
  'gh-login': everyOS([
    step('gh auth login', [
      '? Where do you use GitHub? GitHub.com',
      '? Preferred protocol for Git? HTTPS',
      '? Authenticate Git with GitHub? Yes',
      '? How to log in? A web browser',
      '! Code: ABCD-1234 (example only)',
      '\u2713 Authentication complete.',
    ]),
    step('gh auth setup-git'),
    step('gh auth status', ['github.com', '  \u2713 Logged in to github.com']),
  ]),
  identity: everyOS([
    step('git config --global --list', ['user.name={{name}}', 'user.email={{email}}', 'init.defaultbranch=main', 'core.editor=code --wait']),
  ]),
}

const osSteps = (id: string): Pick<Card, 'steps' | 'os'> => {
  const s = STEPS[id]
  const lengths = new Set([s.windows.length, s.macos.length, s.linux.length])
  if (lengths.size !== 1) throw new Error(`Workshop card ${id} has a different number of steps per system`)
  return { steps: s.windows, os: { windows: { steps: s.windows }, macos: { steps: s.macos }, linux: { steps: s.linux } } }
}

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
    kicker: 'Workshop \u00b7 Step 1 of 6',
    title: 'Install Visual Studio Code (VS Code)',
    sentence: 'One window with your files and a terminal.',
    view: 'terminal',
    hideGraph: true,
    lane: 'main',
    ...osSteps('vscode'),
    drawer: { happening: 'Visual Studio Code (VS Code) is the editor used all day in this workshop.' },
  },
  {
    id: 'git-install',
    rail: 'Git',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 2 of 6',
    title: 'Install Git',
    sentence: 'Git is the program that keeps your history. First, check if you already have it.',
    view: 'terminal',
    hideGraph: true,
    lane: 'main',
    ...osSteps('git-install'),
    drawer: { happening: 'Git is the program that keeps your history.' },
  },
  {
    id: 'github-account',
    rail: 'GitHub account',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 3 of 6',
    title: 'Create a GitHub account',
    sentence: 'A free online home for your projects. It is the same on every operating system.',
    view: 'story',
    art: 'githubSignup',
    lane: 'main',
    steps: [],
    drawer: { happening: 'GitHub is the website that stores your projects online.' },
  },
  {
    id: 'gh-install',
    rail: 'GitHub command line',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 4 of 6 \u00b7 Part 1',
    title: 'Install GitHub CLI (command line interface)',
    sentence: 'It logs Git in to GitHub for you, so the first push just works. Do this before any git commands.',
    view: 'terminal',
    hideGraph: true,
    lane: 'main',
    ...osSteps('gh-install'),
    drawer: { happening: 'GitHub CLI (command line interface) logs Git in to GitHub.' },
  },
  {
    id: 'gh-login',
    rail: 'Log in',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 4 of 6 \u00b7 Part 2',
    title: 'Log in to GitHub',
    sentence: 'Sign in once through your browser.',
    view: 'terminal',
    hideGraph: true,
    lane: 'main',
    ...osSteps('gh-login'),
    drawer: { happening: 'You sign in once, in the browser, and Git remembers it.' },
  },
  {
    id: 'identity',
    rail: 'Your identity',
    section: 'workshop',
    kicker: 'Workshop \u00b7 Step 5 of 6',
    title: 'Tell Git who you are',
    sentence: 'A label stamped on every commit. It is not a login.',
    view: 'terminal',
    hideGraph: true,
    lane: 'main',
    ...osSteps('identity'),
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
