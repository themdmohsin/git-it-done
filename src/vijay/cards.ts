import type { Card } from '../engine/types'

const none = { type: 'none' } as const

/* Vijay's section: Branching and merging. Five cards, then a live VS Code demo (not a card).
   Every step uses op "none": the pictures are scripted in src/vijay/scenes.ts and never touch the shared repository state.
   All five cards share one Git-graph component (BranchGraph), so the graph is the one consistent
   visual thread across the whole section \u2014 text stays short, the graph carries the teaching. */

/* The demo project is separate from this presentation. These rows are copied from card 5's drawer. */
const DEMO_SETUP = [
  'mkdir branching-demo && cd branching-demo',
  'git init -b main',
  "printf '# My First Git Project\\n\\nThis is my project.\\n' > README.md",
  'git add README.md',
  'git commit -m "Initial commit"',
]

export const vijayCards: Card[] = [
  {
    id: 'why-branch',
    rail: 'Why branch?',
    section: 'part2',
    kicker: 'BRANCHING \u00b7 WHY',
    title: 'Why do we need branches?',
    sentence: 'Two reasons: keep main stable, and let people work at the same time.',
    bullets: [
      'Stability: main must stay the version that works. Half-finished code should not land there.',
      'Parallel work: Mohsin builds login, Vijay builds the dashboard \u2014 at the same time, without blocking each other.',
      'Each of them gets their own branch and develops independently.',
    ],
    final: 'What if everyone could work independently without disturbing the stable version?',
    view: 'vijay',
    visual: 'why',
    lane: 'branch',
    into: 'split',
    steps: [
      { cmd: '', output: [], op: none, label: 'main: the stable foundation' },
      { cmd: '', output: [], op: none, label: 'Mohsin starts feature-login' },
      { cmd: '', output: [], op: none, label: 'Vijay starts feature-dashboard' },
      { cmd: '', output: [], op: none, label: 'Both move forward \u2014 main untouched' },
    ],
    drawer: {
      clicks: [
        'Watch main in the graph. Once it reaches three commits, it never moves again on this card.',
        'Notice that feature-login and feature-dashboard both start from the exact same commit, which is highlighted.',
        'Imagine the app is live and someone pushes half a feature straight to main. That is the risk a branch removes.',
      ],
      happening: 'main is the version everyone trusts, so it has to stay stable, and more than one person has to be able to work on the project without stepping on each other. A branch solves both. It is a separate line of commits that starts from main but does not change main until you choose to merge it back.',
      links: [
        { label: 'Pro Git: Branches in a nutshell', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' },
      ],
    },
  },
  {
    id: 'branch-idea',
    rail: 'Branches',
    section: 'part2',
    kicker: 'BRANCHING \u00b7 THE IDEA',
    title: 'Separate your work. Keep main stable.',
    sentence: 'A branch is an independent line of development.',
    bullets: [
      'main stays the stable branch.',
      'Commits on a branch do not change main.',
      'A branch is a lightweight pointer to a commit \u2014 not a copy of the whole project.',
    ],
    note: 'Branches don\u2019t eliminate merge conflicts. Conflicts can still happen when changes are brought together.',
    final: 'One project. Multiple branches. Independent development.',
    view: 'vijay',
    visual: 'branches',
    lane: 'branch',
    steps: [
      { cmd: '', output: [], op: none, label: 'main has three commits' },
      { cmd: '', output: [], op: none, label: 'feature-login branches from main' },
      { cmd: '', output: [], op: none, label: 'feature-dashboard branches from main' },
      { cmd: '', output: [], op: none, label: 'Branches progress independently' },
    ],
    drawer: {
      clicks: [
        'Find the glowing commit in the graph. Both feature branches start from it.',
        'Remember the technical fact: a branch is a pointer to a commit, nothing more.',
        'Watch each branch grow on its own while main does not move.',
        'Run the commands below in any repository to list your branches and draw the graph.',
      ],
      commands: ['git branch', 'git log --oneline --graph --all'],
      mistakes: [
        { title: 'Expecting branches to remove merge conflicts', fix: 'They do not. If two branches change the same lines, Git can still ask you to sort it out when they are merged.' },
      ],
      happening: 'A branch is a movable label that points at a commit, not a copy of the repository. Creating one copies nothing, so it is instant and cheap. Commits you make while on a branch move only that branch’s label forward, so main stays exactly where it was until you merge.',
      links: [
        { label: 'Pro Git: Branches in a nutshell', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' },
        { label: 'git branch (official manual)', url: 'https://git-scm.com/docs/git-branch' },
      ],
    },
  },
  {
    id: 'branch-create',
    rail: 'Create & switch',
    section: 'part2',
    kicker: 'COMMAND \u00b7 BRANCH AND CHECKOUT',
    title: 'Create a branch. Switch to it. Start working.',
    sentence: 'Creating a branch and switching to it are two different actions.',
    bullets: [
      'git branch feature-login: creates the branch, you stay where you are.',
      'git checkout feature-login: switches to it \u2014 watch HEAD move.',
      'git checkout -b feature-login: creates it and switches in one go.',
    ],
    tryIt: 'git checkout -b feature-login',
    view: 'terminal',
    visual: 'create',
    lane: 'branch',
    steps: [
      { cmd: 'git branch feature-login', output: [], op: none, label: 'Create' },
      { cmd: 'git checkout feature-login', output: ["Switched to branch 'feature-login'"], op: none, label: 'Switch' },
      { cmd: '', output: [], op: none, fresh: true, label: 'Fresh start' },
      { cmd: 'git checkout -b feature-login', output: ["Switched to a new branch 'feature-login'"], op: none, label: 'Create and switch' },
    ],
    drawer: {
      clicks: [
        'Watch the HEAD tag, not the commit. The commit never changes in this card, only which pill HEAD sits beside.',
        'Step 3 is a fresh start on purpose. You cannot create a branch that already exists, so the card resets to main and shows the one-command version.',
        'Run git branch with no name to list your branches. The current one has a star.',
        'Newer Git also has git switch -c feature-login, which does the same as git checkout -b.',
      ],
      commands: ['git branch', 'git branch feature-login', 'git checkout feature-login', 'git checkout -b feature-login', 'git switch -c feature-login'],
      mistakes: [
        { title: '"fatal: a branch named \'feature-login\' already exists"', fix: 'You cannot create the same branch twice. Use git checkout feature-login to move onto the existing one.' },
        { title: 'Creating a branch but forgetting to switch', fix: 'git branch only creates it. Commits still land on the branch you are on. The prompt or git branch shows where you are.' },
        { title: 'Switching with unsaved changes', fix: 'Git carries uncommitted edits along, or refuses if they would be overwritten. Commit your work first to stay safe.' },
        { title: 'Typos in the branch name', fix: 'Run git branch to see the exact names.' },
      ],
      happening: 'git branch makes a new label, and HEAD does not move. git checkout moves HEAD onto a label. HEAD is Git’s way of remembering which branch you are standing on, and your next commit goes there. git checkout -b does both in one go, so it is the one used most.',
      links: [
        { label: 'Pro Git: Basic branching and merging', url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging' },
        { label: 'git branch (official manual)', url: 'https://git-scm.com/docs/git-branch' },
      ],
    },
  },
  {
    id: 'branch-commit',
    rail: 'Make a change',
    section: 'part2',
    kicker: 'COMMAND \u00b7 ADD & COMMIT',
    title: 'Make a change. Save it as a commit.',
    sentence: 'Edit a file on your branch, then stage and commit it.',
    bullets: [
      'echo "..." > notes.txt: creates a file in your working directory.',
      'git add notes.txt: stages it \u2014 ready, not yet saved.',
      'git commit: saves it as a commit on feature-login only.',
    ],
    note: 'main does not know this commit exists until it is merged.',
    final: 'Your feature branch now contains your changes. main remains unchanged.',
    view: 'terminal',
    visual: 'commit',
    lane: 'branch',
    steps: [
      { cmd: 'git checkout feature-login', output: ["Switched to branch 'feature-login'"], op: none, label: 'Switch' },
      { cmd: 'echo "Hello from feature branch!" > notes.txt', output: [], op: none, label: 'Create a file' },
      { cmd: 'git add notes.txt', output: [], op: none, label: 'Stage it' },
      { cmd: 'git commit -m "Add notes file"', output: ['[feature-login b7e4f91] Add notes file', ' 1 file changed, 1 insertion(+)', ' create mode 100644 notes.txt'], op: none, label: 'Commit' },
    ],
    drawer: {
      clicks: [
        'Remember the three states and the three commands: working directory (echo), then staged (add), then committed (commit).',
        'The dashed "staged" node in the graph is not a real commit yet, because it has no hash. Only git commit creates one.',
        'After the commit, look at main’s pill. It is still on the old commit, one step behind.',
        'Run the commands below in a practice repository to try it yourself.',
      ],
      commands: ['git checkout feature-login', 'echo "Hello from feature branch!" > notes.txt', 'git add notes.txt', 'git commit -m "Add notes file"', 'git log --oneline'],
      mistakes: [
        { title: '"nothing to commit, working tree clean"', fix: 'The file was never staged. Run git add notes.txt first, or check git status.' },
        { title: 'Committing on the wrong branch', fix: 'Run git branch to confirm the star is on feature-login before you commit.' },
        { title: 'Forgetting -m and a message', fix: 'git commit without -m opens an editor for the message. -m "..." skips that.' },
      ],
      happening: 'echo redirects text into a new file, and Git does not know about it yet. git add moves it into the staging area, a holding pen for what the next commit will contain. git commit takes everything staged and saves it as a new commit, moving the current branch’s pointer forward. main’s pointer never moves, because you are not on main.',
      links: [
        { label: 'Pro Git: Basic branching and merging', url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging' },
        { label: 'git commit (official manual)', url: 'https://git-scm.com/docs/git-commit' },
      ],
    },
  },
  {
    id: 'branch-merge',
    rail: 'Merge',
    section: 'part2',
    kicker: 'COMMAND \u00b7 MERGE',
    title: 'Feature complete? Bring it back into main.',
    sentence: 'Switch to the branch that should receive the work, then merge.',
    bullets: [
      'git checkout main: switch to the branch that receives the work.',
      'git merge feature-login: merges feature-login INTO the branch you are on.',
      'feature-login still exists afterwards \u2014 merging never deletes it.',
    ],
    note: 'main had not moved since feature-login branched off, so Git could fast-forward. If both had moved, Git would make a merge commit instead.',
    view: 'terminal',
    visual: 'merge',
    lane: 'main',
    into: 'converge',
    steps: [
      { cmd: 'git checkout main', output: ["Switched to branch 'main'"], op: none, label: 'Switch to main' },
      {
        cmd: 'git merge feature-login',
        output: ['Updating c3d4e5f..b7e4f91', 'Fast-forward', ' notes.txt | 1 +', ' 1 file changed, 1 insertion(+)'],
        op: none, label: 'Merge feature-login into main',
      },
      { cmd: 'ls', output: ['README.md', 'notes.txt'], op: none, label: 'Verify: the file is here' },
      { cmd: 'cat notes.txt', output: ['Hello from feature branch!'], op: none, label: 'Verify: the content is here' },
      { cmd: 'git log --oneline', output: ['b7e4f91 (HEAD -> main, feature-login) Add notes file', 'c3d4e5f Initial commit'], op: none, label: 'Verify: both branches, same commit' },
    ],
    drawer: {
      clicks: [
        'Make a small practice folder with its own commit: run the first five commands below. The default branch name must be main, which is why the second command uses git init -b main.',
        'Create the branch and make a commit on it: run the next four commands.',
        'Run git checkout main. The new file is gone from your folder, because it only exists on feature-login so far.',
        'Run git merge feature-login. Read it as: merge feature-login into the branch you are on. That is why you switch to main first.',
        'Run ls and cat notes.txt. The file is back, now on main.',
        'Run git log --oneline. It shows HEAD -> main and feature-login on the same line: two names, one commit.',
      ],
      commands: [
        ...DEMO_SETUP,
        'git checkout -b feature-login',
        'echo "Hello from feature branch!" > notes.txt',
        'git add notes.txt',
        'git commit -m "Add notes file"',
        'git checkout main',
        'git merge feature-login',
        'ls',
        'cat notes.txt',
        'git log --oneline',
      ],
      mistakes: [
        { title: 'Merging while on the wrong branch', fix: 'git merge always merges INTO the branch you are on. Run git branch first and check the star is on main.' },
        { title: 'Typing git merge main instead of the feature name', fix: 'The name after merge is the branch you want to bring in: git merge feature-login.' },
        { title: 'Expecting the branch to disappear', fix: 'Merging does not delete anything. git log --oneline still shows feature-login pointing at the same commit. When you are finished with it, git branch -d feature-login removes the label (optional).' },
        { title: '"CONFLICT" message', fix: 'Both branches changed the same lines. Git stops and asks you to choose. This workshop does not cover conflicts.' },
        { title: 'Your commit hashes look different from the card', fix: 'Hashes such as b7e4f91 are unique to every commit. Yours will differ, and that is normal.' },
        { title: 'Git made a merge commit instead of a fast-forward', fix: 'main received new commits after you branched, so Git had to combine the two lines. Start the practice folder again with a clean main to match this card.' },
      ],
      happening: 'Checking out main only moves you there, and nothing is merged yet. git merge feature-login then brings the feature’s commits into main. Because main had no new commits of its own, Git simply moves main’s pointer forward to the feature commit, which is called a fast-forward, and creates no new commit. ls, cat and git log then prove that the file really is on main and that feature-login still exists.',
      links: [
        { label: 'Pro Git: Basic branching and merging', url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging' },
        { label: 'git merge (official manual)', url: 'https://git-scm.com/docs/git-merge' },
        { label: 'Learn Git Branching (visual, in the browser)', url: 'https://learngitbranching.js.org/' },
      ],
    },
  },

  /* ---------- Bridge into Open Source Contribution. Mohsin and the branching cards already covered
     open source and Git/GitHub basics, so this stays short: one slide, then a handoff to the written
     guide at #/learn (src/contrib/), where most of the live GitHub/VS Code demo and the MUKTI
     challenge instructions live. ---------- */
  {
    id: 'oss-intro',
    rail: 'Open source contribution',
    section: 'part2',
    kicker: 'OPEN SOURCE \u00b7 A QUICK INTRODUCTION',
    title: 'Great software is built by people working together.',
    sentence: 'Open-source projects publish their source code under a licence that lets anyone inspect, use, modify and share it.',
    bullets: [
      'You already use it every day: Linux, Firefox, VS Code.',
      'How many of you have used an open-source project? (Probably all of you.)',
      'But have you ever thought about contributing to one?',
    ],
    view: 'story',
    art: 'collab',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Open a real project on GitHub, for example github.com/microsoft/vscode, and read some of its source code.',
        'Look for the Issues and Pull requests tabs. That is where the community works.',
        'Ask yourself: have you ever thought about contributing to one of the projects you use?',
      ],
      happening: 'Open source projects publish their source code under a licence that lets anyone inspect, use, modify and share it. You already use projects like this every day, such as Linux, Firefox and Visual Studio Code. The second half of this workshop is about contributing to one yourself.',
      links: [
        { label: 'How to contribute to open source (Open Source Guides)', url: 'https://opensource.guide/how-to-contribute/' },
        { label: 'Finding ways to contribute (GitHub Docs)', url: 'https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github' },
      ],
    },
  },
  {
    id: 'oss-issues',
    rail: 'Finding an issue',
    section: 'part2',
    kicker: 'FINDING WORK \u00b7 GITHUB ISSUES',
    title: 'Find something to fix',
    sentence: 'Projects track bugs, improvements and feature requests as GitHub Issues. Issues are how you find something to contribute.',
    bullets: [
      'Labels like good first issue, help wanted, bug and enhancement sort the work.',
      'A good first issue label is a hint, not a guarantee it\u2019s easy. Read the full description.',
      'Check the comments: is anyone already working on it?',
    ],
    view: 'story',
    art: 'issueLabels',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Open the Issues tab of a project, for example github.com/firstcontributions/first-contributions/issues.',
        'Look at the labels and the Assignees panel on the side of an issue.',
        'Read one issue completely, including the comments, and decide whether you could work on it.',
      ],
      mistakes: [
        { title: 'Starting on an issue someone else is already assigned to', fix: 'Check the Assignees panel and the comments first, and ask before you begin.' },
        { title: 'Assuming a "good first issue" label means it is easy', fix: 'The label is a hint, not a guarantee. Read the full description.' },
      ],
      happening: 'An issue is a trackable unit of work: a bug, an improvement or a feature request, with a description and a comment thread underneath. Labels help contributors filter what to look at. Reading the full issue and its comments before starting saves everyone time.',
      links: [
        { label: 'About issues (GitHub Docs)', url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues' },
        { label: 'Finding ways to contribute (GitHub Docs)', url: 'https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github' },
      ],
    },
  },
  {
    id: 'oss-pull-requests',
    rail: 'Pull requests',
    section: 'part2',
    kicker: 'PROPOSING CHANGES \u00b7 PULL REQUESTS',
    title: 'You can\u2019t push directly. So you propose instead.',
    sentence: 'A pull request asks a maintainer to review and merge changes from your copy into theirs.',
    bullets: [
      'Base repository: where the change would land. Head repository: where it comes from.',
      'A pull request shows a full diff: every line added and removed.',
      'Opening a pull request does not mean it\u2019s accepted \u2014 a maintainer still decides.',
    ],
    view: 'story',
    art: 'prFlow',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Open any pull request on GitHub and find its title, description, commits and Files changed tab.',
        'Find the base and the head. The base is the destination (usually the original main) and the head is the source (usually your fork).',
      ],
      mistakes: [
        { title: 'Thinking that opening a pull request means it is accepted', fix: 'A maintainer still has to review it. Submitting is not the same as being merged.' },
      ],
      happening: 'You rarely have write access to someone else’s repository. A pull request lets you propose changes anyway: you make them in your own copy, then ask a maintainer to review and merge. Submitted and merged are two different events.',
      links: [
        { label: 'About pull requests (GitHub Docs)', url: 'https://docs.github.com/en/pull-requests/reference/pull-requests' },
        { label: 'Creating a pull request from a fork (GitHub Docs)', url: 'https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork' },
      ],
    },
  },
  {
    id: 'oss-first-contrib',
    rail: 'Your first contribution',
    section: 'part2',
    kicker: 'YOUR FIRST CONTRIBUTION',
    title: 'Let\u2019s contribute to MUKTI!',
    sentence: 'One small, real change: forked, edited, committed, pushed, and opened as a pull request.',
    links: [
      { label: 'MUKTI challenge repo', url: '' },
      { label: 'Demo issue', url: '' },
    ],
    view: 'story',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Read the next four cards in order: fork, clone, edit and push, create a pull request.',
        'Keep the Mukti challenge repository and the demonstration issue handy. The links on this card are added once they are confirmed.',
      ],
      happening: 'This card introduces your first real contribution: one small change that you fork, edit, commit, push and open as a pull request. The next cards walk through each step in order, and the written guide has every command and screenshot.',
      links: [
        { label: 'first-contributions: practise your first pull request', url: 'https://github.com/firstcontributions/first-contributions' },
        { label: 'Mukti on GitHub', url: 'https://github.com/MuktiCommunity' },
      ],
    },
  },
  {
    id: 'oss-fork',
    rail: 'Step 1: Fork',
    section: 'part2',
    kicker: 'STEP 1 \u00b7 FORK',
    title: 'Make your own copy',
    sentence: 'Forking creates a full copy of the repository under your own GitHub account. You own it completely.',
    bullets: [
      'The original repository belongs to the project.',
      'Your fork is a separate copy you can freely change.',
      'Nothing you do to your fork touches the original \u2014 until you open a pull request.',
    ],
    view: 'story',
    art: 'forkFlow',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Open the repository page on GitHub.',
        'Click Fork at the top right and choose your own account as the owner.',
        'Open the result. Its address is github.com/<your-username>/<repo>, with the "forked from" label under the name.',
      ],
      happening: 'Forking creates a full copy of a repository under your own GitHub account, and you own that copy completely. Nothing you do to your fork touches the original until you open a pull request. GitHub marks the copy with a small "forked from" label pointing back at the original.',
      links: [
        { label: 'Fork a repository (GitHub Docs)', url: 'https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo' },
      ],
    },
  },
  {
    id: 'oss-clone',
    rail: 'Step 2: Clone',
    section: 'part2',
    kicker: 'STEP 2 \u00b7 CLONE',
    title: 'Bring it onto your computer',
    sentence: 'Cloning downloads your fork, with its full history, onto your own machine.',
    bullets: [
      'Always clone your fork, never the original repository.',
      'origin is the nickname Git gives this copy.',
      'code . opens the folder in VS Code (File > Open Folder works too).',
    ],
    tryIt: 'git clone <your-fork-url>',
    view: 'terminal',
    lane: 'main',
    noGraph: 'A separate practice repository \u2014 unrelated to the history shown earlier',
    steps: [
      { cmd: 'git clone https://github.com/you/mukti-challenge.git', output: ["Cloning into 'mukti-challenge'...", 'remote: Enumerating objects: 42, done.', 'Receiving objects: 100% (42/42), done.'], op: none },
      { cmd: 'cd mukti-challenge', output: [], op: none },
      { cmd: 'code .', output: [], op: none },
    ],
    drawer: {
      clicks: [
        'On your own fork’s page, click the green Code button and copy the HTTPS (HyperText Transfer Protocol Secure) address.',
        'In a terminal, run git clone with that address, then cd into the new folder.',
        'Run code . to open the folder in Visual Studio Code.',
      ],
      commands: ['git clone <your-fork-url>', 'cd <repository-name>', 'code .'],
      mistakes: [
        { title: 'Cloning the original repository by mistake', fix: 'Re-copy the URL from your fork\u2019s own Code button, not the original project\u2019s page.' },
        { title: '"code" not found', fix: 'Open VS Code normally and use File > Open Folder, or install the command-line launcher from VS Code\u2019s Command Palette.' },
      ],
      happening: 'Cloning downloads the repository’s full history, not just the latest files, and remembers where it came from under the nickname origin. code . opens the current folder directly in Visual Studio Code.',
      links: [
        { label: 'Cloning a repository (GitHub Docs)', url: 'https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository' },
        { label: 'git clone (official manual)', url: 'https://git-scm.com/docs/git-clone' },
      ],
    },
  },
  {
    id: 'oss-commit-push',
    rail: 'Edit, commit, push',
    section: 'part2',
    kicker: 'STEP 3 \u00b7 EDIT, COMMIT & PUSH',
    title: 'Make the change. Save it. Send it up.',
    sentence: 'Edit the assigned file in VS Code, then stage, commit and push \u2014 all on main, on your own fork.',
    note: 'Working on main of your fork is not the same as pushing to the original MUKTI repository. It\u2019s still your own copy.',
    tryIt: 'git push origin main',
    view: 'terminal',
    lane: 'main',
    noGraph: 'A separate practice repository \u2014 unrelated to the history shown earlier',
    steps: [
      { cmd: 'git add .', output: [], op: none },
      { cmd: 'git commit -m "Complete assigned contribution"', output: ['[main 9f1a2b3] Complete assigned contribution'], op: none },
      { cmd: 'git push origin main', output: ['To https://github.com/you/mukti-challenge.git', '   7c3d9e1..9f1a2b3  main -> main'], op: none },
    ],
    drawer: {
      clicks: [
        'Edit the assigned file in Visual Studio Code and save it.',
        'Run the three commands below, one at a time.',
        'In real projects, stage specific files instead of git add . so that you never commit something unrelated by accident.',
        'Refresh your fork’s page on GitHub and open the changed file to confirm that your change arrived.',
      ],
      commands: ['git add .', 'git commit -m "Complete assigned contribution"', 'git push origin main'],
      mistakes: [
        { title: '"nothing to commit"', fix: 'The file wasn\u2019t saved, or you forgot git add. Run git status to check.' },
        { title: 'Push rejected', fix: 'Run git pull origin main first, then push again.' },
      ],
      happening: 'git add stages your changes. git commit saves them as a labelled snapshot. git push origin main uploads that snapshot to your fork on GitHub, where origin is your fork’s nickname and main is the branch. Working on main of your fork is not the same as pushing to the original project, because it is still your own copy.',
      links: [
        { label: 'Pro Git: Recording changes to the repository', url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository' },
        { label: 'Pro Git: Working with remotes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes' },
      ],
    },
  },
  {
    id: 'oss-create-pr',
    rail: 'Step 4: Create PR',
    section: 'part2',
    kicker: 'STEP 4 \u00b7 CREATE A PULL REQUEST',
    title: 'Propose your change to the original repository',
    sentence: 'Open a pull request from your fork back to the original MUKTI repository.',
    bullets: [
      'Base repository: the original MUKTI repository, branch main.',
      'Head repository: your fork, branch main.',
      'Check Files changed before you submit \u2014 only your intended file should be listed.',
    ],
    view: 'story',
    art: 'prDirection',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'On your fork’s page, click Compare & pull request.',
        'Check the base (the original repository, branch main) and the head (your fork, branch main).',
        'Open the Files changed tab. Only the file you meant to change should be listed.',
        'Write a clear title and description, then click Create pull request.',
      ],
      mistakes: [
        { title: 'Writing "Closes #123" and expecting the issue to close', fix: 'It only closes automatically if that issue lives in the base repository.' },
        { title: 'Expecting the pull request to be merged straight away', fix: 'Submitting is not the same as being merged. A maintainer still has to review it.' },
      ],
      happening: 'On your fork, GitHub offers "Compare & pull request" after a recent push. Set the base repository to the original project and the head repository to your fork, both on main. Then write a clear title and description and submit.',
      links: [
        { label: 'Creating a pull request from a fork (GitHub Docs)', url: 'https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork' },
      ],
    },
  },
  {
    id: 'oss-workflow',
    rail: 'Complete workflow',
    section: 'part2',
    kicker: 'QUICK REFERENCE',
    title: 'The whole process, in eight steps',
    sentence: 'Find an issue, fork it, clone it, make changes, commit, push, open a pull request, review and merge.',
    view: 'story',
    art: 'workflowSteps',
    lane: 'main',
    steps: [],
    drawer: {
      clicks: [
        'Walk through the eight steps and name the command or button for each one.',
        'Pick the step you feel least sure about, and read its card again with the Details drawer open.',
      ],
      happening: 'This is the whole process as one picture: find an issue, fork it, clone it, make changes, commit, push, open a pull request, then review and merge. Keep it in mind as a checklist while you work on the challenge.',
      links: [
        { label: 'How to contribute to open source (Open Source Guides)', url: 'https://opensource.guide/how-to-contribute/' },
        { label: 'first-contributions: practise your first pull request', url: 'https://github.com/firstcontributions/first-contributions' },
      ],
    },
  },
  {
    id: 'oss-challenge',
    rail: 'MUKTI challenge',
    section: 'part2',
    kicker: 'YOUR TURN',
    title: 'MUKTI Challenge: make it yours',
    sentence: 'Now it\u2019s your turn. Fork, make your assigned change, and open a pull request.',
    bullets: [
      'Start here \u2192 Find your task \u2192 Complete it \u2192 Submit your PR \u2192 Verify it \u2192 Troubleshoot.',
      'A submitted pull request is a successful contribution, even before it\u2019s merged.',
      'The full written guide below has every step, with commands and screenshots, so you can go at your own pace.',
    ],
    view: 'story',
    art: 'challengeSteps',
    lane: 'main',
    cta: { label: 'Open the Contribution Guide', href: '#/learn' },
    steps: [],
    drawer: {
      clicks: [
        'Click Open the Contribution Guide on the card.',
        'Follow the six steps in order: start here, find your task, complete it, submit your pull request, verify it, troubleshoot.',
        'If you are stuck, ask a volunteer. Do not spend the whole workshop on one blocker.',
      ],
      mistakes: [
        { title: 'Spending the whole session stuck on one problem', fix: 'Ask a volunteer early. The troubleshooting step of the guide also covers the common problems.' },
      ],
      happening: 'This is the hands-on challenge. You work at your own pace, following the full written guide for detailed steps, commands, screenshots and troubleshooting. A submitted pull request counts as a successful contribution, even before it is merged.',
      links: [
        { label: 'Mukti on GitHub', url: 'https://github.com/MuktiCommunity' },
        { label: 'first-contributions: practise your first pull request', url: 'https://github.com/firstcontributions/first-contributions' },
      ],
    },
  },
]
