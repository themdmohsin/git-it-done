import type { Card, StackScene } from './engine/types'
import { vijayCards } from './vijay/cards'
import { workshopCards } from './workshop'
import { MUKTI, RESOURCES } from './links'

const none = { type: 'none' } as const

/* Old links keep working: the single setup card was replaced by the workshop section (#/os is its first card). */
export const ROUTE_ALIASES: Record<string, string> = { setup: 'os', 'gh-login': 'gh-install' }

/* The stack, BACK to FRONT. Every scene in the zoom-out and peel-back is a slice of this list. */
const STACK = ['recap', 'git-answer', 'git-born', 'vc-idea', 'linus', 'linux', 'personal-software', 'mukti', 'open-source']
const peel = (front: string, extra: Partial<StackScene> = {}): StackScene => ({
  layers: STACK.slice(0, STACK.indexOf(front) + 1),
  front,
  zoomed: true,
  leave: 'fly',
  ...extra,
})

export const cards: Card[] = [
  /* ---------- A. Hook ---------- */
  {
    id: 'messy',
    rail: 'Messy folder',
    section: 'hook',
    kicker: 'The problem',
    title: "You've all been here.",
    sentence: 'Which file is the real one? Who changed what? Nobody knows.',
    view: 'messy',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Open a folder where you keep your own work, such as a report or an assignment.',
        'Count how many copies of the same file there are, and check whether you can tell which one is newest without opening them.',
        'Keep that folder in mind. The next cards show how Git replaces all those copies with one tidy history.',
      ],
      happening: 'Everyone has a folder like this: copies pile up, file names get longer, and nobody can say which version is the real one or who made it. Without a real history you cannot see what changed, who changed it, or go back, and when two people edit the same file one can overwrite the other. Sync tools such as Google Drive and Dropbox help a little, but they cannot let many people work in parallel and combine the results. Version control (a tool that records every change to your files) exists to fix exactly this.',
      links: [
        { label: 'Pro Git: About version control', url: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control' },
      ],
    },
  },
  {
    id: 'git-answer',
    rail: 'Git',
    section: 'hook',
    kicker: 'The answer',
    title: "There's a tool for this.",
    sentence: 'It remembers every version, who made it, and why.',
    view: 'hero',
    hero: 'Git',
    lane: 'main',
    into: 'drop',
    scene: { layers: ['recap', 'git-answer'], front: 'git-answer', zoomed: false },
    steps: [],
    drawer: {
      clicks: [
        'Read the first paragraph at git-scm.com. It describes Git in one sentence.',
        'There is nothing to type yet. You will install and use Git later in this workshop.',
      ],
      happening: 'Git is a free program that keeps a full history of your project: every saved version, who saved it, when, and a note on why. It runs on your own computer, so it works without internet. The next cards zoom out to where Git came from, then come back to the commands.',
      links: [
        { label: 'Git: the official website', url: 'https://git-scm.com/' },
        { label: 'Pro Git book (free, official)', url: 'https://git-scm.com/book' },
      ],
    },
  },

  /* ---------- B + C. Zoom out, then peel back ---------- */
  {
    id: 'open-source',
    rail: 'Open source',
    section: 'stepback',
    kicker: 'Take a step back',
    title: 'Open source',
    sentence: 'Open source software is software whose source code (the human-readable part, written in Python, Java, C...) is released under a license that lets anyone use, study, modify and share it.',
    bullets: [
      '\u201cFree\u201d here means freedom, not price.',
      'Visible code is not automatically open source: no license means the author keeps all rights.',
      'You already use it: Linux, Android, Firefox, Python, VS Code, WordPress.',
    ],
    view: 'story',
    art: 'ring',
    lane: 'detour',
    into: 'zoomout',
    scene: peel('open-source', { enter: 'rise' }),
    steps: [],
    drawer: {
      clicks: [
        'Open github.com and search for a project you already use, such as Firefox or Python. Read some of its real source code.',
        'Find the file called LICENSE in that project and read the first lines. It tells you what you may do.',
        'Compare the two main licence families. A permissive licence such as the MIT licence (named after the Massachusetts Institute of Technology) lets you do almost anything if you keep the notice. A copyleft licence asks you to share your changed versions under the same terms, so the freedom travels with the code.',
        'The idea goes beyond software: Wikipedia (Creative Commons), OpenStreetMap, Arduino and RISC-V (a free design for processors) share their work openly too.',
        'You can help without writing code: documentation, translations, design, bug reports, testing, answering questions and organising events all count.',
      ],
      mistakes: [
        { title: 'Thinking free means no cost', fix: 'In free software, free means freedom to use, study, change and share. Open source code can legally be sold.' },
        { title: 'Thinking visible code is automatically open source', fix: 'Without a licence the author keeps all rights, even if you can read the code. Look for a LICENSE file.' },
        { title: 'Assuming Android is fully open', fix: 'The base, the Android Open Source Project (AOSP), is open source, but many Google apps are not.' },
      ],
      happening: 'Open source means the source code (the recipe behind a program) is public, and a licence says you may use it, study it, change it and share it. "Free" here means freedom, not price: free software can cost nothing and still hide its code, while open source code can legally be sold, and people often combine both ideas as free and open source software (FOSS). Seeing the code is not enough, because with no licence the author keeps all rights. Many people can inspect, test and fix the same code, which can make it more secure and reliable, but that is not automatic.',
      links: [
        { label: 'The Open Source Definition', url: 'https://opensource.org/osd' },
        { label: 'Choose a License', url: 'https://choosealicense.com/' },
        { label: 'What is free software? (GNU Project)', url: 'https://www.gnu.org/philosophy/free-sw.html' },
      ],
    },
  },
  {
    id: 'mukti',
    rail: 'Mukti',
    section: 'stepback',
    kicker: 'Who we are',
    title: 'Mukti',
    sentence: 'A student-run free and open source software community, with members across India.',
    bullets: [
      'Learn by doing: projects, workshops and hackathons.',
      'Skills that class doesn\u2019t teach: from soldering to securing a network.',
      'Open source, system administration and cybersecurity.',
      'Join us on GitHub and Telegram.',
    ],
    tagline: { text: 'Svatantrata Sarvada', translation: 'Freedom Always' },
    links: [
      { label: 'GitHub', url: MUKTI.github },
      { label: 'Telegram', url: MUKTI.telegram },
      { label: 'Email', url: MUKTI.email },
    ],
    linkify: { GitHub: MUKTI.github, Telegram: MUKTI.telegram },
    view: 'story',
    art: 'mukti',
    lane: 'detour',
    scene: peel('mukti'),
    steps: [],
    drawer: {
      clicks: [
        'Open the Mukti website to see the projects, events and blog posts.',
        'Look at the Mukti organisation on GitHub to see the projects you could contribute to.',
        'Join the Telegram group to meet the members and hear about the next event.',
      ],
      happening: 'Mukti is a student-run community where students turn what they learn in class into real skills by building things together. Members contribute to free and open source software (FOSS) projects, run workshops and hackathons, and take part in national and international forums. This workshop is exactly that idea: learning by getting your hands dirty.',
      links: [
        { label: 'Mukti community website', url: MUKTI.website },
        { label: 'Mukti on GitHub', url: MUKTI.github },
        { label: 'Mukti on Telegram', url: MUKTI.telegram },
      ],
    },
  },
  {
    id: 'personal-software',
    rail: 'Personal software',
    section: 'stepback',
    kicker: 'Where this is going',
    title: 'Software for an audience of one',
    sentence: 'Software is getting cheaper to create, so you can build it just for yourself.',
    bullets: [
      'With AI, anyone can describe what they want in plain language and get working code.',
      'A timetable manager, an expense tracker, anything for your own needs.',
      'It is all assembled from open source parts.',
      'Your software: you can change it and keep your own data.',
    ],
    view: 'story',
    art: 'audience',
    lane: 'detour',
    scene: peel('personal-software'),
    steps: [],
    drawer: {
      clicks: [
        'Think of one small thing you wish existed, such as a timetable manager or an expense tracker.',
        'Describe it in plain words to an AI assistant, then read the code it gives you before you run it.',
        'Optional: publish what you build so that others can use it too.',
      ],
      mistakes: [
        { title: 'Trusting generated code without checking it', fix: 'Read it and test it first. Generated code is a first draft and can contain mistakes.' },
      ],
      happening: 'Software is getting cheaper to create, so you can build it just for yourself. Code written by artificial intelligence (AI) is a first draft: read it and test it before you trust it. Whether an app is generated or handwritten, it depends on open source libraries and frameworks, which are public because of open source culture, and most AI tools also learn from public code.',
      links: [
        { label: 'Starting an open source project (Open Source Guides)', url: 'https://opensource.guide/starting-a-project/' },
      ],
    },
  },
  {
    id: 'linux',
    rail: 'Linux',
    section: 'story',
    kicker: 'A big example',
    title: 'Linux',
    sentence: 'An open source kernel (the core of an operating system) that started as a hobby project in 1991 by a 21-year-old student.',
    bullets: [
      'The kernel talks to the hardware and manages memory.',
      'Packaged with the rest of the OS as distributions: Ubuntu, Debian, Fedora, Arch.',
      'Runs most web servers, cloud infrastructure and Android phones.',
      'Every one of the world\u2019s top 500 supercomputers since 2017.',
    ],
    view: 'story',
    art: 'kernel',
    lane: 'detour',
    scene: peel('linux'),
    steps: [],
    drawer: {
      clicks: [
        'If you have used Ubuntu in a college lab, you have already used Linux.',
        'Visit kernel.org to see the latest Linux release. It is updated regularly.',
      ],
      happening: 'A kernel is the part of an operating system that talks to the hardware and manages memory. Linux began as a hobby project by one 21-year-old student in 1991. A distribution (such as Ubuntu, Debian or Fedora) packages the kernel with the rest of the operating system, and Linux now runs most web servers, cloud computers and Android phones.',
      links: [
        { label: 'The Linux Kernel Archives', url: 'https://www.kernel.org/' },
        { label: 'Linux kernel (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Linux_kernel' },
      ],
    },
  },
  {
    id: 'linus',
    rail: 'Linus Torvalds',
    section: 'story',
    kicker: 'The person',
    title: 'Linus Torvalds',
    sentence: 'He announced a hobby operating system in 1991, inspired by Minix (a small teaching operating system) and Unix. The name Linux blends \u201cLinus\u201d and \u201cUnix\u201d.',
    bullets: ['Thousands of people, around the world.', 'All changing the same code.'],
    note: 'How do you keep track of thousands of people changing the same code?',
    picture: {
      src: 'img/linus-torvalds.jpg',
      alt: 'Linus Torvalds smiling, wearing a headset microphone, at LinuxCon Europe 2014',
      credit: 'Photo: Krd (crop: Von Sprat), CC BY-SA 4.0',
    },
    view: 'story',
    art: 'linus',
    lane: 'detour',
    scene: peel('linus'),
    steps: [],
    drawer: {
      clicks: [
        'Imagine thousands of people changing one large codebase. Write down three difficulties: keeping track of changes, combining changes that touch the same file, and finding which change broke something.',
        'These three difficulties are the real reason version control exists. The next cards show the answer.',
      ],
      happening: 'Linux is now written by a huge crowd. Thousands of contributors send patches (proposed changes), and maintainers (people who look after parts of the code) review them. Good patches flow up through the maintainers, with Linus Torvalds at the top. That only works if every change can be tracked.',
      links: [
        { label: 'How to participate in Linux kernel development', url: 'https://docs.kernel.org/process/howto.html' },
        { label: 'Linus Torvalds (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Linus_Torvalds' },
        { label: 'Photo credit: Krd (photo) and Von Sprat (crop), Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0), via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:LinuxCon_Europe_Linus_Torvalds_03_(cropped).jpg' },
      ],
    },
  },
  {
    id: 'vc-idea',
    rail: 'Version control: the idea',
    section: 'story',
    kicker: 'Version control \u00b7 the idea',
    title: 'A timeline of snapshots',
    sentence: 'Each snapshot (a commit) records who, when and why.',
    bullets: [
      'Go back to any snapshot, any time (history and undo).',
      'Know who changed what (accountability).',
      'Many people work in parallel.',
      'Experiment safely: make a branch without disturbing the main copy.',
    ],
    note: 'Git is the industry standard: over 90% of developers use it (Stack Overflow 2022 survey).',
    view: 'story',
    art: 'snapshots',
    lane: 'detour',
    scene: peel('vc-idea'),
    steps: [],
    drawer: {
      clicks: [
        'Look at the graph on the card. Each dot is a snapshot.',
        'Find the side branch called feature and see where it joins main again.',
      ],
      happening: 'Version control saves your project as a chain of snapshots. Each snapshot (a commit) has an author, a time and a message, and points back at the one before it, like a save point in a game. Older systems kept a single central copy on a server, but Git gives every person a complete copy ("distributed"), so you can work without internet and many people can work in parallel. A branch is a side copy where you can try things without disturbing the main copy.',
      links: [
        { label: 'Pro Git: About version control', url: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control' },
        { label: 'Pro Git: Branches in a nutshell', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' },
      ],
    },
  },
  {
    id: 'git-born',
    rail: 'Git is born',
    section: 'story',
    kicker: 'The origin',
    title: 'So Linus wrote Git',
    sentence: 'In 2005 the Linux team lost the free arrangement for BitKeeper, their source-control tool. So Linus wrote Git, and it was urgent, not a side project.',
    bullets: [
      'BitKeeper was a proprietary (closed) tool; the free arrangement ended after a dispute.',
      'Within days Git was tracking its own development.',
      'Goals: simple, fast, strong support for thousands of parallel lines of work, fully distributed.',
    ],
    note: '2008: GitHub launches, a website that hosts Git projects.',
    view: 'story',
    art: 'born',
    lane: 'detour',
    scene: peel('git-born'),
    steps: [],
    drawer: {
      clicks: [
        'Follow the timeline on the card: Linux (1991), Git (2005), GitHub (2008).',
        'Remember that Git came out of a real, urgent problem. GitHub is only the website for sharing Git projects. The Git versus GitHub card explains the difference.',
      ],
      happening: 'The Linux kernel team had been using a proprietary (closed) tool called BitKeeper. The free arrangement ended after a dispute in April 2005, so Linus Torvalds wrote Git. Within days it was tracking its own development, and the first usable version for the kernel took about two weeks. GitHub, a website for hosting Git projects, launched in 2008.',
      links: [
        { label: 'Pro Git: A short history of Git', url: 'https://git-scm.com/book/en/v2/Getting-Started-A-Short-History-of-Git' },
      ],
    },
  },
  {
    id: 'recap',
    rail: 'Messy folder',
    section: 'story',
    kicker: 'Where we started',
    title: "You've all been here.",
    sentence: 'Which file is the real one? Who changed what? Nobody knows.',
    final: 'Now you know why Git exists and where it fits.',
    view: 'messy',
    lane: 'main',
    scene: { layers: ['recap'], front: 'recap', zoomed: false, leave: 'fly' },
    steps: [],
    drawer: {
      clicks: [
        'Compare this folder with the first card.',
        'Think about which of its problems Git solves: lost work, no history, no blame and no undo.',
      ],
      happening: 'You are back at the folder you began with. Git is the answer to it, and Git grew out of open source work like Linux. Next you will see how Git works on your own computer.',
      links: [
        { label: 'Pro Git book (free, official)', url: 'https://git-scm.com/book' },
      ],
    },
  },

  /* ---------- D. Dive into Git ---------- */
  {
    id: 'git-vs-github',
    rail: 'Git vs GitHub',
    section: 'git',
    kicker: 'Git and GitHub',
    title: 'Git is not GitHub',
    sentence: 'Git is the tool on your computer. GitHub is a website that stores Git projects online.',
    bullets: [
      'Git: the free and open source tool. Runs on your computer, works offline.',
      'GitHub: a company\u2019s website (owned by Microsoft) that hosts Git projects online.',
      'Like Google Drive for your code, except it understands Git history.',
      'Alternatives like GitLab, Bitbucket and Codeberg use the same Git: learn Git once, use any.',
    ],
    view: 'compare',
    lane: 'main',
    into: 'drop',
    steps: [],
    drawer: {
      clicks: [
        'Open a terminal.',
        'Run the command below. A version number means Git is installed on your computer, and you did not need a website for that.',
      ],
      commands: ['git --version'],
      mistakes: [
        { title: 'Thinking Git and GitHub are the same', fix: 'Git is the tool. GitHub is one website that hosts Git projects. You can use Git without GitHub.' },
        { title: 'Expecting GitHub to save your work automatically', fix: 'Nothing reaches GitHub until you push it.' },
        { title: 'Expecting Codespaces to be unlimited', fix: 'Codespaces needs a GitHub account and has a monthly free usage limit. Use it as a fallback if Git will not install, not for everything.' },
      ],
      happening: 'Git runs on your computer and keeps your history. GitHub is a website that keeps a copy of that history online, so people can share it and work together. GitHub adds extras such as pull requests (a way of proposing changes for review) and Codespaces (a full coding environment in your browser).',
      links: [
        { label: 'What is GitHub? (GitHub Docs)', url: 'https://docs.github.com/en/get-started/start-your-journey/what-is-github' },
        { label: 'Git: the official website', url: 'https://git-scm.com/' },
      ],
    },
  },
  {
    id: 'three-areas',
    rail: 'Three areas',
    section: 'git',
    kicker: 'The three areas',
    title: 'Where your work lives',
    sentence: 'Every file passes through three areas on its way into history.',
    bullets: [
      'Working folder: where you edit files.',
      'Staging area: what goes into the next snapshot.',
      'Repository: the saved history.',
    ],
    view: 'areas',
    strip: true,
    lane: 'main',
    steps: [
      { cmd: '', output: [], op: none, file: 'working', label: 'You create or edit a file' },
      { cmd: '', output: [], op: none, file: 'staging', label: 'git add puts it on the staging shelf' },
      { cmd: '', output: [], op: none, file: 'repo', label: 'git commit saves it into history' },
    ],
    drawer: {
      clicks: [
        'Open a terminal in a practice folder.',
        'echo "text" > file creates a file with that text. (>> adds a line to the end of the file instead.)',
        'Run the commands below one at a time and watch the file move from the working folder to the staging shelf to the repository.',
      ],
      commands: ['echo "hello git" > notes.txt', 'git status', 'git add notes.txt', 'git commit -m "add notes"'],
      mistakes: [
        { title: 'Forgetting git add', fix: 'A commit only contains what is staged. Run git status to see what is staged and what is not.' },
        { title: 'Thinking saving a file saves it in Git', fix: 'Saving in your editor only changes the working folder. Git needs add and commit.' },
      ],
      happening: 'You edit files in the working folder. git add copies your chosen changes onto the staging shelf. git commit packs everything on that shelf into one permanent snapshot in the repository.',
      links: [
        { label: 'Pro Git: What is Git? (the three states)', url: 'https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F' },
      ],
    },
  },
  {
    id: 'init',
    rail: 'git init',
    section: 'git',
    kicker: 'COMMAND \u00b7 INIT',
    title: 'Start a repository',
    sentence: 'git init turns a folder into a Git repository.',
    bullets: ['Creates a hidden .git folder.', 'Run it once per project.', 'Nothing is saved yet.'],
    tryIt: 'git init',
    view: 'terminal',
    lane: 'main',
    into: 'drop',
    steps: [
      { cmd: 'git init', output: ['Initialized empty Git repository in ~/your-first-repo/.git/'], op: { type: 'init' } },
      { cmd: 'ls -a', output: ['.  ..  .git'], op: none },
    ],
    os: {
      windows: {
        steps: [
          { cmd: 'git init', output: ['Initialized empty Git repository in ~/your-first-repo/.git/'], op: { type: 'init' } },
          {
            cmd: 'ls -Hidden',
            output: ['', '    Directory: C:\\Users\\you\\your-first-repo', '', 'Mode          LastWriteTime  Length Name', '----          -------------  ------ ----', 'd--h--   4/11/2026  10:00 AM         .git'],
            op: none,
            prompt: 'PS ~\\your-first-repo>',
          },
        ],
        note: 'Hidden files: ls -Hidden in Windows PowerShell. ls -a works in macOS, Linux and Git Bash.',
      },
      macos: { note: 'Hidden files: ls -a in macOS and Linux (and Git Bash on Windows). Windows PowerShell uses ls -Hidden.' },
      linux: { note: 'Hidden files: ls -a in macOS and Linux (and Git Bash on Windows). Windows PowerShell uses ls -Hidden.' },
    },
    drawer: {
      clicks: [
        'Open a terminal. On Windows this can be PowerShell (for example the terminal inside Visual Studio Code) or Git Bash.',
        'Make a new folder and move into it. mkdir name && cd name does both in one line.',
        'Run git init, then list the files including hidden ones. Windows PowerShell: ls -Hidden (or Get-ChildItem -Hidden). macOS, Linux and Git Bash: ls -a. You should see the hidden .git folder.',
      ],
      commands: [
        'mkdir {{repo}} && cd {{repo}}',
        'git init',
        { label: 'List hidden files', byOS: { windows: 'ls -Hidden', macos: 'ls -a', linux: 'ls -a' } },
      ],
      mistakes: [
        { title: 'Running git init in the wrong folder', fix: 'Run pwd first to see where you are. Move with cd.' },
        { title: 'Running it inside another repository', fix: 'Do not nest repositories. If git status already works, the folder is already a repository.' },
      ],
      happening: 'git init creates a hidden folder called .git. That folder is the repository: it holds the whole history. The files you can see are just the working folder.',
      links: [
        { label: 'Pro Git: Getting a Git repository', url: 'https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository' },
        { label: 'git init (official manual)', url: 'https://git-scm.com/docs/git-init' },
      ],
    },
  },
  {
    id: 'status',
    rail: 'git status',
    section: 'git',
    kicker: 'COMMAND \u00b7 STATUS',
    title: 'Ask what changed',
    sentence: 'git status shows what Git sees right now.',
    bullets: ['Untracked: Git does not know the file yet.', 'Staged: ready for the next snapshot.', 'Run it all the time. It is free.'],
    tryIt: 'git status',
    view: 'terminal',
    strip: true,
    lane: 'main',
    steps: [
      { cmd: 'echo "hello git" > notes.txt', output: [], op: none, file: 'working' },
      {
        cmd: 'git status',
        output: ['On branch main', 'No commits yet', 'Untracked files:', '        notes.txt'],
        op: none,
        file: 'working',
      },
    ],
    drawer: {
      clicks: [
        'Open a terminal in your practice repository (the folder where you ran git init).',
        'Create a file: echo "text" > file writes that text into a new file. (>> adds a line to the end instead.)',
        'Run git status and read what it says. Git tells you the next command to try.',
      ],
      commands: ['echo "hello git" > notes.txt', 'git status', 'git status -s'],
      mistakes: [
        { title: '"not a git repository"', fix: 'You are in the wrong folder, or you have not run git init yet.' },
        { title: 'Ignoring what status says', fix: 'Read it. Git tells you the next command to try.' },
      ],
      happening: 'git status compares three things: your working folder, the staging shelf and the last snapshot. It lists every difference. A file that Git has never seen is called untracked.',
      links: [
        { label: 'Pro Git: Recording changes to the repository', url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository' },
        { label: 'git status (official manual)', url: 'https://git-scm.com/docs/git-status' },
      ],
    },
  },
  {
    id: 'add',
    rail: 'git add',
    section: 'git',
    kicker: 'COMMAND \u00b7 ADD',
    title: 'Choose what to save',
    sentence: 'git add puts changes on the staging shelf.',
    bullets: ['Pick exactly the files you want.', 'git add . adds everything.', 'Nothing is saved until you commit.'],
    tryIt: 'git add notes.txt',
    view: 'terminal',
    strip: true,
    file0: 'working',
    lane: 'main',
    steps: [
      { cmd: 'git add notes.txt', output: [], op: none, file: 'staging' },
      {
        cmd: 'git status',
        output: ['On branch main', 'No commits yet', 'Changes to be committed:', '        new file:   notes.txt'],
        op: none,
        file: 'staging',
      },
    ],
    drawer: {
      clicks: [
        'Make sure you are in your practice repository and notes.txt exists.',
        'Run git add notes.txt, then git status. The file moves to "Changes to be committed".',
        'Try git add . later to stage everything at once, but check git status first.',
      ],
      commands: ['git add notes.txt', 'git status', 'git add .', 'git status'],
      mistakes: [
        { title: 'Adding secrets or huge files with git add .', fix: 'Check git status before you commit. Unstage a file with git restore --staged <file>.' },
        { title: 'Editing after git add', fix: 'Git staged the file as it was. Run git add again to stage the newer edits.' },
      ],
      happening: 'The staging shelf lets you build a snapshot on purpose. You can change ten files but only stage three of them, and the commit will contain exactly those three.',
      links: [
        { label: 'Pro Git: Recording changes to the repository', url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository' },
        { label: 'git add (official manual)', url: 'https://git-scm.com/docs/git-add' },
      ],
    },
  },
  {
    id: 'commit',
    rail: 'git commit',
    section: 'git',
    kicker: 'COMMAND \u00b7 COMMIT',
    title: 'Save a snapshot',
    sentence: 'A commit is a saved snapshot of your project, with a message.',
    bullets: ['One commit, one idea.', 'Say what changed, in a few words.', 'Each commit points at the one before.'],
    tryIt: 'git commit -m "add notes"',
    view: 'terminal',
    strip: true,
    file0: 'staging',
    lane: 'main',
    into: 'drop',
    steps: [
      { cmd: 'git commit -m "add notes"', output: ['[main 1a2b3c4] add notes'], op: { type: 'commit', branch: 'main', id: '1a2b3c4', msg: 'add notes' }, file: 'repo' },
      { cmd: 'echo "second line" >> notes.txt', output: [], op: none, file: 'working' },
      { cmd: 'git add notes.txt', output: [], op: none, file: 'staging' },
      { cmd: 'git commit -m "add second line"', output: ['[main 5d6e7f8] add second line'], op: { type: 'commit', branch: 'main', id: '5d6e7f8', msg: 'add second line' }, file: 'repo' },
    ],
    drawer: {
      clicks: [
        'Stage a file with git add notes.txt.',
        'Run the first commit command below. Always add -m and a short message.',
        'Add a second line with echo "text" >> file (a single > would replace the whole file), stage it with git add notes.txt, then commit again with git commit -m "add second line".',
      ],
      commands: ['git commit -m "add notes"', 'echo "second line" >> notes.txt', 'git add notes.txt', 'git commit -m "add second line"', 'git status'],
      mistakes: [
        { title: '"nothing to commit"', fix: 'The file was not saved in your editor, or you forgot git add. Run git status to see what Git sees.' },
        { title: 'Empty or vague messages', fix: 'Write what changed, in a few words: "add login page", not "stuff".' },
        { title: 'Vim opens when you forget -m', fix: 'Type :q! and press Enter to leave, then run the commit again with -m "message".' },
      ],
      happening: 'Git does not save every keystroke. You choose when to take a snapshot. git commit packs everything on the staging shelf into one permanent, labelled snapshot with a short id like 1a2b3c4. Each snapshot points back at the one before it, which is the chain you see in the graph.',
      links: [
        { label: 'Pro Git: Recording changes to the repository', url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository' },
        { label: 'git commit (official manual)', url: 'https://git-scm.com/docs/git-commit' },
      ],
    },
  },
  {
    id: 'log',
    rail: 'git log',
    section: 'git',
    kicker: 'COMMAND \u00b7 LOG',
    title: 'Read the history',
    sentence: 'git log lists every snapshot: who, when and why.',
    bullets: ['Newest first.', '--oneline keeps it short.', 'This answers the messy folder.'],
    tryIt: 'git log --oneline',
    view: 'terminal',
    lane: 'main',
    steps: [
      { cmd: 'git log --oneline', output: ['5d6e7f8 (HEAD -> main) add second line', '1a2b3c4 add notes'], op: none },

    ],
    drawer: {
      clicks: [
        'Run git log --oneline in your practice repository to see a short list, newest first.',
        'If the output fills the screen, press q to quit the viewer.',
        'Try the --graph and --all options to see every branch drawn as a graph.',
      ],
      commands: ['git log', 'git log --oneline', 'git log --oneline --graph --all'],
      mistakes: [
        { title: 'Stuck in the log view', fix: 'Press q to quit. Git shows long output in a pager.' },
        { title: 'Wondering where the history went', fix: 'git log only shows the branch you are on. Add --all to see every branch.' },
      ],
      happening: 'git log reads the chain of snapshots backwards from where you are. Each entry shows the author, the date and the message, so you can always answer: who changed this, when, and why?',
      links: [
        { label: 'Pro Git: Viewing the commit history', url: 'https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History' },
        { label: 'git log (official manual)', url: 'https://git-scm.com/docs/git-log' },
      ],
    },
  },
  {
    id: 'linux-repo',
    rail: 'Real history',
    section: 'git',
    kicker: 'At scale',
    title: 'This is what real history looks like.',
    sentence: 'The Linux repository, still getting commits decades later.',
    picture: {
      src: 'img/linux-repo.png',
      alt: 'Screenshot of the Linux kernel repository on GitHub, showing the latest commit and the total number of commits',
      caption: 'github.com/torvalds/linux',
    },
    view: 'fullshot',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Look at the screenshot and find the latest commit and the total number of commits.',
        'Open github.com/torvalds/linux in your browser and compare. The numbers keep growing.',
      ],
      happening: 'This is the same kind of history you just read with git log, only with a very long past. Every line is a snapshot with an author, a date and a message. The Linux repository still gets new commits decades later.',
      links: [
        { label: 'The Linux kernel repository on GitHub', url: 'https://github.com/torvalds/linux' },
        { label: 'Pro Git: Viewing the commit history', url: 'https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History' },
      ],
    },
  },
  {
    id: 'github',
    rail: 'GitHub',
    section: 'git',
    kicker: 'Going remote',
    title: 'Now we need GitHub.',
    sentence: 'So far everything lives on your laptop. GitHub is where a copy can live online.',
    bullets: [
      'A website that stores Git projects online.',
      'Gives you a backup and a link to share.',
      'Git works without it. GitHub is the online home.',
      'You need a free account (we create it in the workshop).',
    ],
    view: 'remote',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Notice that nothing so far needed a website or an account. Git works offline.',
        'Look at the grey arrow in the picture. The next card is the moment it lights up.',
      ],
      mistakes: [
        { title: 'Confusing Git with GitHub', fix: 'Git is the tool on your computer. GitHub is one website that hosts Git projects. Other websites do the same job.' },
        { title: 'Thinking Git stops working without internet or without GitHub', fix: 'Init, add, commit and log all work offline. You only need internet when you push or pull.' },
        { title: 'Creating the online repository with a README and getting a rejected first push', fix: 'Create it empty: no README, no licence, no gitignore. See the push card for the full fix.' },
        { title: 'Git will not install on your laptop', fix: 'Use GitHub Codespaces, a full coding environment in your browser. It needs a GitHub account and has a monthly free usage limit, so it is a fallback, not unlimited.' },
      ],
      happening: 'A remote is another copy of your repository that lives somewhere else, usually on a website. Your laptop keeps its own full history, and the remote is a second copy that you can share. Git connects the two when you give the remote a nickname (usually origin) and then push or pull. This goes one level deeper than the Git versus GitHub card: what a remote is, not just what GitHub is.',
      links: [
        { label: 'About remote repositories (GitHub Docs)', url: 'https://docs.github.com/en/get-started/git-basics/about-remote-repositories' },
        { label: 'Pro Git: Working with remotes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes' },
      ],
    },
  },
  {
    id: 'push',
    rail: 'git push',
    section: 'git',
    kicker: 'COMMAND \u00b7 PUSH',
    title: 'Send it to GitHub',
    sentence: 'Pushing uploads your commits to a copy that lives online.',
    bullets: ['origin is the usual name for that copy.', 'git branch -M main names your branch main, so the push sends the right branch.', 'First push: GitHub signs you in (done in setup). Passwords no longer work.'],
    note: 'Create the GitHub repository EMPTY: no README, no licence, no gitignore. Otherwise the first push is rejected.',
    tryIt: 'git push -u origin main',
    view: 'terminal',
    lane: 'main',
    into: 'launch',
    steps: [
      { cmd: 'git remote add origin https://github.com/you/your-first-repo.git', output: [], op: { type: 'addRemote' } },
      { cmd: 'git branch -M main', output: [], op: none },
      {
        cmd: 'git push -u origin main',
        output: [
          'To https://github.com/you/your-first-repo.git',
          ' * [new branch]      main -> main',
          "branch 'main' set up to track 'origin/main'.",
        ],
        op: { type: 'push', branch: 'main' },
      },
    ],
    drawer: {
      clicks: [
        'On github.com click New repository, name it, and leave README, licence and gitignore switched OFF. Click Create repository.',
        'In your practice repository, run the remote command below (it uses your details from U). This connects your folder to GitHub.',
        'Run git branch -M main. This names your current branch main, so the next command pushes the right branch.',
        'Run git push -u origin main. Sign in through the browser window if it asks.',
      ],
      commands: [
        'git remote add origin https://github.com/{{ghuser}}/{{repo}}.git',
        'git remote -v',
        'git branch -M main',
        'git push -u origin main',
      ],
      mistakes: [
        { title: '"rejected" on the first push', fix: 'The GitHub repository was not empty (it has a README, licence or gitignore file). Create a new, completely empty repository, or run git pull origin main --allow-unrelated-histories first.' },
        { title: '"Authentication failed"', fix: 'Passwords and usernames no longer work for Git over HTTPS (HyperText Transfer Protocol Secure). Sign in through the browser window, or use a personal access token (classic, repo scope, 30-day expiry).' },
        { title: '"src refspec main does not match any"', fix: 'You have not made a commit yet, or your branch has a different name. Run git branch to check.' },
      ],
      happening: 'Your computer and GitHub hold two separate copies of the same history. git remote add gives the online copy a nickname, origin. The first git push uploads your commits, sets up tracking, and triggers the login step: a browser sign-in, or a personal access token pasted in place of a password.',
      links: [
        { label: 'Pro Git: Working with remotes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes' },
        { label: 'Quickstart for repositories (GitHub Docs)', url: 'https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories' },
      ],
    },
  },
  /* ---------- E. Workshop: choose a system, set up the laptop, go back to the commands ---------- */
  ...workshopCards,

  /* ---------- Part 2: branching and merging ---------- */
  ...vijayCards,

  /* ---------- F. Keep going: where to practise next ---------- */
  {
    id: 'keep-going',
    rail: 'Keep going',
    section: 'next',
    kicker: 'What next',
    title: 'Keep your Git journey going.',
    sentence: "You've made your first commits. Here is where to practise next.",
    resources: RESOURCES,
    view: 'resources',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Pick one tile on the card that matches how you like to learn, and open it now.',
        'Reading: the Pro Git book. Games and visuals: Learn Git Branching. A real pull request: first-contributions. Watching: the freeCodeCamp video.',
      ],
      tryNext: [
        'Make a repository for a project of your own.',
        'Practise with first-contributions.',
        'Join a Mukti event.',
      ],
      mistakes: [
        { title: 'You are not sure where to start', fix: 'Start small: make a repository for something of your own and commit to it a few times. Then try first-contributions for a real pull request.' },
        { title: 'A command or screen looks different from what you remember', fix: 'Come back to the command cards on this site, or look it up in the Pro Git book. Everyone searches for Git commands sometimes.' },
      ],
      happening: 'You have installed Git, made commits, pushed to GitHub and seen branching and pull requests. Git becomes natural through practice, so this card collects free places to keep going. Every link opens in a new tab.',
      links: [
        { label: 'GitHub Docs', url: 'https://docs.github.com/en' },
        { label: 'Oh My Git! (a game that teaches Git)', url: 'https://ohmygit.org/' },
      ],
    },
  },
]

/* Catch data mistakes early: every stack layer must be a real card and the front must be last. */
cards.forEach((c) => {
  const s = c.scene
  if (!s) return
  if (s.layers[s.layers.length - 1] !== s.front || s.front !== c.id) throw new Error(`Bad scene on card ${c.id}`)
  s.layers.forEach((id) => { if (!cards.some((k) => k.id === id)) throw new Error(`Unknown layer ${id} on card ${c.id}`) })
})





