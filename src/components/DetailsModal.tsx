import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { type Errors, type Field, TOKEN_LABEL, useUserDetails } from '../userDetails'

const ROWS: { f: Field; label: string; hint: string; type?: string }[] = [
  { f: 'name', label: 'Your name', hint: 'Shown on your commits, e.g. Mohsin Ahmed' },
  { f: 'email', label: 'Your email', hint: 'Use the same one as your GitHub account' },
  { f: 'ghuser', label: 'GitHub username', hint: 'The name in your GitHub address' },
  { f: 'repo', label: 'Repository name', hint: 'Letters, digits, hyphens. Spaces become hyphens' },
]

function Form({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { details, save } = useUserDetails()
  const [draft, setDraft] = useState(details)
  const [errors, setErrors] = useState<Errors>({})
  const first = useRef<HTMLInputElement>(null)
  useEffect(() => { first.current?.focus() }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = save(draft)
    setErrors(errs)
    if (Object.keys(errs).length === 0) { onSaved(); onClose() }
  }

  return (
    <form onSubmit={submit} noValidate className="details-form">
      {ROWS.map((r, i) => (
        <label key={r.f} className="details-field">
          <span className="details-label">{r.label}</span>
          <input
            ref={i === 0 ? first : undefined}
            className="details-input"
            value={draft[r.f]}
            onChange={(e) => setDraft({ ...draft, [r.f]: e.target.value })}
            placeholder={TOKEN_LABEL[r.f]}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!errors[r.f]}
          />
          {errors[r.f]
            ? <span className="details-msg bad" role="alert">{errors[r.f]}</span>
            : <span className="details-msg">{r.hint}</span>}
        </label>
      ))}
      <div className="details-actions">
        <button type="submit" className="btn">Save</button>
        <span className="details-safe">Stays on this computer. Nothing is sent anywhere.</span>
      </div>
    </form>
  )
}

export function DetailsOverlay({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
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
            className="overlay-box details-box"
            role="dialog"
            aria-label="Your details"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="kicker">YOUR DETAILS</div>
            <h2>Fill in your commands</h2>
            <Form onClose={onClose} onSaved={onSaved} />
            <p className="muted small">Esc to close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
