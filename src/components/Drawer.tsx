import { motion } from 'framer-motion'
import type { Card, CmdText } from '../engine/types'
import { INSTALL, OPEN_TERMINAL, OS_LIST, useOS } from '../os'
import { Cmd, CopyButton } from './Copy'
import { missing, useUserDetails } from '../userDetails'
import { resolveCard } from '../osCards'

type Extra = NonNullable<Card['drawer']['sections']>[number]

const shortAddress = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

function Extras({ list }: { list: Extra[] }) {
  return (
    <>
      {list.map((s) => (
        <div key={s.title} className="drawer-sub">
          <h4>{s.title}</h4>
          {s.ordered
            ? <ol className="clicks">{s.items.map((i) => <li key={i}>{i}</li>)}</ol>
            : <ul className="drawer-list">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>}
        </div>
      ))}
    </>
  )
}

export function Drawer({ card, open, onClose }: { card: Card; open: boolean; onClose: () => void }) {
  const { os } = useOS()
  const { details } = useUserDetails()
  const d = resolveCard(card, os).drawer
  const resolve = (c: CmdText) => (typeof c === 'string' ? c : c.byOS[os])
  const osLabel = OS_LIST.find((o) => o.id === os)!.label
  const into = (where: NonNullable<Extra['into']>) => (d.sections ?? []).filter((s) => (s.into ?? 'try') === where)
  const hasTry = !!(d.install || d.commands?.length || d.clicks?.length || d.tryNext?.length || into('try').length)
  const hasWrong = !!(d.mistakes?.length || into('wrong').length)
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
        <h3>What&rsquo;s happening</h3>
        <p>{d.happening}</p>
        <Extras list={into('happening')} />
      </section>

      {hasTry && (
        <section>
          <h3>Try it yourself</h3>
          {(d.install || !!d.commands?.length) && (
            <p>Your terminal ({osLabel}): <strong>{OPEN_TERMINAL[os]}</strong></p>
          )}
          {d.install && INSTALL[os].map((i) => (
            <div key={i.cmd}>
              <p className="muted">{i.text}</p>
              <div className="cmd-row"><code><Cmd text={i.cmd} /></code><CopyButton text={i.cmd} /></div>
            </div>
          ))}
          {!!d.clicks?.length && <ol className="clicks">{d.clicks.map((t) => <li key={t}>{t}</li>)}</ol>}
          {!!d.commands?.length && (
            <div className="drawer-sub">
              <h4>Copy and paste</h4>
              {d.commands.some((c) => missing(resolve(c), details)) && <p className="drawer-banner">Add your details once (press U) and every command fills in for you.</p>}
              {d.commands.map((c, i) => {
                const text = resolve(c)
                return <div className="cmd-row" key={i + text}><code><Cmd text={text} /></code><CopyButton text={text} /></div>
              })}
            </div>
          )}
          {!!d.tryNext?.length && (
            <div className="drawer-sub">
              <h4>Try this next</h4>
              <ul className="drawer-list">{d.tryNext.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}
          <Extras list={into('try')} />
        </section>
      )}

      {hasWrong && (
        <section>
          <h3>If something goes wrong</h3>
          {d.mistakes?.map((m) => (
            <div className="mistake" key={m.title}>
              <strong>{m.title}</strong>
              <p>{m.fix}</p>
            </div>
          ))}
          <Extras list={into('wrong')} />
        </section>
      )}

      {!!d.links?.length && (
        <section>
          <h3>Learn more</h3>
          <ul className="drawer-links">
            {d.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}<span aria-hidden> &#8599;</span></a>
                <span className="addr">{shortAddress(l.url)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.aside>
  )
}

