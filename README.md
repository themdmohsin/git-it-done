# Git It Done (presentation branch)

Interactive, full-screen teaching cards for Mohsin's half of the Git and GitHub workshop. Vite + React + TypeScript + framer-motion. Fonts are bundled, so it works offline. Designed for a 1920x1080 television.

## Run

```
npm install
npm run dev      # development
npm run build    # type-check + production build
```

## Your screenshot

Drop the messy-folder screenshot at `public/messy-folder.png`. Until that file exists, a drawn stand-in file explorer is shown; the image replaces it automatically.

## Controls

| Key | Action |
| --- | --- |
| Right arrow / Space | ONE step. Types the command, reveals the next part, or moves to the next card. Pressing during an animation only finishes that animation. |
| Left arrow | Back one step. Motion plays in reverse and rebuilds the stack. |
| D | Details drawer |
| O | Operating system picker (Esc closes) |
| R | Replay the current card (for stack cards, replays the motion into the card) |

Nothing ever advances by itself. Click a rail node to jump. Every card has its own URL (`#/messy`, `#/open-source`, `#/push` ...). Loading any URL directly rebuilds the correct stack and the correct repository state.

## Storyline

A. Hook: `messy`, `git-answer`
B. Zoom out: `open-source` (the stack pulls back and cards come in front, one after another)
C. Peel back: `linux`, `linus`, `vc-problem`, `vc-idea`, `git-born`, `recap` (each press moves the front card away)
D. Dive into Git: `git-vs-github`, `three-areas`, `setup`, `init`, `status`, `add`, `commit`, `log`, `push`
Part 2 (Vijay): `branch`, `merge`, `pull-request`, `fork` (stubs), `challenge`

The repository state is one continuing repository from `init` onwards. Sections A to C never touch it.

## Add a card (data only)

Add an object to the array in `src/cards.ts`. The id becomes the URL.

```ts
{
  id: 'stash',
  rail: 'Stash',                // short name on the rail and on stack tabs
  section: 'git',               // hook | stepback | story | git | part2
  kicker: 'COMMAND \u00b7 STASH',
  title: 'Park your work',
  sentence: 'Stash saves unfinished changes for later.',
  bullets: ['...', '...'],
  tryIt: 'git stash',
  view: 'terminal',             // messy | hero | story | compare | areas | setup | terminal | stub | challenge
  lane: 'main',                 // main | detour | branch (rail lane)
  into: 'drop',                 // optional: slide | drop | split | converge | launch | zoom | zoomout
  steps: [{ cmd: 'git stash', output: ['Saved working directory'], op: { type: 'none' } }],
  drawer: { commands: ['git stash'], mistakes: [{ title: '...', fix: '...' }], happening: '...' },
}
```

Story cards use `view: 'story'` with `art` (`ring`, `kernel`, `linus`, `chaos`, `snapshots`, `born`) and a drawer with `happening` plus `talking` points.

### Stack scenes

A card may carry a `scene`: `layers` (back to front, the last one is the front card), `front`, `zoomed`, and optional `enter` / `leave` (`rise` or `fly`). The pure planner in `src/engine/stack.ts` turns any two scenes into frames, and playing the frames backwards gives the exact reverse motion. The stack used by the story is defined once at the top of `src/cards.ts`.

A step's `op` is one of `init`, `commit`, `createBranch`, `switchBranch`, `merge`, `deleteBranch`, `addRemote`, `push`, `none` (or an array). The repository is rebuilt by replaying ops (`src/engine/reducer.ts`), so deep links, back and replay all work.

## Change colours

All colours are CSS variables in `src/theme.css`. `--u` is the scale unit (about 1vw on a 16:9 screen) that all sizes derive from.

## Structure

```
src/cards.ts          all content and the stack definition
src/theme.css         all colours + fonts + scale unit
src/styles.css        layout
src/os.ts             operating system detection, prompts, install text
src/engine/           types, pure reducer, stack planner
src/components/       Card, Art, Terminal, Graph, Rail, Drawer, OSPicker, Transitions, Panels
```
