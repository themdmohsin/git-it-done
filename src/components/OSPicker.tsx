import { OPEN_TERMINAL, OS_LIST, useOS } from '../os'
import { usePresence } from './usePresence'

export function OSPicker({ onPick }: { onPick?: () => void }) {
  const { os, setOS, detected } = useOS()
  return (
    <div className="os-picker">
      <div className="os-buttons" role="radiogroup" aria-label="Operating system">
        {OS_LIST.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={os === o.id}
            className={'os-btn' + (os === o.id ? ' on' : '')}
            onClick={() => { setOS(o.id); onPick?.() }}
          >
            <span className="os-name">{o.label}</span>
            {detected === o.id && <span className="os-detected">detected</span>}
          </button>
        ))}
      </div>
      <p className="os-terminal">
        Open a terminal: <strong>{OPEN_TERMINAL[os]}</strong>
      </p>
    </div>
  )
}

export function PickerOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mounted, closing } = usePresence(open)
  if (!mounted) return null
  return (
    <div className={'overlay-backdrop' + (closing ? ' closing' : '')} onClick={onClose}>
      <div className="overlay-box" onClick={(e) => e.stopPropagation()}>
        <div className="kicker">YOUR SYSTEM</div>
        <h2>Pick your operating system</h2>
        <OSPicker onPick={onClose} />
        <p className="muted small">Esc or O to close</p>
      </div>
    </div>
  )
}
