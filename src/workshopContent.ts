import type { Card, OS, OSPart } from './engine/types'

/*
 * Card text from the volunteer handbook, merged over the structure in workshop.ts.
 * Rules: one short line per bullet, detail goes to the drawer, and every abbreviation is written out the first time.
 * Commands with personal values use the Your details tokens ({{name}}, {{email}}).
 */
const PATH_FULL = 'PATH (the list of places your computer looks for programs)'
const HTTPS_FULL = 'HTTPS (HyperText Transfer Protocol Secure)'
const TWO_FA = 'two-factor authentication (2FA)'
const HOMEBREW_CMD = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'

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
      'Then back to the commands, copy and paste',
    ],
    aside: { text: 'Locked-down laptop, Chromebook or tablet? Skip to Plan B (Codespaces)', href: '#/codespaces' },
    os: byOS(
      { drawer: { clicks: [
        'To open a terminal before Git is installed: Start menu, type PowerShell, press Enter.',
        'After Git is installed, use Git Bash instead (Start menu, type Git Bash), so every command matches macOS and Linux.',
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
      happening: 'Setup is done once per laptop, in this order, because each step needs the one before it. When it is finished you go back to the command cards (git init to git push) and copy and paste the commands. Your choice of system is remembered, so every card from here on shows the instructions for your laptop.',
    },
  },

  vscode: {
    aside: { text: 'Install not working? Plan B: GitHub Codespaces', href: '#/codespaces' },
    drawer: {
      links: [
        { label: 'Visual Studio Code (VS Code) documentation', url: 'https://code.visualstudio.com/docs' },
        { label: 'Using the terminal in VS Code', url: 'https://code.visualstudio.com/docs/terminal/basics' },
      ],
    } as Card['drawer'],
    os: byOS(
      {
        bullets: [
          'Download the User Installer from code.visualstudio.com',
          `Tick all four extra tasks, above all Add to ${PATH_FULL}`,
          'Terminal inside it: Control + backtick key (above Tab)',
        ],
        tryIt: 'code --version',
        drawer: {
          clicks: [
            'Go to code.visualstudio.com and download the Windows installer (the User Installer).',
            'Run it and accept the licence agreement.',
            `On the "Select Additional Tasks" screen tick all four: Add "Open with Code" action to the file context menu; Add "Open with Code" action to the directory context menu; Register Code as an editor for supported file types; and Add to ${PATH_FULL} (this one matters most).`,
            'Click Install, then launch Visual Studio Code.',
            'Open the terminal inside it: press Control + the backtick key (above Tab), or use the menu Terminal > New Terminal.',
            'Tip: once Git is installed (next card), open the dropdown next to the plus sign in that terminal and choose "Git Bash". Commands then match macOS and Linux.',
          ],
          commands: ['code --version'],
          mistakes: [
            GIT_AFTER_VSCODE,
            { title: '"code" is not recognized', fix: 'Add to PATH was not ticked. Run the installer again with all four boxes ticked, then close and reopen every terminal.' },
            { title: 'Older PowerShell does not accept && between commands', fix: 'Run the commands on separate lines, or switch the terminal to Git Bash (dropdown next to the plus sign).' },
            { title: 'You cannot install software (locked-down laptop)', fix: 'The User Installer often works without administrator rights. If it does not, use Plan B: GitHub Codespaces.' },
          ],
          happening: `Visual Studio Code (VS Code) is a free editor with a terminal built in, so your files and your commands share one window. Adding it to ${PATH_FULL} is what lets you type "code" in any terminal. The four ticked tasks also add "Open with Code" to the right-click menu.`,
        },
      },
      {
        bullets: [
          'Download the Universal build from code.visualstudio.com',
          'Unzip it, drag it into Applications, open it from there',
          'Terminal inside it: Command + backtick key (above Tab)',
        ],
        tryIt: 'code --version',
        drawer: {
          clicks: [
            'Go to code.visualstudio.com and download the Universal build (it works on every Mac).',
            'Unzip the download by double-clicking it.',
            'Drag Visual Studio Code into the Applications folder.',
            'Open it from Applications. If macOS warns about an app from the internet, click Open.',
            'Open the terminal inside it: press Command + the backtick key (above Tab), or use the menu Terminal > New Terminal.',
            `To type "code" in any terminal: press Command + Shift + P, type "shell command", and choose "Shell Command: Install 'code' command in ${PATH_FULL}".`,
          ],
          commands: ['code --version'],
          mistakes: [
            GIT_AFTER_VSCODE,
            { title: '"command not found: code"', fix: 'Do the last step above (Shell Command: Install \'code\' command in PATH), then close and reopen Terminal.' },
            { title: 'macOS says the app is from the internet or from an unidentified developer', fix: 'Click Open. If there is no Open button, go to System Settings > Privacy & Security and click Open Anyway.' },
            { title: 'You cannot install software (locked-down laptop)', fix: 'Use Plan B: GitHub Codespaces.' },
          ],
          happening: 'Visual Studio Code (VS Code) is a free editor with a terminal built in, so your files and your commands share one window. The Universal build runs on every Mac. Installing the shell command lets you type "code" in any terminal.',
        },
      },
      {
        bullets: [
          'Download the Debian package (.deb) from code.visualstudio.com',
          'Install it with the command below',
          'Terminal inside it: Control + backtick key (above Tab)',
        ],
        tryIt: 'sudo apt install ./code_*.deb',
        drawer: {
          clicks: [
            'Go to code.visualstudio.com and download the .deb file (a Debian package).',
            'Open a terminal in the folder it downloaded to (usually Downloads): press Control + Alt + T, then type cd ~/Downloads.',
            'Run the install command below. Type your password when asked: nothing appears while you type, that is normal.',
            'Start Visual Studio Code from your applications menu, or type code.',
            'Open the terminal inside it: press Control + the backtick key (above Tab), or use the menu Terminal > New Terminal.',
          ],
          commands: ['cd ~/Downloads', 'sudo apt install ./code_*.deb', 'code --version'],
          mistakes: [
            GIT_AFTER_VSCODE,
            { title: '"Unable to locate package" or "No such file"', fix: 'You are not in the folder with the downloaded file. Run cd ~/Downloads and try again.' },
            { title: 'You are on Fedora, not Ubuntu or Debian', fix: 'Download the .rpm file instead and install it with sudo dnf install ./code_*.rpm.' },
            { title: 'You cannot install software (locked-down laptop)', fix: 'Use Plan B: GitHub Codespaces.' },
          ],
          happening: 'Visual Studio Code (VS Code) is a free editor with a terminal built in, so your files and your commands share one window. The .deb file is the Debian and Ubuntu package format, and apt installs it for you.',
        },
      },
    ),
  },

  'git-install': {
    sentence: 'First check: open a terminal and run git --version. If a version prints, you already have Git. Skip this card.',
    drawer: {
      links: [
        { label: 'Download Git (official)', url: 'https://git-scm.com/downloads' },
        { label: 'Set up Git (GitHub Docs)', url: 'https://docs.github.com/en/get-started/git-basics/set-up-git' },
      ],
    } as Card['drawer'],
    os: byOS(
      {
        bullets: [
          'Download the 64-bit setup from git-scm.com and run it',
          'Click Next on every screen except two:',
          'Editor screen: choose Visual Studio Code',
          'Branch name screen: choose Override and type main',
        ],
        note: 'After installing, close and reopen EVERY terminal and Visual Studio Code. Then run git --version.',
        tryIt: 'git --version',
        drawer: {
          clicks: [
            'Open a terminal and run git --version. If a version prints, Git is already installed: skip to the next card.',
            'Go to git-scm.com, click "Download for Windows", and run the 64-bit setup.',
            'Click Next on every screen EXCEPT two.',
            'Screen "Choosing the default editor used by Git": choose "Use Visual Studio Code as Git\'s default editor". The default, Vim, traps beginners.',
            'Screen "Adjusting the name of the initial branch in new repositories": choose "Override the default branch name for new repositories" and type main.',
            'Click Install, then Finish. Close and reopen EVERY terminal and Visual Studio Code.',
            'Run git --version. Any version number means success.',
            'Tip: in the Visual Studio Code terminal, open the dropdown next to the plus sign and choose "Git Bash", so commands match macOS and Linux. Older PowerShell does not accept && (run those commands on separate lines).',
          ],
          commands: ['git --version', 'which git'],
          mistakes: [
            { title: '"\'git\' is not recognized"', fix: 'Close all terminals and Visual Studio Code, then reopen them. If it still fails, restart the laptop, then reinstall Git.' },
            HOTSPOT,
            { title: 'You cannot install software (locked-down laptop)', fix: 'Use Plan B: GitHub Codespaces. On Windows the Visual Studio Code User Installer may still work without administrator rights.' },
          ],
          happening: 'Git is the free program that records the history of your project. It runs on your laptop and works offline. The two special screens in the installer make Visual Studio Code the editor Git opens (instead of Vim, which confuses beginners) and name your first branch main, which matches GitHub.',
        },
      },
      {
        bullets: [
          'Install Homebrew (a tool that installs other tools) with the command below',
          'Enter your Mac password: nothing shows while typing, that is normal',
          'Run the "Next steps" it prints, reopen Terminal, then brew install git',
        ],
        tryIt: HOMEBREW_CMD,
        drawer: {
          clicks: [
            'Open Terminal (Command + Space, type Terminal, press Enter) and run git --version. If a version prints, Git is already installed: skip to the next card.',
            'Go to brew.sh and copy the official install command (it is also in the box below).',
            'Paste it into Terminal and press Enter.',
            'When it asks for a password, type your Mac login password. Nothing appears while you type: that is normal. Press Enter. It needs an administrator account and takes several minutes.',
            'When it finishes it prints "Next steps". Copy and run those lines, then close and reopen Terminal.',
            'Check Homebrew with brew --version, then install Git with brew install git.',
            'Run git --version. Any version number means success.',
          ],
          commands: [HOMEBREW_CMD, 'brew --version', 'brew install git', 'git --version'],
          mistakes: [
            { title: '"zsh: command not found: brew" after installing Homebrew', fix: 'Run the lines Homebrew printed under "Next steps", then close and reopen Terminal.' },
            { title: '"command not found: git"', fix: 'Close all terminals and Visual Studio Code, then reopen them. If it still fails, restart the laptop, then run brew install git again.' },
            { title: 'The password is rejected or Homebrew says you are not an administrator', fix: 'Homebrew needs an administrator account. Ask a volunteer, or use Plan B: GitHub Codespaces.' },
            HOTSPOT,
            LOCKED_DOWN,
          ],
          happening: 'Git is the free program that records the history of your project. On a Mac the easiest way to install it is Homebrew, a package manager (a tool that installs other tools). Homebrew asks for your password because it installs into a protected folder.',
        },
      },
      {
        bullets: [
          'Install it with the command below',
          'Type your password if asked: nothing shows while typing',
          'Check with git --version: any version number means success',
        ],
        tryIt: 'sudo apt update && sudo apt install git',
        drawer: {
          clicks: [
            'Open a terminal (Control + Alt + T) and run git --version. If a version prints, Git is already installed: skip to the next card.',
            'Run the install command below. Type your password when asked: nothing appears while you type, that is normal.',
            'Close and reopen every terminal and Visual Studio Code.',
            'Run git --version. Any version number means success.',
          ],
          commands: ['git --version', 'sudo apt update && sudo apt install git', 'git --version'],
          mistakes: [
            { title: '"command not found: git"', fix: 'Close all terminals and Visual Studio Code, then reopen them. If it still fails, restart the laptop, then run the install command again.' },
            { title: '"Unable to locate package git"', fix: 'Run sudo apt update first. On Fedora use sudo dnf install git instead.' },
            HOTSPOT,
            LOCKED_DOWN,
          ],
          happening: 'Git is the free program that records the history of your project. On Ubuntu and Debian, apt is the built-in installer: "update" refreshes its list of programs, "install git" fetches Git.',
        },
      },
    ),
  },

  'github-account': {
    bullets: [
      'Go to github.com and click Sign up',
      'Enter email, password and a username you would put on a resume',
      'Solve the puzzle, enter the emailed code, choose the free plan',
      'Sign up BEFORE the event: many sign-ups on one Wi-Fi get flagged',
    ],
    note: 'The emailed code is only email verification. It is not two-factor authentication (2FA).',
    drawer: {
      clicks: [
        'Go to github.com and click Sign up.',
        'Enter your email, a password and a username. Choose a username you would be happy to put on a resume: it appears in every repository address.',
        'Solve the puzzle.',
        'Enter the code GitHub emails you. It can take a minute, so check your spam folder.',
        'Choose the free plan.',
      ],
      mistakes: [
        { title: 'The verification email never arrives', fix: 'Wait 2 minutes, check spam, click resend, or sign up with a personal Gmail address.' },
        { title: 'Username already taken', fix: 'Add digits or a suffix to it.' },
        { title: 'Password rejected as too weak', fix: 'Use a longer passphrase, for example four random words.' },
        { title: 'Account flagged during sign-up', fix: 'Try a phone hotspot, or finish later.' },
        { title: `GitHub shows a ${TWO_FA} banner or prompt`, fix: 'Follow its on-screen steps (an authenticator app or a passkey) and save the recovery codes. An account restricted for missing 2FA cannot create tokens or authorise apps, which would block the next steps.' },
      ],
      happening: `GitHub is the website that stores your Git projects online, and your username is part of every repository address (github.com/username/project). The code GitHub emails you only proves the email is yours. ${TWO_FA[0].toUpperCase()}${TWO_FA.slice(1)} is a second proof when you sign in, from an authenticator app or a passkey (a login stored on your device). Sign up before the event so the code arrives quickly and many sign-ups from one Wi-Fi do not get accounts flagged.`,
      links: [
        { label: 'Creating an account on GitHub (GitHub Docs)', url: 'https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github' },
        { label: 'About two-factor authentication (GitHub Docs)', url: 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/about-two-factor-authentication' },
      ],
    },
  },

  'gh-install': {
    drawer: {
      links: [
        { label: 'GitHub command line interface (CLI): official site', url: 'https://cli.github.com/' },
      ],
    } as Card['drawer'],
    os: byOS(
      {
        bullets: [
          'winget (the Windows package manager) installs it in one line',
          'No winget? Download the installer from cli.github.com',
          'Close and reopen the terminal, then check: gh --version',
        ],
        tryIt: 'winget install --id GitHub.cli',
        drawer: {
          clicks: [
            'Open a terminal (Git Bash or PowerShell) and run the install command below.',
            'If it says winget is not available, go to cli.github.com, download the Windows installer and run it.',
            'Close and reopen the terminal.',
            'Run gh --version. Any version number means success.',
          ],
          commands: ['winget install --id GitHub.cli', 'gh --version'],
          mistakes: [
            { title: '"gh: command not found"', fix: 'Close and reopen the terminal. If it still fails, redo the install.' },
            { title: '"winget is not recognized"', fix: 'Download the installer from cli.github.com instead.' },
          ],
          happening: 'GitHub CLI (command line interface) is a small program called gh. It signs Git in to GitHub through your browser, so the first git push works without typing a password. winget is the package manager built into Windows 10 and 11: it downloads and installs programs from one command.',
        },
      },
      {
        bullets: [
          'Homebrew installs it in one line',
          'Close and reopen Terminal, then check: gh --version',
        ],
        tryIt: 'brew install gh',
        drawer: {
          clicks: [
            'Open Terminal and run the install command below (it uses Homebrew from the Git step).',
            'Close and reopen Terminal.',
            'Run gh --version. Any version number means success.',
          ],
          commands: ['brew install gh', 'gh --version'],
          mistakes: [
            { title: '"command not found: gh"', fix: 'Close and reopen Terminal. If it still fails, redo the install.' },
            { title: '"command not found: brew"', fix: 'Go back to the Git card: run the "Next steps" lines Homebrew printed, then reopen Terminal.' },
          ],
          happening: 'GitHub CLI (command line interface) is a small program called gh. It signs Git in to GitHub through your browser, so the first git push works without typing a password. Homebrew installs it for you.',
        },
      },
      {
        bullets: [
          'apt installs it in one line',
          'Not found? Follow the install steps at cli.github.com',
          'Close and reopen the terminal, then check: gh --version',
        ],
        tryIt: 'sudo apt install gh',
        drawer: {
          clicks: [
            'Open a terminal and run the install command below. Type your password if asked.',
            'If apt cannot find gh, follow the install steps for Linux at cli.github.com.',
            'Close and reopen the terminal.',
            'Run gh --version. Any version number means success.',
          ],
          commands: ['sudo apt install gh', 'gh --version'],
          mistakes: [
            { title: '"gh: command not found"', fix: 'Close and reopen the terminal. If it still fails, redo the install.' },
            { title: '"Unable to locate package gh"', fix: 'Run sudo apt update, try again, or follow the install steps at cli.github.com.' },
          ],
          happening: 'GitHub CLI (command line interface) is a small program called gh. It signs Git in to GitHub through your browser, so the first git push works without typing a password.',
        },
      },
    ),
  },

  'gh-login': {
    bullets: [
      `Choose GitHub.com, then ${HTTPS_FULL}`,
      'Authenticate Git: Yes. Then "Login with a web browser"',
      'Copy the code, press Enter, paste it, Authorize',
      'Then run gh auth setup-git and check with gh auth status',
    ],
    note: 'Your account password does not work for Git any more. Use the browser sign-in.',
    final: 'Never share a token. Not with anyone. Not even a volunteer.',
    tryIt: 'gh auth login',
    os: byOS(
      { drawer: { mistakes: [
        { title: 'Wrong or old credentials keep being used', fix: 'Open Credential Manager > Windows Credentials, remove the entry git:https://github.com, then retry gh auth login.' },
      ] } },
      { drawer: { mistakes: [
        { title: 'Wrong or old credentials keep being used', fix: 'Open Keychain Access, search for github.com, delete those entries, then retry gh auth login.' },
      ] } },
      { drawer: { mistakes: [
        { title: 'Wrong or old credentials keep being used', fix: 'Run gh auth logout, then gh auth login again.' },
      ] } },
    ),
    drawer: {
      clicks: [
        'Run gh auth login.',
        `Choose GitHub.com, then ${HTTPS_FULL}.`,
        'If it asks whether to authenticate Git with your GitHub credentials, answer Yes.',
        'Choose "Login with a web browser".',
        'Copy the one-time code shown in the terminal (it looks like ABCD-1234) and press Enter.',
        'Your browser opens. Paste the code into the page, then click Authorize.',
        'Back in the terminal, run gh auth setup-git, then gh auth status. It should say you are logged in to github.com.',
      ],
      commands: ['gh auth login', 'gh auth setup-git', 'gh auth status'],
      mistakes: [
        { title: '"Authentication failed" or "Password authentication is not supported"', fix: 'You used your account password. Run gh auth login again and use the browser sign-in.' },
        { title: 'The browser does not open, or it opens the wrong account', fix: 'Open the address shown in the terminal by hand, in the browser where the right account is signed in. Or use the token backup below.' },
        { title: `"Can't create a token", "can't authorise", or a ${TWO_FA} banner`, fix: 'Follow GitHub\'s 2FA steps (an authenticator app or a passkey), then redo this card.' },
      ],
      sections: [
        {
          title: 'Backup: personal access token (only if the browser sign-in fails)',
          ordered: true,
          items: [
            'On GitHub open your profile picture > Settings > Developer settings (bottom of the left sidebar) > Personal access tokens > Tokens (classic). Shortcut: github.com/settings/tokens',
            'Click Generate new token (classic). Note: git-it-done. Expiration: 30 days. Tick the scopes repo and read:org.',
            'Click Generate token and copy it immediately. GitHub never shows it again. It starts with ghp_.',
            `Run gh auth login, choose GitHub.com, then ${HTTPS_FULL}, then "Paste an authentication token". Paste it and press Enter. Nothing appears while you paste: that is normal.`,
            'After 30 days it expires: make a new token and log in again. "Authentication failed" with a token that used to work means it expired.',
          ],
        },
        {
          title: 'Token safety',
          into: 'wrong',
          items: [
            'Treat a token like a password.',
            'Never post it in the group chat, never screenshot it, never commit it into a repository.',
            'If it leaks, revoke it at Settings > Developer settings immediately and make a new one.',
            'Deleting a file does not remove it from history.',
          ],
        },
      ],
      happening: `Git needs proof that you own your GitHub account before it can upload anything. GitHub command line interface (CLI) does this through your browser: it shows a short one-time code, GitHub checks it, and your laptop is trusted from then on, with no password or token in the terminal. The code ABCD-1234 in the example is only an example; yours will be different. ${HTTPS_FULL} is the secure web connection Git uses to talk to GitHub.`,
      links: [
        { label: 'gh auth login (official manual)', url: 'https://cli.github.com/manual/gh_auth_login' },
        { label: 'Managing your personal access tokens (GitHub Docs)', url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens' },
      ],
    },
  },

  identity: {
    sentence: 'Just a label, NOT a login. Login was the last card.',
    bullets: [
      'Use the SAME email as GitHub. The name can be anything',
      'Check with git config --global --list',
    ],
    chips: [
      'git config --global user.name "{{name}}"',
      'git config --global user.email "{{email}}"',
      'git config --global init.defaultBranch main',
      'git config --global core.editor "code --wait"',
    ],
    detailsButton: true,
    os: byOS(
      { drawer: { clicks: [
        'Open the terminal inside Visual Studio Code (Control + backtick). In its dropdown next to the plus sign choose "Git Bash".',
        'Add your details once: click the button on the card or press U.',
        'Copy each command with its Copy button, paste it into the terminal and press Enter. One command at a time.',
        'Check with git config --global --list.',
      ] } },
      { drawer: { clicks: [
        'Open Terminal inside Visual Studio Code (Command + backtick), or the Terminal app.',
        'Add your details once: click the button on the card or press U.',
        'Copy each command with its Copy button, paste it into the terminal and press Enter. One command at a time.',
        'Check with git config --global --list.',
      ] } },
      { drawer: { clicks: [
        'Open the terminal inside Visual Studio Code (Control + backtick), or press Control + Alt + T.',
        'Add your details once: click the button on the card or press U.',
        'Copy each command with its Copy button, paste it into the terminal and press Enter. One command at a time.',
        'Check with git config --global --list.',
      ] } },
    ),
    drawer: {
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
        { title: 'A strange screen opens and will not close (that is Vim)', fix: 'Press Esc (Escape), type :wq and press Enter. Or type :q! to quit without saving. To stop it happening, run the core.editor command above.' },
        { title: 'You want to change a value later', fix: 'Run the same command again with the new value.' },
      ],
      happening: 'Git writes your name and email into every commit, so the history shows who did what. It is only a label: it proves nothing and it is not a login (the login was the last card). Using the same email as your GitHub account lets GitHub link your commits to your profile. The last two commands name your first branch main and tell Git to open Visual Studio Code whenever it needs you to type a message.',
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
        { label: 'What are GitHub Codespaces? (GitHub Docs)', url: 'https://docs.github.com/en/codespaces/about-codespaces/what-are-codespaces' },
      ],
    },
  },

  ready: {
    bullets: [
      'Create your GitHub repository EMPTY: no README, no licence, no gitignore',
      'Stuck? Raise your hand. Volunteers are here for exactly this',
      'Typing a command wrong is normal. Everyone sees errors',
    ],
    note: 'Click any node on the rail to jump, or press the left arrow.',
    cta: { label: 'Back to git init', href: '#/init' },
    drawer: {
      clicks: [
        'Click "Back to git init" (or click git init on the rail).',
        'Run the command cards in order: git init, git status, git add, git commit, git log, git push.',
        'Before git push, on github.com click New repository, name it, leave README, licence and gitignore switched OFF, and click Create repository.',
      ],
      mistakes: [
        { title: 'The first push is rejected', fix: 'The GitHub repository was not empty. Create a new, completely empty one (no README, no licence, no gitignore).' },
        { title: '"git: command not found" or "gh: command not found"', fix: 'Go back to the install cards, then close and reopen every terminal and Visual Studio Code.' },
        { title: 'You are stuck or something looks different from the examples', fix: 'Raise your hand. Volunteers are here for exactly this.' },
      ],
      happening: 'Everything is installed and you are signed in. From here the command cards teach what each command does, and you type them on your own laptop as you follow along. The commands use your own name, email and repository name, so check them with U (Your details) once.',
      links: [
        { label: 'Pro Git book (free, official)', url: 'https://git-scm.com/book' },
      ],
    },
  },
}
