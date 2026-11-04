// End-to-end check against the production build, using headless Chrome.
// Usage: npm run build && npm run check
// Passes: Space-only forward pass, arrow-left-only back pass, direct hash loads,
// the github/push boundary, and layout checks at four screen sizes (screenshots go to scripts/shots).
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const PORT = 4179
const URL = `http://localhost:${PORT}/`
const CHROME = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && existsSync(p))
if (!CHROME) { console.error('Chrome not found. Set CHROME_PATH.'); process.exit(2) }

/* Expected card list: id, heading, number of steps (presses inside the card). */
const CARDS = [
  ['messy', "You've all been here.", 0],
  ['git-answer', "There's a tool for this.", 0],
  ['open-source', 'Open source', 0],
  ['mukti', 'Mukti', 0],
  ['personal-software', 'Software for an audience of one', 0],
  ['linux', 'Linux', 0],
  ['linus', 'Linus Torvalds', 0],
  ['vc-problem', 'The messy folder, times a thousand', 0],
  ['vc-idea', 'A timeline of snapshots', 0],
  ['git-born', 'So Linus wrote Git', 0],
  ['recap', "You've all been here.", 0],
  ['git-vs-github', 'Git is not GitHub', 0],
  ['three-areas', 'Where your work lives', 3],
  ['init', 'Start a repository', 2],
  ['status', 'Ask what changed', 2],
  ['add', 'Choose what to save', 2],
  ['commit', 'Save a snapshot', 3],
  ['log', 'Read the history', 1],
  ['linux-repo', 'This is what real history looks like.', 0],
  ['github', 'Now we need GitHub.', 0],
  ['push', 'Send it to GitHub', 2],
  ['os', 'Which laptop do you have?', 0],
  ['vscode', 'Install Visual Studio Code (VS Code)', 2],
  ['git-install', 'Install Git', 2],
  ['github-account', 'Create a GitHub account', 0],
  ['gh-install', 'Install GitHub CLI (command line interface)', 2],
  ['gh-login', 'Log in to GitHub', 3],
  ['identity', 'Tell Git who you are', 1],
  ['codespaces', 'Laptop won\u2019t cooperate? Use GitHub Codespaces.', 0],
  ['ready', 'You\u2019re set. Now let\u2019s make commits.', 0],
  ['why-branch', 'Why do we need branches?', 4],
  ['branch-idea', 'Separate your work. Keep main stable.', 4],
  ['branch-create', 'Create a branch. Switch to it. Start working.', 7],
  ['branch-commit', 'Make changes on your branch.', 4],
  ['branch-merge', 'Feature complete? Bring it back into main.', 5],
  ['oss-intro', 'Great software is built by people working together.', 3],
  ['oss-issues', 'Find something to fix', 0],
  ['oss-pull-requests', 'You can\u2019t push directly. So you propose instead.', 2],
  ['oss-first-contrib', 'Let\u2019s contribute to MUKTI!', 0],
  ['oss-fork', 'Make your own copy', 0],
  ['oss-clone', 'Bring it onto your computer', 3],
  ['oss-commit-push', 'Make the change. Save it. Send it up.', 3],
  ['oss-create-pr', 'Propose your change to the original repository', 0],
  ['oss-workflow', 'The whole process, in eight steps', 0],
  ['oss-challenge', 'MUKTI Challenge: make it yours', 0],
]
const LAST = 'oss-challenge'
/* Terminal entries expected after each press on the branching terminal cards (press 3 on branch-create is a reset). */
const TLINES = {
  'branch-create': [0, 1, 2, 3, 4, 5, 0, 1],
  'branch-commit': [0, 1, 2, 3, 4],
  'branch-merge': [0, 1, 2, 3, 4, 5],
  vscode: [0, 1, 2], 'git-install': [0, 1, 2], 'gh-install': [0, 1, 2], 'gh-login': [0, 1, 2, 3], identity: [0, 1],
}
/* The new workshop section: ids in order, and the cards that show a terminal without a commit graph. */
const WORKSHOP = ['os', 'vscode', 'git-install', 'github-account', 'gh-install', 'gh-login', 'identity', 'codespaces', 'ready']
const TERMINAL_ONLY = ['vscode', 'git-install', 'gh-install', 'gh-login', 'identity']
const OSES = ['windows', 'macos', 'linux']
const STACK = ['open-source', 'mukti', 'personal-software', 'linux', 'linus', 'vc-problem', 'vc-idea', 'git-born', 'recap']
const wait = (a, b) => (STACK.includes(a) || STACK.includes(b) ? 5500 : 1900)
const idx = (id) => CARDS.findIndex((c) => c[0] === id)

/* Expected graph on terminal cards: commits shown, GitHub cloud, origin/main pill. */
const C1 = '1a2b3c4', C2 = '5d6e7f8'
function graphAt(id, done) {
  const none = { hashes: [], cloud: false, origin: false }
  switch (id) {
    case 'init': case 'status': case 'add': return none
    case 'commit': return { ...none, hashes: done === 0 ? [] : done < 3 ? [C1] : [C1, C2] }
    case 'log': return { ...none, hashes: [C1, C2] }
    case 'push': return { hashes: [C1, C2], cloud: done >= 1, origin: done >= 2 }
    default: return null // no graph on this card
  }
}

const failures = []
const fail = (m) => { failures.push(m); console.log('  FAIL ' + m) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function readState(page) {
  return page.evaluate(() => {
    const id = location.hash.replace(/^#\/?/, '')
    const h1s = [...document.querySelectorAll('.stage h1')].map((e) => e.textContent.trim())
    const g = [...document.querySelectorAll('.panel.split .graph')].pop()
    const graph = g && {
      hashes: [...g.querySelectorAll('text.g-hash')].map((t) => t.textContent.trim()).filter((t) => t !== 'GitHub'),
      cloud: [...g.querySelectorAll('text.g-hash')].some((t) => t.textContent.trim() === 'GitHub'),
      origin: [...g.querySelectorAll('text.g-pill')].some((t) => t.textContent.trim() === 'origin/main'),
    }
    const body = [...document.querySelectorAll('.panel.split .t-body, .panel.terminal-only .t-body')].pop()
    const splitGraphs = document.querySelectorAll('.panel.split .graph').length
    const lines = body ? body.querySelectorAll('.t-entry').length : null
    const picker = !!document.querySelector('.overlay-box')
    const nextDisabled = document.querySelector('.nav-btns .btn:not(.ghost)')?.disabled
    const front = [...document.querySelectorAll('.stage .card')].pop() || document
    const graphShown = !!front.querySelector('.panel.split .graph')
    return { id, h1s, graph, lines, picker, nextDisabled, splitGraphs, graphShown, rawTokens: document.body.innerText.includes('{{') }
  })
}

async function settle(page, ms = 1900) {
  await sleep(ms)
  for (let i = 0; i < 30; i++) {
    const typing = await page.evaluate(() => {
      const b = [...document.querySelectorAll('.panel.split .t-body, .panel.terminal-only .t-body')].pop()
      return !!b && !b.querySelector(':scope > div > .t-line')
    })
    if (!typing) return
    await sleep(200)
  }
}

function expect(label, s, id, done) {
  const i = idx(id)
  if (s.id !== id) return fail(`${label}: expected card ${id}, hash is ${s.id}`)
  if (!s.h1s.includes(CARDS[i][1])) fail(`${label}: heading "${CARDS[i][1]}" not on screen (${s.h1s.join(' | ')})`)
  if (TLINES[id]) {
    if (s.lines !== TLINES[id][done]) fail(`${label}: terminal shows ${s.lines} entries, expected ${TLINES[id][done]}`)
  }
  if (WORKSHOP.includes(id) && s.graphShown) fail(`${label}: workshop card ${id} shows a commit graph`)
  if (WORKSHOP.includes(id) && s.rawTokens) fail(`${label}: raw {{token}} text on screen in ${id}`)
  const g = graphAt(id, done)
  if (g) {
    if (!s.graph) return fail(`${label}: no graph on ${id}`)
    if (JSON.stringify(s.graph) !== JSON.stringify(g)) fail(`${label}: graph ${JSON.stringify(s.graph)} expected ${JSON.stringify(g)}`)
    if (s.lines !== done) fail(`${label}: terminal shows ${s.lines} entries, expected ${done}`)
  }
}

async function closePicker(page) {
  if ((await readState(page)).picker) { await page.keyboard.press('o'); await sleep(500) }
}

await import('./details.test.mjs')

async function fullPass(browser) {
  console.log('Full pass: Space-only forward, ArrowLeft-only back')
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto(URL + '#/messy', { waitUntil: 'networkidle0' })
  await settle(page, 600)
  const seq = []
  CARDS.forEach(([id, , n]) => { for (let d = 0; d <= n; d++) seq.push([id, d]) })
  expect('start', await readState(page), 'messy', 0)

  let presses = 0, pushDonePresses = 0, workshopPresses = 0
  for (let k = 1; k < seq.length; k++) {
    const [id, d] = seq[k]
    const cardChange = id !== seq[k - 1][0]
    await page.keyboard.press('Space'); presses++
    await settle(page, cardChange ? wait(id, seq[k - 1][0]) : 500)
    const st = await readState(page)
    if (id === 'os' && st.picker) fail('os: the OS popup opened by itself (it must only open with O)')
    expect(`forward press ${presses} -> ${id}/${d}`, st, id, d)
    if (id === 'push' && d === 2) pushDonePresses = presses
    if (WORKSHOP.includes(id)) workshopPresses++
  }
  // advance on the last card does nothing
  await page.keyboard.press('Space'); await settle(page, 600)
  const end = await readState(page)
  if (end.id !== LAST) fail('Space on the last card moved to ' + end.id)
  if (!end.nextDisabled) fail('Next button is not disabled on the last card')

  let lefts = 0
  for (let k = seq.length - 2; k >= 0; k--) {
    const [id, d] = seq[k]
    const cardChange = id !== seq[k + 1][0]
    await page.keyboard.press('ArrowLeft'); lefts++
    await settle(page, cardChange ? wait(id, seq[k + 1][0]) : 500)
    expect(`back press ${lefts} -> ${id}/${d}`, await readState(page), id, d)
  }
  await page.keyboard.press('ArrowLeft'); await settle(page, 400)
  if ((await readState(page)).id !== 'messy') fail('Left on the first card moved away')
  console.log(`  forward presses to end: ${presses}, back presses: ${lefts}`)
  console.log(`  Space presses from #/messy to the end of the push card (theory part): ${pushDonePresses}`)
  console.log(`  Space presses for the new workshop section (${WORKSHOP.length} cards, entering each plus the steps inside them): ${workshopPresses}`)
  console.log(`  new total from #/messy to the very last card: ${presses}`)
  if (lefts !== presses) fail(`back presses ${lefts} differ from forward presses ${presses}`)
  await page.close()
}

async function directLoads(browser) {
  console.log('Direct loads and the github/push boundary')
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  const open = async (id) => { await page.goto(URL + '#/' + id, { waitUntil: 'networkidle0' }); await page.reload({ waitUntil: 'networkidle0' }); await settle(page, 900) }

  await open('github'); expect('load #/github', await readState(page), 'github', 0)
  await open('push'); expect('load #/push', await readState(page), 'push', 0)
  await open('setup')
  let s = await readState(page)
  if (s.picker) fail('load #/setup: the OS popup opened by itself')
  expect('load #/setup (redirect to #/os)', s, 'os', 0)
  await page.keyboard.press('o'); await sleep(600)
  if (!(await readState(page)).picker) fail('O did not open the OS popup on the os card')
  await page.keyboard.press('Escape'); await sleep(600)
  if ((await readState(page)).picker) fail('Esc did not close the OS popup')
  await page.keyboard.press('ArrowLeft'); await settle(page)
  expect('os -> back to push (graph and terminal intact)', await readState(page), 'push', 2)
  await page.evaluate(() => { location.hash = '#/setup' }); await settle(page, 1900)
  expect('hash change to #/setup lands on #/os', await readState(page), 'os', 0)

  await open('init'); expect('load #/init', await readState(page), 'init', 0)
  await open('ready'); expect('load #/ready', await readState(page), 'ready', 0)
  await page.click('a.cta-btn'); await settle(page, 1900)
  expect('Back to git init button', await readState(page), 'init', 0)
  await page.keyboard.press('Space'); await settle(page, 2400)
  expect('init works after the jump', await readState(page), 'init', 1)
  await open('ready')
  await page.keyboard.press('ArrowLeft'); await settle(page)
  expect('ready -> back to plan B', await readState(page), 'codespaces', 0)

  await open('github')
  await page.keyboard.press('Space'); await settle(page)
  expect('github -> push', await readState(page), 'push', 0)
  await page.keyboard.press('Space'); await settle(page, 700)
  await page.keyboard.press('Space'); await settle(page, 2400)
  expect('push steps done', await readState(page), 'push', 2)
  await page.keyboard.press('ArrowLeft'); await settle(page, 400)
  await page.keyboard.press('ArrowLeft'); await settle(page, 400)
  await page.keyboard.press('ArrowLeft'); await settle(page)
  expect('push -> back to github', await readState(page), 'github', 0)
  await page.keyboard.press('ArrowLeft'); await settle(page)
  expect('github -> back to linux-repo', await readState(page), 'linux-repo', 0)
  await page.close()
}

const SIZES = [[1920, 1080], [1600, 900], [1366, 768], [1280, 720]]

/* Runs inside the page. Returns a list of layout problems for the card on screen (not the drawer). */
const MEASURE = (strict) => {
  const u = Math.min(innerWidth / 100, (innerHeight * 1.7778) / 100)
  const out = []
  const bottom = document.querySelector('.bottom').getBoundingClientRect()
  const hidden = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return true } return false }
  const walker = document.createTreeWalker(document.querySelector('.app'), NodeFilter.SHOW_TEXT)
  for (let n; (n = walker.nextNode());) {
    if (!n.textContent.trim()) continue
    const el = n.parentElement
    if (hidden(el) || el.closest('.drawer') || el.closest('[aria-hidden="true"]')) continue
    const layer = el.closest('.slayer')
    if (layer && layer !== layer.parentElement.lastElementChild) continue // cards behind the front one in a stack
    const r = document.createRange(); r.selectNodeContents(n)
    const b = r.getBoundingClientRect()
    if (!b.width) continue
    let fs = parseFloat(getComputedStyle(el).fontSize)
    if (el.ownerSVGElement) fs *= el.getScreenCTM().a
    const t = n.textContent.trim().slice(0, 30)
    if (fs < 1.5 * u - 0.6) out.push(`small text ${fs.toFixed(1)}px < ${(1.5 * u).toFixed(1)}px: "${t}"`)
    if (b.left < -1 || b.right > innerWidth + 1 || b.top < -1) out.push(`off screen: "${t}"`)
    const inRail = el.closest('.rail')
    if (!inRail && !el.closest('.bottom') && b.bottom > bottom.top + 1) out.push(`touches controls/rail: "${t}"`)
    const box = el.closest('.panel, .card-left, .overlay-box')
    if (box) {
      const p = box.getBoundingClientRect()
      if (b.left < p.left - 1 || b.right > p.right + 1 || b.top < p.top - 1 || b.bottom > p.bottom + 1) out.push(`clipped by its box: "${t}"`)
    }
    const tb = el.closest('.t-body')
    if (tb && strict) {
      const p = tb.getBoundingClientRect()
      if (b.top < p.top - 1 || b.bottom > p.bottom + 1) out.push(`terminal line scrolled out of view: "${t}"`)
    }
  }
  const front = document.querySelector('.slayer:last-child') || document
  front.querySelectorAll('.card-left, .panel, .fs-head, .fs-fig').forEach((e) => {
    if (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) out.push(`overflow in .${e.className.split(' ')[0]}`)
  })
  const rail = document.querySelector('.rail').getBoundingClientRect()
  const card = front.querySelector('.card-left, .fs-fig')?.getBoundingClientRect()
  if (card && card.bottom > rail.top + 1) out.push('card text area overlaps the rail')
  if (strict) front.querySelectorAll('.card-left > *').forEach((e) => {
    const r = e.getBoundingClientRect()
    if (r.bottom > rail.top - 4) out.push(`box too close to the rail: .${String(e.className).split(' ')[0] || e.tagName}`)
    if (r.top < 0) out.push(`box above the screen: .${String(e.className).split(' ')[0] || e.tagName}`)
  })
  return out
}

async function layout(browser) {
  console.log('Layout at four sizes (text >= 1.5 x --u, no clipping, clear of rail and controls)')
  mkdirSync('scripts/shots', { recursive: true })
  for (const [w, h] of SIZES) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h })
    for (const id of ['open-source', 'mukti', 'personal-software', 'linux', 'linus', 'vc-idea', 'git-born', 'git-vs-github', 'linux-repo', 'github', 'push', 'why-branch', 'branch-idea', 'branch-create', 'branch-commit', 'branch-merge', 'oss-intro', 'oss-issues', 'oss-pull-requests', 'oss-first-contrib', 'oss-fork', 'oss-clone', 'oss-commit-push', 'oss-create-pr', 'oss-workflow', 'oss-challenge']) {
      await page.goto(URL + '#/' + id, { waitUntil: 'networkidle0' })
      await page.reload({ waitUntil: 'networkidle0' })
      await settle(page, 900)
      await closePicker(page)
      const steps = id === 'push' ? 2 : (CARDS[idx(id)][2] ?? 0)
      for (let i = 0; i < steps; i++) { await page.keyboard.press('Space'); await settle(page, id === 'push' ? 2600 : 600) }
      await sleep(900)
      await page.screenshot({ path: `scripts/shots/${id}-${w}x${h}.png` })
      const problems = await page.evaluate(MEASURE)
      console.log(`  ${id} ${w}x${h}: ${problems.length ? '' : 'ok'}`)
      problems.forEach((p) => fail(`${id} ${w}x${h}: ${p}`))
    }
    await page.close()
  }
}

/* The nine workshop cards, for each operating system, at 1920x1080 and 1280x720: card fit and drawer fit. */
const DRAWER_MEASURE = () => {
  const u = Math.min(innerWidth / 100, (innerHeight * 1.7778) / 100)
  const d = document.querySelector('.drawer')
  const out = []
  const r = d.getBoundingClientRect()
  if (r.top < -1 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) out.push('drawer is outside the screen')
  const cs = getComputedStyle(d)
  if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') out.push('drawer does not scroll')
  if (d.scrollWidth > d.clientWidth + 1) out.push('drawer scrolls sideways')
  const scrolls = d.scrollHeight > d.clientHeight + 1
  if (scrolls) {
    d.scrollTop = d.scrollHeight
    if (d.scrollTop <= 0) out.push('drawer content is cut off and cannot scroll')
    const lastSection = [...d.querySelectorAll('section')].pop().getBoundingClientRect()
    if (lastSection.bottom > innerHeight + 1) out.push('end of the drawer is not reachable')
    d.scrollTop = 0
  }
  const heads = [...d.querySelectorAll('h3')].map((h) => h.textContent)
  if (!heads.some((h) => /^Step by step|^Copy-paste commands/.test(h))) out.push('drawer part 1 (commands or click path) is missing')
  if (!heads.includes('Common mistakes')) out.push('drawer part 2 (common mistakes) is missing')
  if (!heads.includes('In plain English')) out.push('drawer part 3 (plain English) is missing')
  const walker = document.createTreeWalker(d, NodeFilter.SHOW_TEXT)
  for (let n; (n = walker.nextNode());) {
    if (!n.textContent.trim()) continue
    const el = n.parentElement
    const fs = parseFloat(getComputedStyle(el).fontSize)
    if (fs < 1.5 * u - 0.6) out.push(`small drawer text ${fs.toFixed(1)}px: "${n.textContent.trim().slice(0, 25)}"`)
    const rr = document.createRange(); rr.selectNodeContents(n)
    const b = rr.getBoundingClientRect()
    if (b.right > r.right + 1 || b.left < r.left - 1) out.push(`drawer text clipped sideways: "${n.textContent.trim().slice(0, 25)}"`)
  }
  return out
}

async function workshopFit(browser) {
  console.log('Workshop section: nine cards x three systems x two sizes (card fit, drawer fit, OS-specific text)')
  mkdirSync('scripts/shots/workshop', { recursive: true })
  const seen = {}
  for (const [w, h] of [[1920, 1080], [1280, 720]]) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h })
    for (const os of OSES) {
      for (const id of WORKSHOP) {
        const variants = id === 'identity' ? ['filled', 'empty'] : ['filled']
        for (const variant of variants) {
          await page.goto(URL + '#/' + id, { waitUntil: 'networkidle0' })
          await page.evaluate((o, v) => {
            localStorage.setItem('gid.os', o)
            if (v === 'filled') localStorage.setItem('gid.details', JSON.stringify({ name: 'Ann-Marie Longname Smith', email: 'ann.marie.longname@example.com', ghuser: 'ann-marie', repo: 'my-first-repo' }))
            else localStorage.removeItem('gid.details')
          }, os, variant)
          await page.reload({ waitUntil: 'networkidle0' })
          await settle(page, 900)
          for (let i = 0; i < CARDS[idx(id)][2]; i++) { await page.keyboard.press('Space'); await settle(page, 700) }
          await sleep(500)
          const tag = `${id}/${os}${variant === 'empty' ? '/empty' : ''} ${w}x${h}`
          const st = await readState(page)
          if (st.picker) fail(`${tag}: popup is open`)
          if (st.graphShown) fail(`${tag}: commit graph is visible`)
          if (st.rawTokens) fail(`${tag}: raw {{token}} on screen`)
          const problems = await page.evaluate(MEASURE, true)
          problems.forEach((p) => fail(`${tag}: ${p}`))
          const info = await page.evaluate(() => ({
            left: document.querySelector('.stage .card-left')?.innerText ?? '',
            prompt: document.querySelector('.t-prompt')?.textContent ?? '',
            tiles: document.querySelectorAll('.os-tile').length,
            tileOn: document.querySelector('.os-tile.on .os-tile-name')?.textContent ?? '',
          }))
          if (variant === 'filled') (seen[id] ??= {})[os + w] = info
          if (id === 'os') {
            if (info.tiles !== 3) fail(`${tag}: expected 3 OS tiles, found ${info.tiles}`)
            if (info.tileOn !== { windows: 'Windows', macos: 'macOS', linux: 'Linux' }[os]) fail(`${tag}: highlighted tile is "${info.tileOn}"`)
          }
          if (TERMINAL_ONLY.includes(id)) {
            const want = { windows: 'MINGW64', macos: '%', linux: 'user@laptop' }[os]
            if (!info.prompt.includes(want)) fail(`${tag}: prompt "${info.prompt}" does not match ${os}`)
          }
          if (id === 'identity' && variant === 'filled' && !info.left.includes('Ann-Marie Longname Smith')) fail(`${tag}: identity chips are not filled in`)
          if (id === 'identity' && variant === 'empty' && !info.left.includes('<your name>')) fail(`${tag}: identity chips lack the <your name> label when details are empty`)
          if (variant === 'filled' || id === 'identity') {
            await page.keyboard.press('d'); await sleep(1000)
            const dp = await page.evaluate(DRAWER_MEASURE)
            dp.forEach((p) => fail(`${tag} drawer: ${p}`))
            if (variant === 'filled' && (w === 1920)) await page.screenshot({ path: `scripts/shots/workshop/${id}-${os}-drawer-${w}x${h}.png` })
            await page.keyboard.press('d'); await sleep(600)
          }
          if (variant === 'filled') await page.screenshot({ path: `scripts/shots/workshop/${id}-${os}-${w}x${h}.png` })
        }
      }
      console.log(`  ${os} ${w}x${h}: checked`)
    }
    await page.close()
  }
  for (const id of ['vscode', 'git-install', 'gh-install']) {
    const set = new Set(OSES.map((o) => seen[id][o + 1920].left))
    if (set.size !== 3) fail(`${id}: the card text is not different for each operating system`)
  }
  if (new Set(OSES.map((o) => seen['gh-login'][o + 1920].left)).size !== 1) fail('gh-login: card text should be the same on every system')
}

async function osPersistence(browser) {
  console.log('OS tiles: click a tile, the choice shows on other cards and survives a reload')
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto(URL + '#/os', { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle0' }); await settle(page, 700)
  const pick = async (label) => {
    await page.evaluate((l) => { [...document.querySelectorAll('.os-tile')].find((b) => b.querySelector('.os-tile-name').textContent === l).click() }, label)
    await sleep(300)
  }
  const bullets = () => page.evaluate(() => document.querySelector('.stage .card-left').innerText)
  for (const [label, needle, os] of [['macOS', 'Universal', 'macos'], ['Linux', '.deb', 'linux'], ['Windows', 'User Installer', 'windows']]) {
    await pick(label)
    await page.goto(URL + '#/vscode', { waitUntil: 'networkidle0' })
    await page.reload({ waitUntil: 'networkidle0' }); await settle(page, 700)
    if (!(await bullets()).includes(needle)) fail(`after picking ${label} and reloading, #/vscode does not mention "${needle}"`)
    if ((await page.evaluate(() => localStorage.getItem('gid.os'))) !== os) fail(`${label} was not saved`)
    await page.goto(URL + '#/os', { waitUntil: 'networkidle0' })
    await page.reload({ waitUntil: 'networkidle0' }); await settle(page, 700)
  }
  await page.close()
}

async function detailsModal(browser) {
  console.log('Your details: typing does not move the cards; screenshots and text size')
  const page = await browser.newPage()
  for (const [w, h] of [[1920, 1080], [1280, 720]]) {
    await page.setViewport({ width: w, height: h })
    await page.goto(URL + '#/push', { waitUntil: 'networkidle0' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle0' })
    await settle(page, 900)
    await page.keyboard.press('u'); await sleep(600)
    if (!(await page.$('.details-box'))) { fail('U did not open Your details'); continue }
    const before = await readState(page)
    await page.keyboard.type('Ann Lee  x y')
    for (const k of ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowRight']) await page.keyboard.press(k)
    await page.keyboard.press('Tab'); await page.keyboard.type('ann@example.com')
    await page.keyboard.press('Tab'); await page.keyboard.type('ann-lee')
    await sleep(300)
    const after = await readState(page)
    if (after.id !== before.id || after.lines !== before.lines) fail(`typing in the modal moved the cards (${before.id}/${before.lines} -> ${after.id}/${after.lines})`)
    const v = await page.$eval('.details-input', (e) => e.value)
    if (v !== 'Ann Lee  x y ') fail(`typed text lost or changed: "${v}"`)
    await page.screenshot({ path: `scripts/shots/details-modal-${w}x${h}.png` })
    const bad = await page.evaluate(() => {
      const u = Math.min(innerWidth / 100, (innerHeight * 1.7778) / 100)
      const box = document.querySelector('.details-box').getBoundingClientRect()
      const out = []
      document.querySelectorAll('.details-box *').forEach((el) => {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
        if (own && parseFloat(getComputedStyle(el).fontSize) < 1.5 * u - 0.6) out.push('small text: ' + el.textContent.slice(0, 20))
      })
      document.querySelectorAll('.details-box input, .details-box button').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (parseFloat(getComputedStyle(el).fontSize) < 1.5 * u - 0.6) out.push('small control')
        if (r.left < box.left || r.right > box.right || r.bottom > box.bottom) out.push('clipped control')
      })
      if (box.top < 0 || box.bottom > innerHeight) out.push('modal taller than screen')
      return out
    })
    bad.forEach((m) => fail(`modal ${w}x${h}: ${m}`))
    await page.keyboard.press('Escape'); await sleep(900)
    if (await page.$('.details-box')) fail('Esc did not close Your details')
    // save through the form, then screenshot the setup card drawer with filled values
    await page.keyboard.press('u'); await sleep(500)
    await page.keyboard.type('Ann Lee'); await page.keyboard.press('Tab')
    await page.keyboard.type('ann@example.com'); await page.keyboard.press('Tab')
    await page.keyboard.type('ann-lee'); await page.keyboard.press('Enter'); await sleep(600)
    if (await page.$('.details-box')) fail('Save did not close Your details')
    await page.goto(URL + '#/identity', { waitUntil: 'networkidle0' })
    await page.reload({ waitUntil: 'networkidle0' }); await settle(page, 900)
    await page.keyboard.press('d'); await sleep(1000)
    const cmds = await page.$$eval('.drawer .cmd-row code', (e) => e.map((x) => x.textContent))
    if (!cmds.some((c) => c === 'git config --global user.name "Ann Lee"')) fail('drawer did not show the filled name command: ' + cmds.join(' | '))
    if (!cmds.some((c) => c === 'git config --global user.email "ann@example.com"')) fail('drawer did not show the filled email command')
    await page.screenshot({ path: `scripts/shots/identity-drawer-${w}x${h}.png` })
    console.log(`  ${w}x${h}: done`)
  }
  await page.close()
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' })
let browser
try {
  for (let i = 0; i < 50; i++) { try { if ((await fetch(URL)).ok) break } catch { /* wait */ } await sleep(200) }
  browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const only = process.env.ONLY // e.g. ONLY=fit runs just the workshop checks
  if (!only) { await fullPass(browser); await directLoads(browser); await layout(browser) }
  if (!only || only === 'fit') { await workshopFit(browser); await osPersistence(browser) }
  await detailsModal(browser)
} finally {
  if (browser) await browser.close()
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
  else server.kill()
}
console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nAll checks passed')
process.exit(failures.length ? 1 : 0)
