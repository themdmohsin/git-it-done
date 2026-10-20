import { motion } from 'framer-motion'
import type { Card, CmdText } from '../engine/types'
import { INSTALL, OPEN_TERMINAL, OS_LIST, useOS } from '../os'
import { CopyButton } from './Copy'

export function Drawer({ card, open, onClose }: { card: Card; open: boolean; onClose: () => void }) {
  const { os } = useOS()
  const d = card.drawer
  const resolve = (c: CmdText) => (typeof c === 'string' ? c : c.byOS[os])
  const osLabel = OS_LIST.find((o) => o.id === os)!.label
  return (
    <motion.aside
      className="drawer"
      aria-hidden={!open}
      initial={false}
      animate={open ? { x: 0, visibility: 'visible' } : { x: '104%', transitionEnd: { visibility: 'hidden' } }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <div className="drawer-head">
        <div className="kicker">DETAILS · {card.kicker}</div>
        <button className="x-btn" onClick={onClose} aria-label="Close details">Close</button>
      </div>

      <section>
        <h3>Your terminal ({osLabel})</h3>
        <p>Open it: <strong>{OPEN_TERMINAL[os]}</strong></p>
        {d.install && INSTALL[os].map((i) => (
          <div key={i.cmd}>
            <p className="muted">{i.text}</p>
            <div className="cmd-row"><code>{i.cmd}</code><CopyButton text={i.cmd} /></div>
          </div>
        ))}
      </section>

      <section>
        <h3>Copy-paste commands</h3>
        {d.commands.map((c) => {
          const text = resolve(c)
          return <div className="cmd-row" key={text}><code>{text}</code><CopyButton text={text} /></div>
        })}
      </section>

      <section>
        <h3>Common mistakes</h3>
        {d.mistakes.map((m) => (
          <div className="mistake" key={m.title}>
            <strong>{m.title}</strong>
            <p>{m.fix}</p>
          </div>
        ))}
      </section>

      <section>
        <h3>What's actually happening</h3>
        <p>{d.happening}</p>
      </section>
    </motion.aside>
  )
}
