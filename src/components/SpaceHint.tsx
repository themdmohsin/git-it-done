export type HintMode = 'steps' | 'next' | 'end'

const KEY = (name: string) => <kbd className="hint-key">{name}</kbd>

/** One quiet line at the top centre: what the next press does. Fixed position, so it never affects layout. */
export function SpaceHint({ mode, hidden }: { mode: HintMode; hidden: boolean }) {
  return (
    <div className={'space-hint' + (hidden ? ' hide' : '')} role="note" data-mode={mode}>
      <span className="sh-text" key={mode}>
        {mode === 'steps' && (
          <>
            <span className="sh-wide">Press {KEY('Space')} to see the next step</span>
            <span className="sh-narrow">Tap Next</span>
          </>
        )}
        {mode === 'next' && (
          <>
            <span className="sh-wide">Press {KEY('Space')} or the right arrow for the next card</span>
            <span className="sh-narrow">Tap Next</span>
          </>
        )}
        {mode === 'end' && (
          <>
            <span className="sh-wide">That&rsquo;s the end. Press the left arrow to go back</span>
            <span className="sh-narrow">That&rsquo;s the end. Tap Prev to go back</span>
          </>
        )}
      </span>
    </div>
  )
}
