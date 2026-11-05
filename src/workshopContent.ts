import type { Card, OS, OSPart } from './engine/types'

/*
 * Card text from the volunteer handbook, merged over the structure in workshop.ts.
 * Rules: one short line per bullet, detail goes to the drawer, and every abbreviation is written out the first time.
 * Commands with personal values use the Your details tokens ({{name}}, {{email}}).
 */
const PATH_FULL = 'PATH (the list of places your computer looks for programs)'
const HTTPS_FULL = 'HTTPS (HyperText Transfer Protocol Secure)'
const TWO_FA = 'two-factor authentication (2FA)'

const byOS = (windows: OSPart, macos: OSPart, linux: OSPart): Record<OS, OSPart> => ({ windows, macos, linux })

const GIT_AFTER_VSCODE = {
  title: 'Git was installed after Visual Studio Code was opened, or it says "Git not found"',
  fix: 'Visual Studio Code only looks for Git when it starts. Fully quit it (close every window) and open it again.',
}
const HOTSPOT = { title: 'Slow download or timeouts', fix: 'Switch to a phone hotspot.' }
const LOCKED_DOWN = {
  title: 'You cannot install software (locked-down laptop)',
  fix: 'Use Plan B: GitHub Codespaces (the Plan B card, reachable from the rail).',
}

export const workshopContent: Record<string, Partial<Card>> = {
  os: {
    bullets: [
      'We install five things, in order',
      'Visual Studio Code (VS Code), Git, a GitHub account, GitHub command line interface (CLI), your Git identity',
      'Then a hands-on tutorial on its own page',
    ],
    aside: { text: 'Locked-down laptop, Chromebook or tablet? Skip to Plan B (Codespaces)', href: '#/codespaces' },
    os: byOS(
      { drawer: { clicks: [
        'To open a terminal before Git is installed: Start menu, type PowerShell, press Enter.',
        'Once Visual Studio Code is installed, use its built-in terminal instead (Control + backtick). It opens PowerShell on Windows. Git Bash (installed with Git) also works.',
        'Not sure which Windows you have? Any Windows 10 or 11 laptop works.',
      ] } },
      { drawer: { clicks: [
        'To open a terminal: press Command + Space, type Terminal, press Enter.',
        'Not sure which Mac you have? Any Mac from the last several years works, Intel or Apple silicon.',
      ] } },
      { drawer: { clicks: [
        'To open a terminal: press Control + Alt + T.',
        'The commands on these cards use apt, which is on Ubuntu and Debian. On Fedora, use dnf in the same place (ask a volunteer).',
      ] } },
    ),
    drawer: {
      mistakes: [
        { title: 'Anything fails, or your screen looks different from the examples', fix: 'Raise your hand. Volunteers are here for exactly this. Nobody is expected to fix it alone.' },
        { title: 'You picked the wrong system', fix: 'Click another tile on this card, or press O at any time. Every card switches at once.' },
      ],
      sections: [
        {
          title: 'What each of the five things is for',
          into: 'happening',
          items: [
            'Visual Studio Code (VS Code): one window with your files and a terminal. Where you type everything today.',
            'Git: the free program that keeps the history of your project on your laptop.',
            'A GitHub account: your free online home, where a copy of your work lives.',
            'GitHub command line interface (CLI): a small tool that logs Git in to GitHub through your browser, so you never type a password in the terminal.',
            'Your Git identity: a name and email stamped on every commit, so the history says who did what.',
          ],
        },
      ],
      happening: 'Setup is done once per laptop, in this order, because each step needs the one before it. When it is finished you move on to the hands-on tutorial and type the commands yourself. Your choice of system is remembered, so every card from here on shows the instructions for your laptop.',
    },
  },

  vscode: {
    drawer: {
      clicks: [
        'Follow the numbered steps on the card. Use the Windows, macOS and Linux tabs to see the steps for your laptop.',
        'Check your work with the code --version command in the green box on the card.',
        'Stuck? Raise your hand. Volunteers are here for exactly this.',
      ],
      mistakes: [
        GIT_AFTER_VSCODE,
        { title: 'Windows: "code" is not recognized', fix: 'Add to PATH was not ticked. Run the installer again with all four boxes ticked, then close and reopen every terminal.' },
        { title: 'macOS: "command not found: code"', fix: 'In VS Code press Command + Shift + P, type "shell command" and choose "Shell Command: Install \'code\' command in PATH". Then close and reopen Terminal.' },
        { title: 'macOS says the app is from the internet or from an unidentified developer', fix: 'Click Open. If there is no Open button, go to System Settings > Privacy & Security and click Open Anyway.' },
        { title: 'Linux: "Unable to locate package" or "No such file"', fix: 'You are not in the folder with the downloaded file. Run cd ~/Downloads and try again. On Fedora, download the .rpm and use sudo dnf install ./code_*.rpm.' },
        LOCKED_DOWN,
      ],
      happening: `Visual Studio Code (VS Code) is a free editor with a terminal built in, so your files and your commands share one window. Adding it to ${PATH_FULL} is what lets you type "code" in any terminal.`,
      links: [
        { label: 'Visual Studio Code: official site', url: 'https://code.visualstudio.com/' },
        { label: 'Using the terminal in VS Code', url: 'https://code.visualstudio.com/docs/terminal/basics' },
      ],
    },
  },

  'git-install': {
    drawer: {
      clicks: [
        'Follow the numbered steps on the card. Use the Windows, macOS and Linux tabs to see the steps for your laptop.',
        'Check your work with git --version, the command in the green box on the card.',
        'Stuck? Raise your hand. Volunteers are here for exactly this.',
      ],
      mistakes: [
        { title: '"\'git\' is not recognized" or "command not found: git"', fix: 'Close all terminals and Visual Studio Code, then reopen them. If it still fails, restart the laptop, then run the install again.' },
        { title: 'macOS: "zsh: command not found: brew" after installing Homebrew', fix: 'Run the lines Homebrew printed under "Next steps", then close and reopen Terminal.' },
        { title: 'macOS: the password is rejected or Homebrew says you are not an administrator', fix: 'Homebrew needs an administrator account. Ask a volunteer, or use Plan B: GitHub Codespaces.' },
        { title: 'Linux: "Unable to locate package git"', fix: 'Run sudo apt update first. On Fedora use sudo dnf install git instead.' },
        HOTSPOT,
        LOCKED_DOWN,
      ],
      happening: 'Git is the free program that records the history of your project. It runs on your laptop and works offline. On Windows, two installer screens make Visual Studio Code the editor Git opens (instead of Vim, which confuses beginners) and name your first branch main, which matches GitHub. On a Mac the easiest way to install Git is Homebrew, a package manager (a tool that installs other tools).',
      links: [
        { label: 'Git: the official website', url: 'https://git-scm.com/' },
        { label: 'Homebrew: the official website', url: 'https://brew.sh/' },
        { label: 'Set up Git (GitHub Docs)', url: 'https://docs.github.com/en/get-started/git-basics/set-up-git' },
      ],
    },
  },

  'github-account': {
    drawer: {
      clicks: [
        'Follow the numbered steps on the card. Use the Windows, macOS and Linux tabs to see the steps for your laptop.',
        'You are done when GitHub shows your home page with your profile picture in the top-right corner.',
        'Stuck? Raise your hand. Volunteers are here for exactly this.',
      ],
      mistakes: [
        { title: 'The verification email never arrives', fix: 'Wait 2 minutes, check spam, click resend, or sign up with a personal Gmail address.' },
        { title: 'Username already taken', fix: 'Add digits or a suffix to it.' },
        { title: 'Password rejected as too weak', fix: 'Use a longer passphrase, for example four random words.' },
        { title: 'Account flagged during sign-up', fix: 'Try a phone hotspot, or finish later.' },
        { title: `GitHub shows a ${TWO_FA} banner or prompt`, fix: 'Follow its on-screen steps (an authenticator app or a passkey) and save the recovery codes. An account restricted for missing 2FA cannot create tokens or authorise apps, which would block the next steps.' },
      ],
      happening: `GitHub is the website that stores your Git projects online, and your username is part of every repository address (github.com/username/project). The code GitHub emails you only proves the email is yours. ${TWO_FA[0].toUpperCase()}${TWO_FA.slice(1)} is a second proof when you sign in, from an authenticator app or a passkey (a login stored on your device).`,
      links: [
        { label: 'GitHub: the official website', url: 'https://github.com/' },
        { label: 'Creating an account on GitHub (GitHub Docs)', url: 'https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github' },
        { label: 'About two-factor authentication (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/about-two-factor-authentication' },
      ],
    },
  },

  'gh-install': {
    drawer: {
      clicks: [
        'Follow the numbered steps on the card. Use the Windows, macOS and Linux tabs to see the steps for your laptop.',
        'Check your work with gh auth status. It should say you are logged in to github.com.',
        'Stuck? Raise your hand. Volunteers are here for exactly this.',
      ],
      mistakes: [
        { title: '"gh: command not found"', fix: 'Close and reopen the terminal. If it still fails, redo the install.' },
        { title: 'Windows: "winget is not recognized"', fix: 'Download the Windows installer from cli.github.com instead.' },
        { title: 'macOS: "command not found: brew"', fix: 'Go back to the Git step: run the "Next steps" lines Homebrew printed, then reopen Terminal.' },
        { title: 'Linux: "Unable to locate package gh"', fix: 'Run sudo apt update, try again, or follow the install steps at cli.github.com.' },
        { title: '"Authentication failed" or "Password authentication is not supported"', fix: 'You used your account password. Run gh auth login again and use the browser sign-in.' },
        { title: 'The browser does not open, or it opens the wrong account', fix: 'Open the address shown in the terminal by hand, in the browser where the right account is signed in.' },
        { title: `"Can't create a token", "can't authorise", or a ${TWO_FA} banner`, fix: 'Follow GitHub\'s 2FA steps (an authenticator app or a passkey), then repeat the login.' },
        { title: 'Old credentials keep being used', fix: 'Run gh auth logout, then gh auth login again. On Windows you can also remove github.com in Credential Manager; on macOS, in Keychain Access.' },
      ],
      sections: [
        {
          title: 'Token safety',
          into: 'wrong',
          items: [
            'Never share your password or a token with anyone, not even a volunteer.',
            'Treat a token like a password. Never post it in the group chat, never screenshot it, never commit it into a repository.',
            'If it leaks, revoke it at Settings > Developer settings immediately and make a new one.',
          ],
        },
      ],
      happening: `Git needs proof that you own your GitHub account before it can upload anything. GitHub command line interface (CLI) does this through your browser: it shows a short one-time code, GitHub checks it, and your laptop is trusted from then on, with no password or token in the terminal. The code ABCD-1234 in the example is only an example; yours will be different. ${HTTPS_FULL} is the secure web connection Git uses to talk to GitHub.`,
      links: [
        { label: 'GitHub CLI: the official website', url: 'https://cli.github.com/' },
        { label: 'gh auth login (official manual)', url: 'https://cli.github.com/manual/gh_auth_login' },
        { label: 'Managing your personal access tokens (GitHub Docs)', url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens' },
      ],
    },
  },

  identity: {
    drawer: {
      clicks: [
        'Follow the numbered steps on the card. Copy fills in the name and email from Your details.',
        'Optional: press U and save your name and email once. The commands below, and the later command cards, then fill themselves in.',
        'Check your work with git config --global --list.',
      ],
      commands: [
        'git config --global user.name "{{name}}"',
        'git config --global user.email "{{email}}"',
        'git config --global init.defaultBranch main',
        'git config --global core.editor "code --wait"',
        'git config --global --list',
      ],
      mistakes: [
        { title: '"Please tell me who you are" or "unable to auto-detect email address"', fix: 'The name and email commands were not run. Run them now.' },
        { title: 'The core.editor command errors', fix: `core.editor only works if code is on ${PATH_FULL}, which the Visual Studio Code step sets up. If it errors, skip that command.` },
        { title: 'A command fails with a quote error', fix: 'Pasting from documents or web pages can produce curly quotes. Use straight quotes: retype the quotes by hand.' },
        { title: 'A strange screen opens and will not close (that is Vim)', fix: 'Press Esc (Escape), type :wq and press Enter. Or type :q! to quit without saving. To stop it happening, run the core.editor command.' },
        { title: 'You want to change a value later', fix: 'Run the same command again with the new value.' },
      ],
      happening: 'Git writes your name and email into every commit, so the history shows who did what. It is only a label: it proves nothing and it is not a login (the login was the last step). Using the same email as your GitHub account lets GitHub link your commits to your profile. The last two commands name your first branch main and tell Git to open Visual Studio Code whenever it needs you to type a message.',
      links: [
        { label: 'Pro Git: First-time Git setup', url: 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup' },
        { label: 'git config (official manual)', url: 'https://git-scm.com/docs/git-config' },
      ],
    },
  },

  codespaces: {
    bullets: [
      'A full Visual Studio Code (VS Code) and terminal in your browser, Git included',
      'Needs only your GitHub account and a browser. No token step',
      'Go to github.com/codespaces, or in a repository: Code > Codespaces',
      'For locked-down laptops, Chromebooks, tablets or a failed install',
    ],
    note: 'Setup taking more than about 5 minutes? Ask a volunteer for Plan B early.',
    drawer: {
      clicks: [
        'Go to github.com/codespaces and sign in. You are already signed in to your GitHub account, so there is no token step.',
        'Or open any repository on GitHub, click the green Code button, choose the Codespaces tab and click Create codespace.',
        'Wait a minute while it starts. You get an editor and a terminal in your browser tab.',
        'In its terminal run git --version. Git is already installed.',
        'Continue with the command cards: git init, status, add, commit, log and push.',
      ],
      commands: ['git --version'],
      mistakes: [
        { title: 'The codespace is slow to start or the page looks stuck', fix: 'Wait a minute, then refresh the page. Ask a volunteer if it still fails.' },
        { title: 'A message says you used your free allowance', fix: 'Free accounts get a monthly allowance of hours. Ask a volunteer. Stop codespaces you are not using.' },
        { title: 'You are not sure whether your laptop needs Plan B', fix: 'If setup is taking more than about 5 minutes, ask for Plan B early. Do not wait to fall behind.' },
      ],
      happening: 'GitHub Codespaces is a computer in the cloud that you use through a browser tab. It already has Visual Studio Code, a terminal and Git, and it is signed in to your GitHub account, which makes it a good fallback when a laptop is locked down, is a Chromebook or tablet, or an install fails. It is a fallback, not unlimited: free accounts get a monthly allowance.',
      links: [
        { label: 'GitHub Codespaces', url: 'https://github.com/codespaces' },
        { label: 'What are GitHub Codespaces? (GitHub Docs)', url: 'https://docs.github.com/en/codespaces/about-codespaces/what-are-codespaces' },
      ],
    },
  },

  ready: {
    sentence: 'Next: a hands-on tutorial where you build and push your first repository.',
    bullets: [
      'Open the tutorial: it walks you through every click and command',
      'You create a GitHub repository, make two commits and push them',
      'Stuck? Raise your hand. Volunteers are here for exactly this',
    ],
    note: 'Click any node on the rail to jump, or press the left arrow.',
    cta: { label: 'Open the hands-on tutorial', href: '#/workshop' },
    drawer: {
      clicks: [
        'Click "Open the hands-on tutorial". It opens a separate page with nine numbered stages.',
        'Follow the stages in order: create a GitHub repository, make a folder, run git init, create a file, commit twice, connect to GitHub and push.',
        'When you finish, use the button at the end to come back to the presentation.',
      ],
      mistakes: [
        { title: 'The first push is rejected', fix: 'The GitHub repository was not empty. Create a new, completely empty one (no README, no licence, no gitignore).' },
        { title: '"git: command not found" or "gh: command not found"', fix: 'Go back to the installation steps, then close and reopen every terminal and Visual Studio Code.' },
        { title: 'You are stuck or something looks different from the examples', fix: 'Raise your hand. Volunteers are here for exactly this.' },
      ],
      happening: 'Everything is installed and you are signed in. The tutorial page is where you practise: you type the commands on your own laptop, one stage at a time, with screenshots of what you should see.',
      links: [
        { label: 'Pro Git book (free, official)', url: 'https://git-scm.com/book' },
      ],
    },
  },
}
