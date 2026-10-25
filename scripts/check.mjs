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
  ['log', 'Read the history', 2],
  ['github', 'Now we need GitHub.', 0],
  ['push', 'Send it to GitHub', 2],
  ['setup', 'Let\u2019s get Git on your laptop.', 3],
]
const STACK = ['open-source', 'linux', 'linus', 'vc-problem', 'vc-idea', 'git-born', 'recap']
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
    const body = [...document.querySelectorAll('.panel.split .t-body')].pop()
    const lines = body ? body.querySelectorAll('.t-entry').length : null
    const picker = !!document.querySelector('.overlay-box')
    const nextDisabled = document.querySelector('.nav-btns .btn:not(.ghost)')?.disabled
    return { id, h1s, graph, lines, picker, nextDisabled }
  })
}

async function settle(page, ms = 1900) {
  await sleep(ms)
  for (let i = 0; i < 30; i++) {
    const typing = await page.evaluate(() => {
      const b = [...document.querySelectorAll('.panel.split .t-body')].pop()
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

  let presses = 0, pushDonePresses = 0, setupPresses = 0
  for (let k = 1; k < seq.length; k++) {
    const [id, d] = seq[k]
    const cardChange = id !== seq[k - 1][0]
    await page.keyboard.press('Space'); presses++
    await settle(page, cardChange ? wait(id, seq[k - 1][0]) : 500)
    if (id === 'setup' && d === 0) {
      const s = await readState(page)
      if (!s.picker) fail('setup: OS picker did not open automatically')
      await closePicker(page)
    }
    expect(`forward press ${presses} -> ${id}/${d}`, await readState(page), id, d)
    if (id === 'push' && d === 2) pushDonePresses = presses
    if (id === 'setup') setupPresses++
  }
  // advance on the last card does nothing
  await page.keyboard.press('Space'); await settle(page, 600)
  const end = await readState(page)
  if (end.id !== 'setup') fail('Space on the last card moved to ' + end.id)
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
  console.log(`  extra Space presses for setup (1 to enter + 3 stages): ${setupPresses}`)
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
  if (!s.picker) fail('load #/setup: OS picker did not open')
  await closePicker(page)
  expect('load #/setup', await readState(page), 'setup', 0)
  await page.keyboard.press('ArrowLeft'); await settle(page)
  expect('setup -> back to push', await readState(page), 'push', 2)

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
  expect('github -> back to log', await readState(page), 'log', 2)
  await page.close()
}

const SIZES = [[1920, 1080], [1600, 900], [1366, 768], [1280, 720]]
async function layout(browser) {
  console.log('Layout at four sizes (text >= 1.5 x --u, no clipping, clear of rail and controls)')
  mkdirSync('scripts/shots', { recursive: true })
  for (const [w, h] of SIZES) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h })
    for (const id of ['github', 'push', 'setup']) {
      await page.goto(URL + '#/' + id, { waitUntil: 'networkidle0' })
      await page.reload({ waitUntil: 'networkidle0' })
      await settle(page, 900)
      await closePicker(page)
      const steps = id === 'github' ? 0 : id === 'push' ? 2 : 3
      for (let i = 0; i < steps; i++) { await page.keyboard.press('Space'); await settle(page, id === 'push' ? 2600 : 600) }
      await sleep(900)
      await page.screenshot({ path: `scripts/shots/${id}-${w}x${h}.png` })
      const problems = await page.evaluate(() => {
        const u = Math.min(innerWidth / 100, (innerHeight * 1.7778) / 100)
        const out = []
        const bottom = document.querySelector('.bottom').getBoundingClientRect()
        const hidden = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return true } return false }
        const walker = document.createTreeWalker(document.querySelector('.app'), NodeFilter.SHOW_TEXT)
        for (let n; (n = walker.nextNode());) {
          if (!n.textContent.trim()) continue
          const el = n.parentElement
          if (hidden(el) || el.closest('.drawer') || el.closest('[aria-hidden="true"]')) continue
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
        }
        document.querySelectorAll('.card-left, .panel').forEach((e) => {
          if (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) out.push(`overflow in .${e.className.split(' ')[0]}`)
        })
        const rail = document.querySelector('.rail').getBoundingClientRect()
        const card = document.querySelector('.card-left')?.getBoundingClientRect()
        if (card && card.bottom > rail.top + 1) out.push('card text area overlaps the rail')
        return out
      })
      console.log(`  ${id} ${w}x${h}: ${problems.length ? '' : 'ok'}`)
      problems.forEach((p) => fail(`${id} ${w}x${h}: ${p}`))
    }
    await page.close()
  }
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
    await page.goto(URL + '#/setup', { waitUntil: 'networkidle0' })
    await page.reload({ waitUntil: 'networkidle0' }); await settle(page, 900)
    await closePicker(page)
    await page.keyboard.press('d'); await sleep(1000)
    const cmds = await page.$$eval('.drawer .cmd-row code', (e) => e.map((x) => x.textContent))
    if (!cmds.some((c) => c === 'git config --global user.name "Ann Lee"')) fail('drawer did not show the filled name command: ' + cmds.join(' | '))
    if (!cmds.some((c) => c === 'git config --global user.email "ann@example.com"')) fail('drawer did not show the filled email command')
    await page.screenshot({ path: `scripts/shots/setup-drawer-${w}x${h}.png` })
    console.log(`  ${w}x${h}: done`)
  }
  await page.close()
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' })
let browser
try {
  for (let i = 0; i < 50; i++) { try { if ((await fetch(URL)).ok) break } catch { /* wait */ } await sleep(200) }
  browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  await fullPass(browser)
  await directLoads(browser)
  await layout(browser)
  await detailsModal(browser)
} finally {
  if (browser) await browser.close()
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
  else server.kill()
}
console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nAll checks passed')
process.exit(failures.length ? 1 : 0)
