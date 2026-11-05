import type { OS } from './engine/types'

/*
 * The five installation steps, written for people who have never used a terminal.
 * Text supports a little markup (see Rich in components/Install.tsx):
 *   **bold**   `code`   [[Key]]   [label](https://link)   and a bare "github.com" turns into a link on its own.
 * Videos for each step are configured in installVideos.ts.
 */

export interface Instruction {
  text: string
  /** Sub-points shown under the instruction (for example the tick boxes in an installer). */
  sub?: string[]
  /** Commands to copy. */
  cmds?: string[]
  /** One short plain-language sentence: what this action does. */
  why?: string
}

export interface Verify { text: string; cmds?: string[]; expect: string }
export interface Section { title: string; intro?: string; steps: Instruction[]; verify?: Verify; warnings?: string[] }
export interface OSGuide { title?: string; intro?: string; steps: Instruction[]; verify?: Verify; warnings?: string[] }

export interface InstallStep {
  /** Same as the card id, so the address is #/<id>. */
  id: string
  short: string
  title: string
  official: { label: string; url: string }
  why: string
  /** "Check first" box shown above the instructions. */
  before?: Verify & { title: string }
  /** Instructions that differ per operating system. Omit when every system is the same (then use `all`). */
  os?: Record<OS, OSGuide>
  /** Instructions that are the same on every system. */
  all?: OSGuide
  /** More sections, in order, after the system-specific part (same on every system). */
  more?: Section[]
  /** Collapsed, clearly optional section. */
  fallback?: { title: string; intro: string; steps: Instruction[]; warnings: string[] }
  /** Warnings shown for every system. */
  warnings?: string[]
  /** Offer the "Your details" window (identity step). */
  detailsButton?: boolean
}

const TERMINAL_KEYS = 'Press [[Ctrl]] + [[`]] (Windows and Linux) or [[Cmd]] + [[`]] (macOS). The [[`]] key is the backtick, just above [[Tab]].'

const PASSWORD_NOTE = 'When the terminal asks for your password, type it and press Enter. **Nothing appears while you type** (no dots, no stars). That is normal and it is a safety feature.'

export const INSTALL_STEPS: InstallStep[] = [
  /* ---------------- 1. Visual Studio Code ---------------- */
  {
    id: 'vscode',
    short: 'VS Code',
    title: 'Install Visual Studio Code',
    official: { label: 'code.visualstudio.com', url: 'https://code.visualstudio.com/' },
    why: 'Visual Studio Code (VS Code) is a free program for writing and organising files. It also has a terminal built in, so your files and your commands live in one window.',
    os: {
      windows: {
        steps: [
          { text: 'Open the official website: [code.visualstudio.com](https://code.visualstudio.com/).' },
          { text: 'Click **Download for Windows**.' },
          { text: 'Wait for the **installer** (a small program that sets up another program) to download. It is a file ending in `.exe`.' },
          { text: 'Open the downloaded `.exe` file. It is usually in your **Downloads** folder.' },
          { text: 'If Windows asks for permission, click **Yes**.' },
          { text: 'Accept the licence agreement and click **Next**.' },
          { text: 'Keep clicking **Next** through the installation screens until you reach **Select Additional Tasks**.' },
          {
            text: 'On **Select Additional Tasks**, tick all four boxes:',
            sub: [
              'Add "Open with Code" to the file context menu',
              'Add "Open with Code" to the directory context menu',
              'Register Code as an editor for supported file types',
              '**Add to PATH**',
            ],
            why: 'Add to PATH lets you type code in a terminal to open VS Code. PATH is the list of places your computer looks for programs.',
          },
          { text: 'Click **Install** and wait for it to finish.' },
          { text: 'Launch Visual Studio Code.' },
        ],
        verify: {
          text: 'Open the terminal inside VS Code (see below) and run:',
          cmds: ['code --version'],
          expect: 'A version number such as `1.95.0` appears. If Windows says `code` is not recognised, run the installer again and make sure **Add to PATH** is ticked.',
        },
      },
      macos: {
        steps: [
          { text: 'Open [code.visualstudio.com](https://code.visualstudio.com/).' },
          { text: 'Click **Download for macOS**. If you are offered a list of builds, select the **Universal** build (it works on every Mac).' },
          { text: 'Download the **ZIP** file.' },
          { text: 'Open the downloaded ZIP by double-clicking it. This unpacks the **Visual Studio Code** app.' },
          { text: 'Drag **Visual Studio Code** into the **Applications** folder.' },
          { text: 'Open VS Code from **Applications**.' },
          { text: 'If macOS shows a security confirmation (it is an app from the internet), click **Open**.' },
          {
            text: 'Optional but recommended: let the terminal open VS Code. In VS Code press [[Cmd]] + [[Shift]] + [[P]], type `shell command` and choose **Shell Command: Install \'code\' command in PATH**.',
            why: 'Step 5 of the setup uses the code command, and it only works after this.',
          },
        ],
        verify: {
          text: 'Open the terminal inside VS Code (see below) and run:',
          cmds: ['code --version'],
          expect: 'A version number such as `1.95.0` appears. If you see `command not found: code`, do the optional last step above and open VS Code again.',
        },
      },
      linux: {
        steps: [
          { text: 'Open the official website: [code.visualstudio.com](https://code.visualstudio.com/).' },
          { text: 'Download the right package for your Linux distribution (Ubuntu, Debian, Fedora and so on).' },
          { text: 'For **Ubuntu or Debian**, download the **`.deb`** package. (On Fedora, download the `.rpm` instead.)' },
          { text: 'Open a terminal in the folder where the file was downloaded. Usually that is Downloads:', cmds: ['cd ~/Downloads'], why: 'cd means "change directory": it moves the terminal into that folder.' },
          { text: 'Install it:', cmds: ['sudo apt install ./code_*.deb'], why: 'sudo runs the command as administrator and asks for your password. apt is the built-in installer on Ubuntu and Debian.' },
          { text: PASSWORD_NOTE },
          { text: 'Launch VS Code from your applications menu, or type `code` in the terminal.' },
        ],
        verify: {
          text: 'Open the terminal inside VS Code (see below) and run:',
          cmds: ['code --version'],
          expect: 'A version number such as `1.95.0` appears.',
        },
      },
    },
    more: [
      {
        title: 'Open the terminal inside VS Code',
        steps: [
          { text: TERMINAL_KEYS },
          { text: 'Or use the menu: **Terminal → New Terminal**.' },
          { text: 'A panel opens at the bottom of the window with a blinking cursor. Commands you type here run on your laptop.' },
        ],
      },
    ],
    warnings: [
      'If you install Git **after** opening VS Code, fully close VS Code (every window) and open it again. VS Code only looks for Git when it starts.',
    ],
  },

  /* ---------------- 2. Git ---------------- */
  {
    id: 'git-install',
    short: 'Git',
    title: 'Install Git',
    official: { label: 'git-scm.com', url: 'https://git-scm.com/' },
    why: 'Git is the free program that records the history of your project on your laptop. Everything in this workshop is built on it.',
    before: {
      title: 'First, check if Git is already installed',
      text: 'Open the terminal in VS Code and run:',
      cmds: ['git --version'],
      expect: 'If you see a version such as `git version 2.45.0`, Git is already installed and you can go to the next step. If you see "command not found" or "not recognized", install it below.',
    },
    os: {
      windows: {
        steps: [
          { text: 'Open [git-scm.com](https://git-scm.com/).' },
          { text: 'Click **Download for Windows**.' },
          { text: 'Download the **64-bit** installer.' },
          { text: 'Open the downloaded `.exe` file.' },
          { text: 'Accept the default options (keep clicking **Next**) except for the two screens below.' },
          { text: 'When asked to **choose the default editor**, select **Visual Studio Code**.', why: 'Git sometimes opens an editor for you. The default one (Vim) confuses beginners.' },
          {
            text: 'When asked about the **initial branch name**, choose **Override the default branch name for new repositories** and type `main`.',
            why: 'A branch is a line of work. GitHub calls the main one main, so we do the same.',
          },
          { text: 'Finish the installation (**Install**, then **Finish**).' },
          { text: '**Close and reopen the terminal and VS Code.** Quit VS Code completely, then open it again.', why: 'Programs only notice newly installed tools when they start.' },
          { text: 'Check that it worked:', cmds: ['git --version'] },
        ],
        verify: { text: 'You should see:', expect: 'A version number such as `git version 2.45.0.windows.1`.' },
      },
      macos: {
        steps: [
          { text: 'Open [brew.sh](https://brew.sh/). **Homebrew** is a tool that installs other tools on a Mac, and we use it to install Git.' },
          { text: 'Follow the official Homebrew installation instructions on that page.' },
          { text: 'Open **Terminal** (press [[Cmd]] + [[Space]], type `Terminal`, press Enter).' },
          {
            text: 'Copy the installation command shown on [brew.sh](https://brew.sh/), paste it into Terminal and press Enter. Always use the one on the website. At the time of writing it is:',
            cmds: ['/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'],
          },
          { text: 'If it asks for your Mac login password, type it and press Enter. **Nothing appears while you type** (no dots, no stars). That is normal.' },
          { text: 'When it finishes, read the **Next steps** it prints and follow them carefully. You usually copy and run two or three lines.', why: 'Those lines tell your Mac where Homebrew lives.' },
          { text: '**Close Terminal and open it again.**' },
          { text: 'Check Homebrew:', cmds: ['brew --version'] },
          { text: 'Install Git:', cmds: ['brew install git'] },
          { text: 'Check Git:', cmds: ['git --version'] },
        ],
        verify: { text: 'You should see:', expect: '`Homebrew 4.x.x` after the first check and `git version 2.x.x` after the last one.' },
      },
      linux: {
        steps: [
          { text: 'Open a terminal ([[Ctrl]] + [[Alt]] + [[T]], or the one inside VS Code).' },
          { text: 'Run:', cmds: ['sudo apt update && sudo apt install git'], why: 'The first part refreshes the list of programs. The second part installs Git.' },
          { text: PASSWORD_NOTE },
          { text: 'Check that it worked:', cmds: ['git --version'] },
        ],
        verify: { text: 'You should see:', expect: 'A version number such as `git version 2.34.1`.' },
      },
    },
    warnings: ['If `git --version` says "not found" right after installing, close every terminal and VS Code, open them again and retry. Still stuck? Restart the laptop.'],
  },

  /* ---------------- 3. GitHub account ---------------- */
  {
    id: 'github-account',
    short: 'GitHub account',
    title: 'Create a GitHub account',
    official: { label: 'github.com', url: 'https://github.com/' },
    why: 'GitHub is a website that stores your Git projects online. You need a free account. It is the same on every operating system.',
    all: {
      steps: [
        { text: 'Open [github.com](https://github.com/).' },
        { text: 'Click **Sign up**.' },
        { text: 'Enter your **email address**.' },
        { text: 'Create a **password**.' },
        { text: 'Choose a **username**.', why: 'Your username becomes part of the web address of every project you make (github.com/your-username/project). Choose something you would be happy to put on a CV.' },
        { text: 'Complete the **verification** puzzle.' },
        { text: 'Check your email inbox for the **verification code** from GitHub. It can take a minute, so also look in spam.' },
        { text: 'Enter the code on the GitHub page.' },
        { text: 'Select the **Free** plan.' },
      ],
      verify: { text: 'To check:', expect: 'You are on your GitHub home page, signed in, with your profile picture in the top-right corner.' },
    },
    warnings: [
      'Sign up **before** the event if you can. Many sign-ups from one Wi-Fi network sometimes get flagged. A phone hotspot helps.',
      'If GitHub asks you to set up two-factor authentication (2FA), follow its steps and save the recovery codes. The next steps need an unrestricted account.',
    ],
  },

  /* ---------------- 4. GitHub CLI + log in ---------------- */
  {
    id: 'gh-install',
    short: 'GitHub CLI',
    title: 'Install GitHub CLI and log in',
    official: { label: 'cli.github.com', url: 'https://cli.github.com/' },
    why: 'GitHub CLI (command line interface) is a small tool called gh. It lets Git prove to [github.com](https://github.com/) that you are you, through your browser, so you never type your password into the terminal.',
    os: {
      windows: {
        title: 'A. Install it',
        steps: [
          { text: 'Open the terminal in VS Code and run:', cmds: ['winget install --id GitHub.cli'], why: 'winget is the app installer built into Windows 10 and 11.' },
          { text: 'If Windows says winget is not available, open [cli.github.com](https://cli.github.com/), download the **Windows installer** and run it.' },
        ],
      },
      macos: {
        title: 'A. Install it',
        steps: [{ text: 'Open Terminal and run:', cmds: ['brew install gh'], why: 'Homebrew, installed in the Git step, installs it for you.' }],
      },
      linux: {
        title: 'A. Install it',
        steps: [
          { text: 'Run:', cmds: ['sudo apt install gh'] },
          { text: 'If apt says the package is not found, follow the Linux instructions at [cli.github.com](https://cli.github.com/).' },
        ],
      },
    },
    more: [
      {
        title: 'B. Log in to GitHub',
        intro: 'You do this once. The terminal asks a few questions: move with the arrow keys and press Enter.',
        steps: [
          { text: '**Close the terminal and open it again.**', why: 'So the terminal notices the newly installed gh.' },
          { text: 'Check the install:', cmds: ['gh --version'] },
          { text: 'Start the login:', cmds: ['gh auth login'] },
          { text: 'Select **GitHub.com**.' },
          { text: 'Select **HTTPS**.', why: 'HTTPS is the way Git will talk to GitHub. It is the simplest.' },
          { text: 'If it asks whether to authenticate Git with your GitHub credentials, select **Yes**.' },
          { text: 'Select **Login with a web browser**.' },
          { text: 'Copy the **one-time code** shown in the terminal. It looks like `ABCD-1234`.', why: 'The code is only valid once. Yours will be different.' },
          { text: 'Press **Enter**. Your browser opens a GitHub page.' },
          { text: 'Paste the code, sign in if asked, and click **Authorize**.', why: 'This tells GitHub that this laptop may act for you.' },
          { text: 'Return to the terminal and run:', cmds: ['gh auth setup-git'], why: 'This makes Git use that login whenever it talks to GitHub.' },
          { text: 'Verify:', cmds: ['gh auth status'] },
        ],
        verify: { text: 'You should see:', expect: 'A line like `Logged in to github.com account your-username`.' },
        warnings: [
          '**Never share your password or a token with anyone**, not even a volunteer. The browser sign-in never needs you to.',
        ],
      },
    ],
    fallback: {
      title: 'Optional: only if the browser login fails (Personal Access Token)',
      intro: 'Try the browser login again first. Use this only as a last resort.',
      steps: [
        { text: 'On [github.com](https://github.com/) open your profile picture, then **Settings → Developer settings → Personal access tokens → Tokens (classic)**.' },
        { text: 'Click **Generate new token (classic)**. Name it `git-it-done`, set the expiration to 30 days and tick the scopes `repo` and `read:org`.' },
        { text: 'Click **Generate token** and copy it straight away. GitHub never shows it again.' },
        { text: 'Run `gh auth login`, choose **GitHub.com**, **HTTPS**, then **Paste an authentication token**, paste it and press Enter. Nothing appears while you paste. That is normal.' },
      ],
      warnings: [
        'A token is **like a password**. Never share it, never screenshot it, never put it in a file you commit.',
        'If a token is ever exposed, **revoke it immediately** in Settings → Developer settings and make a new one.',
      ],
    },
  },

  /* ---------------- 5. Git identity ---------------- */
  {
    id: 'identity',
    short: 'Git identity',
    title: 'Set up your Git identity',
    official: { label: 'git-scm.com: first-time setup', url: 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup' },
    why: 'Git stamps your name and email on every commit (every saved snapshot), so the history shows who did what. It is only a label, not a login. You usually do this just once per laptop, and the settings are saved on your laptop.',
    all: {
      steps: [
        { text: 'Open the terminal in VS Code. ' + TERMINAL_KEYS },
        { text: 'Tell Git your name. Copy puts the name from **Your details** into the command (press U to set it):', cmds: ['git config --global user.name "{{name}}"'] },
        { text: 'Tell Git your email. Use the **same email address you used for your GitHub account** in **Your details**:', cmds: ['git config --global user.email "{{email}}"'], why: 'Using the same email lets GitHub link your commits to your profile.' },
        { text: 'Make main the default name for your first branch:', cmds: ['git config --global init.defaultBranch main'] },
        { text: 'Make Git open VS Code when it needs you to type a message:', cmds: ['git config --global core.editor "code --wait"'], why: 'This only works if the code command is available in PATH, which the VS Code step set up.' },
      ],
      verify: {
        text: 'Check everything you just saved:',
        cmds: ['git config --global --list'],
        expect: 'A list that includes `user.name=…` (your name), `user.email=…` (your email), `init.defaultbranch=main` and `core.editor=code --wait`. Extra lines are fine.',
      },
    },
    warnings: [
      'Use straight quotes `"`. If you paste from a document and the quotes are curly, retype them.',
      'If `core.editor` shows an error, `code` is not in PATH yet. Go back to step 1 and fix that. You can still continue without it.',
      'Made a typo? Run the same command again with the right value.',
    ],
    detailsButton: true,
  },
]

export const INSTALL_BY_ID: Record<string, InstallStep> = Object.fromEntries(INSTALL_STEPS.map((s) => [s.id, s]))
export const INSTALL_COUNT = INSTALL_STEPS.length
