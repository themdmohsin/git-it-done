import { AnimatePresence, motion } from 'framer-motion'
import { OPEN_TERMINAL, OS_LIST, useOS } from '../os'

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
            <span className="os-badge">{o.badge}</span>
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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="overlay-box"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="kicker">YOUR SYSTEM</div>
            <h2>Pick your OS</h2>
            <OSPicker onPick={onClose} />
            <p className="muted small">Esc or O to close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
