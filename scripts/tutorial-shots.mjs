// Generates the screenshots used by the hands-on tutorial page (#/workshop).
// Usage: node scripts/tutorial-shots.mjs
//
// What these images are:
//  - Illustrations of the GitHub, VS Code and Windows interfaces, drawn in HTML from the real layout and rendered with
//    headless Chrome. They are NOT captures of a logged-in account, so no personal data can leak into them.
//  - Every piece of terminal text comes from running the real git commands in a throw-away repository
//    (only the folder path and the GitHub address are replaced with the generic ones used in the tutorial).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'

const OUT = 'public/img/workshop'
mkdirSync(OUT, { recursive: true })
const CHROME = [process.env.CHROME_PATH, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => p && existsSync(p))
if (!CHROME) { console.error('Chrome not found. Set CHROME_PATH.'); process.exit(2) }

/* ---------------- real git output ---------------- */
const root = mkdtempSync(join(tmpdir(), 'gid-tut-'))
const repo = join(root, 'my-first-git-project')
mkdirSync(repo)
const GEN_PATH = 'C:/Users/student/Desktop/my-first-git-project'
const URL_REMOTE = 'https://github.com/USERNAME/my-first-git-project.git'
const git = (...args) => execFileSync('git', ['-c', 'init.defaultBranch=main', '-c', 'user.name=Your Name', '-c', 'user.email=your-email@example.com', '-c', 'core.autocrlf=false', ...args], { cwd: repo, encoding: 'utf8' }).replace(/\r/g, '')
const clean = (s) => s.split(repo.replace(/\\/g, '/')).join(GEN_PATH).split(repo).join(GEN_PATH).replace(/\n+$/, '')
const out = {}
out.init = clean(git('init'))
out.status0 = clean(git('status'))
writeFileSync(join(repo, 'hello.txt'), 'Hello, Git! This is my first project.\n')
out.status1 = clean(git('status'))
git('add', 'hello.txt')
out.status2 = clean(git('status'))
out.commit1 = clean(git('commit', '-m', 'Add first text file'))
out.log1 = clean(git('log', '--oneline', '--decorate'))
appendFileSync(join(repo, 'hello.txt'), 'I am learning version control with Git.\n')
out.status3 = clean(git('status'))
git('add', 'hello.txt')
out.status4 = clean(git('status'))
out.commit2 = clean(git('commit', '-m', 'Update hello message'))
out.log2 = clean(git('log', '--oneline', '--decorate'))
const hashes = out.log2.split('\n').map((l) => l.split(' ')[0])      // [second, first]
const objects = Number(/count: (\d+)/.exec(git('count-objects', '-v'))[1])
rmSync(root, { recursive: true, force: true })
out.remoteV = `origin\t${URL_REMOTE} (fetch)\norigin\t${URL_REMOTE} (push)`
out.push = [
  `Enumerating objects: ${objects}, done.`,
  `Counting objects: 100% (${objects}/${objects}), done.`,
  'Delta compression using up to 8 threads',
  'Compressing objects: 100% (2/2), done.',
  `Writing objects: 100% (${objects}/${objects}), 520 bytes | 520.00 KiB/s, done.`,
  `Total ${objects} (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)`,
  `To ${URL_REMOTE}`,
  ' * [new branch]      main -> main',
  "branch 'main' set up to track 'origin/main'.",
].join('\n')

/* ---------------- shared drawing helpers ---------------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const PS = 'PS C:\\Users\\student\\Desktop\\my-first-git-project&gt;'

/** Colours git output the way a terminal does. */
function colourOutput(text) {
  let section = ''
  return text.split('\n').map((raw) => {
    const l = esc(raw)
    if (/^Changes to be committed/.test(raw)) section = 'staged'
    else if (/^(Changes not staged|Untracked files)/.test(raw)) section = 'unstaged'
    else if (/^\S/.test(raw) && !/^\(/.test(raw)) { if (!/^\t/.test(raw) && !/^\s/.test(raw)) section = section }
    if (/^\t/.test(raw)) return `<span class="${section === 'staged' ? 'g' : 'r'}">${l}</span>`
    const log = /^([0-9a-f]{7}) (\(HEAD -> main\) )?(.*)$/.exec(raw)
    if (log && !raw.includes(' ' + 'files changed')) {
      const dec = log[2] ? `<span class="y">(</span><span class="c">HEAD -&gt; </span><span class="g">main</span><span class="y">)</span> ` : ''
      return `<span class="y">${log[1]}</span> ${dec}${esc(log[3])}`
    }
    return l
  }).join('\n')
}
/** entries: [{ cmd }, { out }, { raw }] */
function term(entries, { cursor = true } = {}) {
  return entries.map((e) => {
    if (e.cmd !== undefined) return `<div class="tl"${e.a ? A(...e.a) : ''}><span class="ps">${PS}</span> <span class="cmd">${esc(e.cmd)}</span></div>`
    if (e.out !== undefined) return `<pre class="to"${e.a ? A(...e.a) : ''}>${colourOutput(e.out)}</pre>`
    return `<pre class="to">${e.raw}</pre>`
  }).join('') + (cursor ? `<div class="tl"><span class="ps">${PS}</span> <span class="cur"></span></div>` : '')
}

const BASE_CSS = `
*{box-sizing:border-box} html,body{margin:0;width:1280px;height:720px;overflow:hidden;font-family:'Segoe UI',system-ui,-apple-system,'Noto Sans',sans-serif}
.ann{position:absolute;display:flex;align-items:center;gap:8px;z-index:50;font:700 15px 'Segoe UI',sans-serif;color:#fff;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))}
.ann i{font-style:normal;display:grid;place-items:center;min-width:28px;height:28px;border-radius:50%;background:#e8553d;border:2px solid #fff;font-size:15px}
.ann span{background:#e8553d;border-radius:8px;padding:5px 10px;white-space:nowrap}
.ring{position:absolute;border:3px solid #e8553d;border-radius:8px;z-index:49;box-shadow:0 0 0 3px rgba(232,85,61,.25)}
.cap{position:absolute;left:0;right:0;bottom:0;height:0}
`
/** Marks an element: a red ring is drawn around it and a numbered label is placed beside it (right | left | above | below). */
const A = (n, text, pos = 'right') => ` data-ann="${n}|${text}|${pos}"`
const ANN_SCRIPT = `<script>
document.querySelectorAll('[data-ann]').forEach((el) => {
  const [n, text, pos] = el.dataset.ann.split('|'); const r = el.getBoundingClientRect(), p = 5
  const ring = document.createElement('div'); ring.className = 'ring'
  Object.assign(ring.style, { left: r.left - p + 'px', top: r.top - p + 'px', width: r.width + 2 * p + 'px', height: r.height + 2 * p + 'px' }); document.body.appendChild(ring)
  const a = document.createElement('div'); a.className = 'ann'; a.innerHTML = '<i>' + n + '</i>' + (text ? '<span>' + text + '</span>' : ''); document.body.appendChild(a)
  const w = a.offsetWidth, h = a.offsetHeight; let x, y
  if (pos === 'left') { x = r.left - p - 10 - w; y = r.top + r.height / 2 - h / 2 }
  else if (pos === 'below') { x = r.left; y = r.bottom + p + 8 }
  else if (pos === 'above') { x = r.left; y = r.top - p - 8 - h }
  else { x = r.right + p + 10; y = r.top + r.height / 2 - h / 2 }
  a.style.left = Math.max(8, Math.min(x, 1272 - w)) + 'px'; a.style.top = Math.max(8, Math.min(y, 712 - h)) + 'px'
})
</script>`
const page = (css, body) => `<!doctype html><meta charset=utf-8><style>${BASE_CSS}${css}</style><body>${body}${ANN_SCRIPT}</body>`

/* ---------------- GitHub (light theme) ---------------- */
const MARK = '<svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>'
const GH_CSS = `
body{background:#fff;color:#1f2328;font-size:14px}
.hd{height:64px;background:#f6f8fa;border-bottom:1px solid #d1d9e0;display:flex;align-items:center;gap:16px;padding:0 24px;position:relative}
.hd .btn-i{width:34px;height:34px;border:1px solid #d1d9e0;border-radius:6px;display:grid;place-items:center;background:#fff;font-size:18px;color:#59636e}
.hd .title{font-weight:600;font-size:14px}
.hd .sp{flex:1}.hd .search{width:272px;height:32px;border:1px solid #d1d9e0;border-radius:6px;background:#fff;color:#59636e;display:flex;align-items:center;padding:0 10px;font-size:14px}
.av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#8c959f,#59636e);position:relative;overflow:hidden}
.av:before{content:'';position:absolute;left:10px;top:6px;width:12px;height:12px;border-radius:50%;background:#d1d9e0}.av:after{content:'';position:absolute;left:5px;top:20px;width:22px;height:20px;border-radius:50%;background:#d1d9e0}
.menu{position:absolute;right:76px;top:56px;width:208px;background:#fff;border:1px solid #d1d9e0;border-radius:12px;box-shadow:0 8px 24px rgba(140,149,159,.2);padding:8px 0;z-index:10}
.menu div{padding:6px 16px;font-size:14px;display:flex;gap:8px;align-items:center;margin:0 8px;border-radius:6px}.menu .hl{background:#eaeef2;font-weight:600}.menu .ic{width:16px;color:#59636e}.menu hr{border:0;border-top:1px solid #d1d9e0;margin:8px 0}
.main{padding:32px 40px}
.side{position:absolute;left:0;top:64px;bottom:0;width:320px;border-right:1px solid #d1d9e0;padding:24px;background:#fff}
.side h4{margin:0 0 12px;font-size:14px;display:flex;justify-content:space-between;align-items:center}
.btn{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(31,35,40,.15);border-radius:6px;padding:5px 16px;font-weight:600;font-size:14px;background:#f6f8fa}
.btn.g{background:#1f883d;color:#fff;border-color:rgba(31,35,40,.15)}
.feed{margin-left:344px;padding:32px 40px}.card{border:1px solid #d1d9e0;border-radius:6px;padding:16px;margin-bottom:16px;color:#59636e}
.skel{height:10px;border-radius:5px;background:#eaeef2;margin:8px 0}
.new{width:640px;margin:0 auto;padding:28px 0}
.new h1{font-size:24px;font-weight:600;margin:0 0 4px;color:#1f2328}.new .sub{color:#59636e;margin-bottom:16px}.new hr{border:0;border-top:1px solid #d1d9e0;margin:14px 0}
.new label{font-weight:600;display:block;margin-bottom:6px}.in{height:32px;border:1px solid #d1d9e0;border-radius:6px;padding:0 12px;display:flex;align-items:center;background:#fff;box-shadow:inset 0 1px 0 rgba(208,215,222,.2)}
.row{display:flex;gap:10px;align-items:flex-end;margin-bottom:6px}.slash{padding-bottom:6px;font-size:20px;color:#59636e}.hint{color:#59636e;font-size:12px;margin:6px 0 10px}
.opt{display:flex;gap:12px;align-items:flex-start;padding:10px 0}.opt .t{font-weight:600}.opt .d{color:#59636e;font-size:12px}.rad{width:16px;height:16px;border-radius:50%;border:1px solid #59636e;margin-top:3px;display:grid;place-items:center;flex:none}.rad.on{border:5px solid #0969da}
.ico{font-size:22px;color:#59636e;width:28px;text-align:center;flex:none}.chk{width:16px;height:16px;border:1px solid #59636e;border-radius:3px;background:#fff;flex:none}.sel{margin-left:auto;border:1px solid #d1d9e0;background:#f6f8fa;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:600}
.repohead{padding:16px 32px 0;background:#f6f8fa;border-bottom:1px solid #d1d9e0}.crumb{font-size:20px;display:flex;gap:6px;align-items:center;margin-bottom:12px}.crumb a{color:#0969da}.pill{border:1px solid #d1d9e0;border-radius:2em;padding:0 8px;font-size:12px;font-weight:500;color:#59636e}
.tabs{display:flex;gap:4px;font-size:14px}.tabs span{padding:8px 12px;border-bottom:2px solid transparent;color:#1f2328}.tabs .on{border-color:#fd8c73;font-weight:600}
.cols{padding:24px 32px;max-width:1040px;margin:0 auto}.quick{border:1px solid #d1d9e0;border-radius:6px;background:#f6f8fa;padding:16px;margin-bottom:16px}.quick h2{margin:0 0 4px;font-size:16px}
.url{display:flex;align-items:center;gap:8px;margin-top:8px}.seg{display:inline-flex;border:1px solid #d1d9e0;border-radius:6px;overflow:hidden;background:#fff}.seg span{padding:4px 12px;font-weight:600;font-size:12px}.seg .on{background:#0969da;color:#fff}
.urlbox{flex:1;height:32px;border:1px solid #d1d9e0;background:#fff;border-radius:6px;display:flex;align-items:center;padding:0 10px;font-family:Consolas,monospace;font-size:13px}.cp{width:32px;height:32px;border:1px solid #d1d9e0;border-radius:6px;background:#f6f8fa;display:grid;place-items:center;font-size:14px}
.cmdbox{background:#f6f8fa;border:1px solid #d1d9e0;border-radius:6px;padding:12px 16px;font-family:Consolas,monospace;font-size:13px;line-height:1.55;margin:8px 0 16px;white-space:pre}
.files{border:1px solid #d1d9e0;border-radius:6px;overflow:hidden}.files .fh{background:#f6f8fa;padding:10px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid #d1d9e0;font-size:13px}.files .fr{display:flex;gap:12px;padding:8px 16px;border-top:1px solid #eaeef2;font-size:14px;align-items:center}
.files .fr:first-of-type{border-top:0}.fr .n{width:220px;color:#1f2328}.fr .m{flex:1;color:#59636e}.fr .t{color:#59636e;width:110px;text-align:right}
.br{display:flex;gap:12px;align-items:center;margin-bottom:16px}.brn{border:1px solid #d1d9e0;border-radius:6px;background:#f6f8fa;padding:4px 12px;font-weight:600;font-size:13px}
.av2{width:20px;height:20px;border-radius:50%;background:#8c959f;display:inline-block;flex:none}
.commits h3{margin:0 0 12px;font-size:16px}.ci{border:1px solid #d1d9e0;border-radius:6px;overflow:hidden}.ci .r{display:flex;align-items:center;padding:14px 16px;border-top:1px solid #d1d9e0;gap:12px}.ci .r:first-child{border-top:0}.ci .r b{flex:1;font-size:14px}.ci .r span{color:#59636e;font-size:12px}.hash{font-family:Consolas,monospace;border:1px solid #d1d9e0;border-radius:6px;padding:2px 8px;font-size:12px;color:#0969da;background:#fff}
`
const hd = (menu, a = {}) => `<div class="hd"><div class="btn-i">☰</div><div style="color:#1f2328">${MARK}</div><div class="title">Dashboard</div><div class="sp"></div><div class="search">Type <b style="margin:0 4px">/</b> to search</div><div class="btn-i" style="font-weight:700;width:auto;padding:0 10px;gap:4px;display:flex;align-items:center"${a.plus ?? ''}>+ <span style="font-size:10px">▼</span></div><div class="btn-i">⏲</div><div class="btn-i">✉</div><div class="av"></div>${menu ? `<div class="menu"><div${a.newRepo ?? ''}><span class="ic">▫</span>New repository</div><div><span class="ic">⇩</span>Import repository</div><div><span class="ic">▭</span>New codespace</div><div><span class="ic">‹›</span>New gist</div><hr><div><span class="ic">▤</span>New organization</div><div><span class="ic">▦</span>New project</div></div>` : ''}</div>`
const repoHead = (tab = 'Code') => `<div class="repohead"><div class="crumb"><span style="color:#59636e">▭</span><a>USERNAME</a><span style="color:#59636e">/</span><a><b>my-first-git-project</b></a><span class="pill">Public</span></div><div class="tabs">${['Code', 'Issues', 'Pull requests', 'Actions', 'Projects', 'Security', 'Insights', 'Settings'].map((t) => `<span class="${t === tab ? 'on' : ''}">${t}</span>`).join('')}</div></div>`

const shots = {}

shots['s1-github-new-repo-menu'] = page(GH_CSS, `${hd(true, { plus: A(1, 'Click the + icon', 'left'), newRepo: A(2, 'Select New repository', 'left') })}
<div class="side"><h4>Top repositories <span class="btn g" style="padding:3px 12px">▫ New</span></h4><div class="skel" style="width:80%"></div><div class="skel" style="width:60%"></div><div class="skel" style="width:70%"></div></div>
<div class="feed"><h2 style="margin:0 0 16px;font-weight:600">Home</h2><div class="card"><div class="skel" style="width:40%"></div><div class="skel"></div><div class="skel" style="width:85%"></div></div><div class="card"><div class="skel" style="width:30%"></div><div class="skel"></div></div></div>`)

shots['s1-github-create-form'] = page(GH_CSS, `${hd(false)}
<div class="new"><h1>Create a new repository</h1><div class="sub">A repository contains all project files, including the revision history.</div><hr>
<div class="row"><div><label>Owner *</label><div class="in" style="width:200px"><span class="av2"></span>&nbsp;USERNAME&nbsp;▾</div></div><div class="slash">/</div><div style="flex:1"><label>Repository name *</label><div class="in"${A(1, 'Type a name', 'right')}>my-first-git-project</div></div></div>
<div class="hint">Great repository names are short and memorable.</div>
<label>Description <span style="color:#59636e;font-weight:400">(optional)</span></label><div class="in" style="margin-bottom:10px">My first Git and GitHub project</div><hr>
<div class="opt"><div class="rad on"${A(2, 'Select Public', 'left')}></div><div class="ico">▭</div><div><div class="t">Public</div><div class="d">Anyone on the internet can see this repository.</div></div></div>
<div class="opt"><div class="rad"></div><div class="ico">🔒</div><div><div class="t">Private</div><div class="d">You choose who can see and commit to this repository.</div></div></div><hr>
<div${A(3, 'Leave ALL three OFF', 'right')} style="padding:2px 0">
<div class="opt"><div class="chk"></div><div><div class="t">Add README</div></div><div class="sel">Off</div></div>
<div class="opt"><div class="chk"></div><div><div class="t">Add .gitignore</div></div><div class="sel">No .gitignore</div></div>
<div class="opt"><div class="chk"></div><div><div class="t">Add license</div></div><div class="sel">No license</div></div></div>
<div style="text-align:right;margin-top:10px"><span class="btn g"${A(4, 'Create repository', 'left')}>Create repository</span></div></div>`)

const quickSetup = (a) => page(GH_CSS, `${hd(false)}${repoHead()}
<div class="cols"><div class="quick"><h2${a.title ?? ''}>Quick setup — if you’ve done this kind of thing before</h2>
<div class="url"><span class="btn" style="padding:3px 12px">▫ Set up in Desktop</span><span style="color:#59636e">or</span><div class="seg"${a.seg ?? ''}><span class="on">HTTPS</span><span>SSH</span></div><div class="urlbox"${a.url ?? ''}>${URL_REMOTE}</div><div class="cp"${a.copy ?? ''}>⧉</div></div>
<div style="margin-top:10px;color:#59636e">Get started by <u style="color:#0969da">creating a new file</u> or <u style="color:#0969da">uploading an existing file</u>. We recommend every repository include a <u style="color:#0969da">README</u>, <u style="color:#0969da">LICENSE</u>, and <u style="color:#0969da">.gitignore</u>.</div></div>
<h3 style="margin:18px 0 0;font-size:16px">…or create a new repository on the command line</h3>
<div class="cmdbox">echo "# my-first-git-project" &gt;&gt; README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin ${URL_REMOTE}
git push -u origin main</div></div>`)

shots['s1-github-empty-repo'] = quickSetup({ title: A(1, 'A brand-new, empty repository', 'below') })
shots['s7-github-copy-url'] = quickSetup({ seg: A(1, 'Make sure HTTPS is selected', 'below'), copy: A(2, 'Click to copy the URL', 'below') })

const ghRepo = (a = {}) => page(GH_CSS, `${hd(false)}${repoHead()}
<div class="cols"><div class="br"><span class="brn"${a.branch ?? ''}>⑂ main ▾</span><span style="color:#59636e">⑂ 1 Branch</span><span style="color:#59636e">◇ 0 Tags</span><span style="flex:1"></span><span class="btn g">&lt;&gt; Code ▾</span></div>
<div class="files"><div class="fh"><span class="av2"></span><b>USERNAME</b><span style="color:#59636e;flex:1">Update hello message</span><span class="hash">${hashes[0]}</span><span style="color:#59636e">now</span><span style="color:#1f2328;font-weight:600"${a.commits ?? ''}>⟲ 2 Commits</span></div>
<div class="fr"><span>▤</span><span class="n"${a.file ?? ''}>hello.txt</span><span class="m">Update hello message</span><span class="t">now</span></div></div>
<div style="border:1px solid #d1d9e0;border-radius:6px;margin-top:16px;padding:16px;color:#59636e"><b style="color:#1f2328">Add a README</b><div style="margin-top:6px">Help people interested in this repository understand your project by adding a README.</div></div></div>`)
shots['s9-github-repo'] = ghRepo({ branch: A(1, 'The main branch', 'right'), file: A(2, 'Your file: hello.txt', 'right'), commits: A(3, 'Two commits', 'below') })

shots['s9-github-commits'] = page(GH_CSS, `${hd(false)}${repoHead()}
<div class="cols commits"><div class="br"><span class="brn">⑂ main ▾</span></div><h3>Commits on today</h3><div class="ci">
<div class="r"${A(1, 'Second commit: Update hello message', 'left')}><span class="av2"></span><b>Update hello message</b><span class="hash">${hashes[0]}</span></div>
<div class="r"${A(2, 'First commit: Add first text file', 'left')}><span class="av2"></span><b>Add first text file</b><span class="hash">${hashes[1]}</span></div></div></div>`)

/* ---------------- Windows desktop + dialogs ---------------- */
const WIN_CSS = `
body{background:linear-gradient(135deg,#0b3d6e,#1b74c4 55%,#5fb3ee);font-family:'Segoe UI',sans-serif;color:#fff;font-size:14px}
.fold{position:absolute;width:96px;text-align:center;font-size:13px;text-shadow:0 1px 3px rgba(0,0,0,.6);padding:6px 2px;border-radius:4px}
.fold svg{width:56px;height:56px;display:block;margin:0 auto 4px}
.ctx{position:absolute;background:rgba(245,245,245,.98);color:#1b1b1b;border:1px solid #c9c9c9;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.35);padding:4px}
.ctx div{padding:6px 12px;border-radius:4px;display:flex;justify-content:space-between}.ctx .hl{background:#d9e6f7}.ctx hr{border:0;border-top:1px solid #ddd;margin:4px 0}
.task{position:absolute;left:0;right:0;bottom:0;height:48px;background:rgba(235,240,247,.92)}
.sel{outline:2px solid rgba(255,255,255,.7);background:rgba(255,255,255,.18)}
`
const FOLDER = '<svg viewBox="0 0 64 64"><path d="M4 14h20l6 6h30v34H4z" fill="#f5c542"/><path d="M4 24h56v30H4z" fill="#ffd75e"/></svg>'
shots['s2-desktop-new-folder'] = page(WIN_CSS, `
<div class="fold" style="left:24px;top:24px"><svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="52" rx="4" fill="#fff"/><path d="M18 20h28M18 30h28M18 40h20" stroke="#4a90d9" stroke-width="4"/></svg>Notes</div>
<div class="fold sel" style="left:150px;top:420px"${A(3, 'Name it my-first-git-project', 'right')}>${FOLDER}my-first-git-project</div>
<div class="ctx" style="left:420px;top:160px;width:230px"${A(1, 'Right-click an empty area of the Desktop', 'left')}><div>View <span>›</span></div><div>Sort by <span>›</span></div><div>Refresh</div><hr><div class="hl">New <span>›</span></div><hr><div>Display settings</div><div>Personalize</div></div>
<div class="ctx" style="left:654px;top:232px;width:210px"><div${A(2, 'New → Folder', 'right')}>Folder</div><div>Shortcut</div><hr><div>Text Document</div></div>
<div class="task"></div>`)

const VS_CSS = `
body{background:#1e1e1e;color:#cccccc;font-family:'Segoe UI',system-ui,sans-serif;font-size:13px}
.vs{position:absolute;inset:0;display:grid;grid-template-rows:30px 1fr 22px;grid-template-columns:48px 260px 1fr}
.title{grid-column:1/4;background:#323233;display:flex;align-items:center;gap:14px;padding:0 10px;font-size:13px;position:relative}.title .lg{width:16px;height:16px;border-radius:3px;background:#2b88d8}
.title .m{padding:3px 6px;border-radius:4px}.title .m.on{background:#505050}.title .c{flex:1;text-align:center;color:#999}.title .w{letter-spacing:22px;color:#aaa;padding-right:6px}
.act{grid-row:2;background:#333333;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:6px}.act div{width:48px;height:46px;display:grid;place-items:center;font-size:20px;color:#858585}.act .on{color:#fff;border-left:2px solid #fff}
.sb{grid-row:2;background:#252526;padding:0;overflow:hidden}.sb .h{padding:10px 20px;font-size:11px;letter-spacing:.8px;color:#bbb;display:flex;justify-content:space-between}
.sb .f{padding:3px 8px;background:#37373d;font-weight:700;font-size:11px;display:flex;justify-content:space-between;align-items:center;color:#ccc}.sb .f .ic{display:flex;gap:10px;color:#ccc;font-weight:400;font-size:14px}.sb .it{padding:4px 22px;display:flex;justify-content:space-between;font-size:14.5px}.sb .it.sel{background:#37373d}.sb .u{color:#73c991;font-weight:700}.sb .mm{color:#e2c08d;font-weight:700}
.sb .inp{margin:2px 22px;border:1px solid #007fd4;background:#3c3c3c;padding:2px 6px;color:#fff;font-size:13px}.sb .empty{padding:14px 20px;color:#999;line-height:1.6}
.ed{grid-row:2;display:grid;grid-template-rows:35px 1fr var(--ph,330px);min-width:0;background:#1e1e1e}
.tabs{background:#252526;display:flex}.tabs .t{padding:0 16px;display:flex;align-items:center;gap:8px;background:#1e1e1e;border-top:1px solid #007acc;color:#fff}
.code{font-family:Consolas,'Cascadia Mono',monospace;font-size:18px;padding:12px 0;line-height:28px;overflow:hidden}.code .ln{display:inline-block;width:56px;text-align:right;color:#858585;padding-right:20px}
.welcome{display:grid;place-content:center;justify-items:center;color:#888;gap:10px}.welcome .big{font-size:34px;font-weight:300;color:#aaa}.welcome .k{color:#ccc}
.pn{background:#1e1e1e;border-top:1px solid #444;display:grid;grid-template-rows:34px 1fr;min-height:0}.pn .th{display:flex;gap:22px;padding:0 16px;align-items:center;font-size:11px;letter-spacing:.5px;color:#999;text-transform:uppercase}.pn .th .on{color:#fff;border-bottom:1px solid #fff;padding:7px 0}
.pn .tb{padding:4px 16px;font-family:Consolas,'Cascadia Mono',monospace;font-size:15.5px;line-height:22px;overflow:hidden;color:#ccc}
.ps{color:#ccc}.cmd{color:#fff}.to{margin:0;font:inherit;white-space:pre-wrap;color:#ccc}.tl{white-space:pre}.cur{display:inline-block;width:8px;height:15px;background:#ccc;vertical-align:middle}
.r{color:#f14c4c}.g{color:#23d18b}.y{color:#e5e510}.c{color:#29b8db}
.st{grid-column:1/4;background:#007acc;color:#fff;font-size:12px;display:flex;align-items:center;gap:16px;padding:0 10px}.st .sp{flex:1}
.dim{color:#999}
.menu2{position:absolute;left:28px;top:30px;width:300px;background:#252526;border:1px solid #454545;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.5);padding:4px 0;z-index:9}
.menu2 div{padding:5px 22px;display:flex;justify-content:space-between;color:#ccc}.menu2 .hl{background:#04395e;color:#fff}.menu2 hr{border:0;border-top:1px solid #454545;margin:4px 0}
.dlg{position:absolute;left:340px;top:150px;width:600px;background:#252526;border:1px solid #454545;border-radius:8px;padding:26px 28px;z-index:20;box-shadow:0 12px 40px rgba(0,0,0,.6)}.dlg h2{margin:0 0 8px;font-size:17px;font-weight:600;color:#fff}.dlg p{margin:0 0 14px;color:#ccc;line-height:1.5}.dlg .b{display:block;border-radius:4px;padding:10px 14px;margin-top:8px;font-weight:600;text-align:center}.dlg .b.p{background:#0e639c;color:#fff}.dlg .b.s{background:#3a3d41;color:#fff}
.back{position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:15}
`
function vscode({ files = [], input, tabs = [], editor, terminal, folder = 'MY-FIRST-GIT-PROJECT', menu, dialog, branch, ph, a = {}, showNewIcons = true }) {
  const explorer = folder === null ? `<div class="empty">You have not yet opened a folder.</div>` : `
    <div class="f"><span>⌄ ${folder}</span><span class="ic">${showNewIcons ? `<span${a.newFile ?? ''}>▫</span><span>▭</span><span>⟳</span><span>⊟</span>` : ''}</span></div>
    ${input ? `<div class="inp"${a.input ?? ''}>${input}</div>` : ''}${files.map((f) => `<div class="it${f.sel ? ' sel' : ''}"${f.sel ? a.file ?? '' : ''}><span>${f.icon ?? '▤'} ${f.name}</span><span class="${f.badge === 'M' ? 'mm' : 'u'}">${f.badge ?? ''}</span></div>`).join('')}`
  const tabBar = tabs.map((t) => `<div class="t">▤ ${t.name} ${t.dirty ? '●' : '×'}</div>`).join('')
  const editorBody = editor
    ? `<div class="code"${a.editor ?? ''}>${editor.map((l, i) => `<div><span class="ln">${i + 1}</span>${esc(l)}</div>`).join('')}</div>`
    : `<div class="welcome"><div class="big">Visual Studio Code</div><div>Editing evolved</div><div class="k">Show All Commands &nbsp;<b>Ctrl+Shift+P</b></div><div class="k">Open Folder &nbsp;<b>Ctrl+K Ctrl+O</b></div></div>`
  return page(VS_CSS, `<div class="vs"${ph ? ` style="--ph:${ph}px"` : ''}>
    <div class="title"><span class="lg"></span><span class="m${menu ? ' on' : ''}"${a.file_ ?? ''}>File</span><span class="m">Edit</span><span class="m">Selection</span><span class="m">View</span><span class="m">Go</span><span class="m">Run</span><span class="m">Terminal</span><span class="m">Help</span><span class="c">${folder ? 'my-first-git-project - Visual Studio Code' : 'Visual Studio Code'}</span><span class="w">— ☐ ✕</span>
      ${menu ? `<div class="menu2"><div>New Text File <span class="dim">Ctrl+N</span></div><div>New File… <span class="dim">Ctrl+Alt+Windows+N</span></div><div>New Window <span class="dim">Ctrl+Shift+N</span></div><hr><div>Open File… <span class="dim">Ctrl+O</span></div><div class="hl"${a.openFolder ?? ''}>Open Folder… <span>Ctrl+K Ctrl+O</span></div><div>Open Workspace from File…</div><div>Open Recent <span>›</span></div><hr><div>Save <span class="dim">Ctrl+S</span></div><div>Save As…</div><hr><div>Exit</div></div>` : ''}
    </div>
    <div class="act"><div class="on">❐</div><div>⌕</div><div>⑂</div><div>▷</div><div>⊞</div></div>
    <div class="sb"><div class="h"><span>EXPLORER</span><span>···</span></div>${explorer}</div>
    <div class="ed"><div class="tabs">${tabBar}</div>${editorBody}
      <div class="pn"><div class="th"><span>Problems</span><span>Output</span><span>Debug Console</span><span class="on">Terminal</span><span>Ports</span><span style="flex:1"></span><span style="text-transform:none;color:#ccc">⌨ powershell ▾ &nbsp; + ⌄</span></div><div class="tb">${terminal ?? ''}</div></div></div>
    <div class="st"><span>${branch ? '⑂ ' + branch : ''}</span>${branch ? '<span>⟳ 0↓ 0↑</span>' : ''}<span class="sp"></span><span>Ln 1, Col 1</span><span>UTF-8</span><span>CRLF</span><span>Plain Text</span></div>
    ${dialog ? `<div class="back"></div>${dialog}` : ''}
  </div>`)
}

shots['s2-vscode-open-folder'] = vscode({ folder: null, menu: true, showNewIcons: false, a: { file_: A(1, 'Open the File menu', 'right'), openFolder: A(2, 'Choose Open Folder…', 'right') } })

shots['s2-vscode-select-folder'] = page(`
body{background:#e9edf3;font-family:'Segoe UI',sans-serif;color:#1b1b1b;font-size:13px}
.d{position:absolute;left:190px;top:80px;width:900px;height:540px;background:#fff;border:1px solid #9aa;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.35);display:grid;grid-template-rows:38px 44px 1fr 74px}
.d .t{padding:10px 14px;font-size:13px;border-bottom:1px solid #eee;display:flex;justify-content:space-between}.d .a{display:flex;gap:10px;align-items:center;padding:0 14px}.d .path{flex:1;border:1px solid #ccc;border-radius:4px;padding:5px 10px}.d .bd{display:grid;grid-template-columns:200px 1fr;border-top:1px solid #eee}.d .nav{background:#f6f8fa;padding:12px;line-height:2}.d .nav .on{background:#cce4f7;border-radius:4px;padding:0 8px}
.d .ls{padding:12px;line-height:2.1}.d .ls div{padding:0 10px;display:flex;gap:10px;align-items:center}.d .ls .sel{background:#cce4f7;border:1px solid #99c9ee;border-radius:3px}.d .ft{border-top:1px solid #eee;padding:12px 18px;display:flex;gap:10px;align-items:center}.d .ft .f{flex:1;border:1px solid #ccc;border-radius:4px;padding:6px 10px}.bt{border:1px solid #adadad;background:#e1e1e1;padding:6px 18px;border-radius:4px}.bt.p{border-color:#0067c0;background:#0067c0;color:#fff}
`, `<div class="d"><div class="t"><span>Open Folder</span><span>✕</span></div><div class="a"><span>←</span><span>→</span><span class="path">This PC › Desktop</span><span style="border:1px solid #ccc;border-radius:4px;padding:5px 10px;color:#777">Search Desktop</span></div>
<div class="bd"><div class="nav"><div>★ Quick access</div><div class="on"${A(1, 'Go to the Desktop', 'right')}>▭ Desktop</div><div>⇩ Downloads</div><div>▤ Documents</div><div>▣ Pictures</div></div><div class="ls"><div>${FOLDER.replace('<svg', '<svg width="22" height="22"')} Projects</div><div class="sel"${A(2, 'Click my-first-git-project', 'right')}>${FOLDER.replace('<svg', '<svg width="22" height="22"')} my-first-git-project</div></div></div>
<div class="ft"><span>Folder:</span><span class="f">my-first-git-project</span><span class="bt p"${A(3, 'Select Folder', 'above')}>Select Folder</span><span class="bt">Cancel</span></div></div>`)

shots['s2-vscode-trust'] = vscode({ folder: 'MY-FIRST-GIT-PROJECT', dialog: `<div class="dlg"><h2>Do you trust the authors of the files in this folder?</h2><p>Code provides features that may automatically execute files in this folder. Because this is your own new folder, it is safe to trust it.</p><span class="b p"${A(1, 'Choose “Yes, I trust the authors”', 'below')}>Yes, I trust the authors</span><span class="b s">No, I don't trust the authors</span></div>` })

const T = (entries) => term(entries)
const HELLO = ['Hello, Git! This is my first project.']
const TWO = ['Hello, Git! This is my first project.', 'I am learning version control with Git.']
const F = (badge) => [{ name: 'hello.txt', badge, sel: true }]

shots['s3-vscode-terminal-init'] = vscode({ branch: 'main', terminal: T([{ cmd: 'git init', a: [1, 'Type this and press Enter', 'right'] }, { out: out.init }, { cmd: 'git status' }, { out: out.status0, a: [2, 'Git is ready: “No commits yet”', 'left'] }]) })

shots['s4-vscode-new-file'] = vscode({ input: 'hello.txt', terminal: T([{ cmd: 'git status' }, { out: out.status0 }]), a: { newFile: A(1, 'New File icon', 'above'), input: A(2, 'Type hello.txt, press Enter', 'right') } })
shots['s4-vscode-hello'] = vscode({ files: F('U'), tabs: [{ name: 'hello.txt' }], editor: HELLO, terminal: T([{ cmd: 'git status' }, { out: out.status0 }]), branch: 'main', a: { editor: A(1, 'Type your message, then save (Ctrl + S)', 'below'), file: A(2, 'U = untracked (new)', 'below') } })
shots['s4-terminal-untracked'] = vscode({ files: F('U'), tabs: [{ name: 'hello.txt' }], editor: HELLO, terminal: T([{ cmd: 'git status' }, { out: out.status1, a: [1, 'hello.txt is listed as untracked', 'left'] }]), branch: 'main' })

shots['s5-terminal-add-status'] = vscode({ files: F('A'), tabs: [{ name: 'hello.txt' }], editor: HELLO, terminal: T([{ cmd: 'git add hello.txt' }, { cmd: 'git status' }, { out: out.status2, a: [1, 'Now it is staged: “Changes to be committed”', 'left'] }]), branch: 'main' })
shots['s5-terminal-commit-log'] = vscode({ files: F(''), tabs: [{ name: 'hello.txt' }], editor: HELLO, terminal: T([{ cmd: 'git commit -m "Add first text file"' }, { out: out.commit1, a: [1, 'Commit created', 'left'] }, { cmd: 'git log --oneline' }, { out: out.log1, a: [2, 'Your first commit in the history', 'left'] }]), branch: 'main' })

shots['s6-vscode-modified'] = vscode({ files: F('M'), tabs: [{ name: 'hello.txt' }], editor: TWO, terminal: T([{ cmd: 'git status' }, { out: out.status3, a: [3, '“modified: hello.txt”', 'left'] }]), branch: 'main', a: { editor: A(1, 'Add a second line, then save (Ctrl + S)', 'below'), file: A(2, 'M = modified', 'below') } })
shots['s6-terminal-modified'] = vscode({ files: F(''), tabs: [{ name: 'hello.txt' }], editor: TWO, ph: 400, terminal: T([{ cmd: 'git add hello.txt' }, { cmd: 'git status' }, { out: out.status4 }, { cmd: 'git commit -m "Update hello message"' }, { out: out.commit2, a: [1, 'Second commit created', 'left'] }]), branch: 'main' })
shots['s6-terminal-two-commits'] = vscode({ files: F(''), tabs: [{ name: 'hello.txt' }], editor: TWO, terminal: T([{ cmd: 'git log --oneline' }, { out: out.log2, a: [1, 'Two commits = two saved versions', 'left'] }]), branch: 'main' })

shots['s7-terminal-remote'] = vscode({ files: F(''), tabs: [{ name: 'hello.txt' }], editor: TWO, terminal: T([{ cmd: `git remote add origin ${URL_REMOTE}` }, { cmd: 'git remote -v' }, { out: out.remoteV, a: [1, 'origin = your GitHub repository', 'below'] }]), branch: 'main' })
shots['s8-terminal-push'] = vscode({ files: F(''), tabs: [{ name: 'hello.txt' }], editor: TWO, ph: 400, terminal: T([{ cmd: 'git branch -M main' }, { cmd: 'git push -u origin main' }, { out: out.push, a: [1, 'Pushed! “main -> main”', 'left'] }]), branch: 'main' })

/* ---------------- render ---------------- */
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
try {
  const p = await b.newPage()
  await p.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1.5 })
  for (const [name, html] of Object.entries(shots)) {
    await p.setContent(html, { waitUntil: 'load' })
    await p.screenshot({ path: `${OUT}/${name}.png`, type: 'png' })
    console.log('wrote', `${OUT}/${name}.png`)
  }
} finally { await b.close() }
