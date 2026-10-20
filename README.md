# Git It Done (prototype)

Interactive, full-screen teaching cards for a Git & GitHub workshop. Vite + React + TypeScript + framer-motion. Fonts are bundled, so it works offline.

## Run

```
npm install
npm run dev      # development
npm run build    # type-check + production build
```

## Controls

| Key | Action |
| --- | --- |
| Right arrow / Space | Next step (types the command, plays the animation). When a card's steps are done, goes to the next card. Pressing while a step is animating completes it. |
| Left arrow | Back one step (instant). At step 0, goes to the previous card's final state. |
| D | Details drawer |
| O | OS picker overlay (Esc closes) |
| R | Replay current card |

Click a rail node to jump to a card. Every card has a URL (`#/commit`, `#/merge`, ...). Nothing ever advances by itself.

## Add a card (data only)

Add an object to the array in `src/cards.ts`. No component code is needed.

```ts
{
  id: 'stash',                 // becomes the URL: #/stash
  kicker: '06 · STASH',
  title: 'Park your work',
  sentence: 'Stash saves unfinished changes for later.',
  bullets: ['...', '...'],
  tryIt: 'git stash',
  view: 'terminal',            // 'terminal' | 'timeline' | 'title' | 'challenge'
  lane: 'main',                // 'branch' puts its rail node on the lower coral lane
  hash: '4d5e6f7',             // fake hash under the rail node
  into: 'slide',               // optional: slide | drop | split | converge | launch | zoom
  steps: [
    { cmd: 'git stash', output: ['Saved working directory'], op: { type: 'none' } },
  ],
  drawer: { commands: ['git stash'], mistakes: [{ title: '...', fix: '...' }, { title: '...', fix: '...' }], happening: '...' },
}
```

A step's `op` is one of `init`, `commit`, `createBranch`, `switchBranch`, `merge`, `deleteBranch`, `addRemote`, `push`, `none` (or an array of them). The repo state carries over between cards in order, and the graph is rebuilt by replaying ops (`src/engine/reducer.ts`), so deep links, back, and replay all work.

Drawer commands can be OS-aware: `{ byOS: { windows: '...', macos: '...', linux: '...' } }`.

## Change colours

All colours are CSS variables in `src/theme.css`. `--u` there is the scale unit (about 1vw on a 16:9 screen) that all sizes derive from.

## Structure

```
src/cards.ts          all content
src/theme.css         all colours + fonts + scale unit
src/styles.css        layout
src/os.ts             OS detection, prompts, install text
src/engine/           types, pure reducer, replay
src/components/       Card, Terminal, Graph, Rail, Drawer, OSPicker, Transitions, Panels
```
