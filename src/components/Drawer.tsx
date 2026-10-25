import { motion } from 'framer-motion'
import type { Card, CmdText } from '../engine/types'
import { INSTALL, OPEN_TERMINAL, OS_LIST, useOS } from '../os'
import { Cmd, CopyButton } from './Copy'
import { missing, useUserDetails } from '../userDetails'

export function Drawer({ card, open, onClose }: { card: Card; open: boolean; onClose: () => void }) {
  const { os } = useOS()
  const { details } = useUserDetails()
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

      {(d.install || d.commands?.length) && (
        <section>
          <h3>Your terminal ({osLabel})</h3>
          <p>Open it: <strong>{OPEN_TERMINAL[os]}</strong></p>
          {d.install && INSTALL[os].map((i) => (
            <div key={i.cmd}>
              <p className="muted">{i.text}</p>
              <div className="cmd-row"><code><Cmd text={i.cmd} /></code><CopyButton text={i.cmd} /></div>
            </div>
          ))}
        </section>
      )}

      {!!d.commands?.length && (
        <section>
          <h3>Copy-paste commands</h3>
          {d.commands.some((c) => missing(resolve(c), details)) && <p className="drawer-banner">Add your details once (press U) and every command fills in for you.</p>}
          {d.commands.map((c) => {
            const text = resolve(c)
            return <div className="cmd-row" key={text}><code><Cmd text={text} /></code><CopyButton text={text} /></div>
          })}
        </section>
      )}

      {!!d.mistakes?.length && (
        <section>
          <h3>Common mistakes</h3>
          {d.mistakes.map((m) => (
            <div className="mistake" key={m.title}>
              <strong>{m.title}</strong>
              <p>{m.fix}</p>
            </div>
          ))}
        </section>
      )}

      <section>
        <h3>In plain English</h3>
        <p>{d.happening}</p>
      </section>

      {!!d.talking?.length && (
        <section>
          <h3>Talking points</h3>
          <ul className="talking">
            {d.talking.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
      )}    </motion.aside>
  )
}
