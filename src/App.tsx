import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cards } from './cards'
import { Card } from './components/Card'
import { Drawer } from './components/Drawer'
import { PickerOverlay } from './components/OSPicker'
import { Rail } from './components/Rail'
import { RAIL_DELAY, Stage, type Kind, type Trans } from './components/Transitions'
import { planFrames, movesFor, sceneOf } from './engine/stack'
import type { OS } from './engine/types'
import { OSContext, detectOS, loadOS, saveOS } from './os'
import { DetailsOverlay } from './components/DetailsModal'
import { setDetailsOpener, useUserDetails } from './userDetails'

interface S {
  card: number
  done: number
  applied: number
  playing: boolean
  instant: boolean
  trans: Trans
}

const last = cards.length - 1
const fromHash = () => {
  const id = window.location.hash.replace(/^#\/?/, '')
  const i = cards.findIndex((c) => c.id === id)
  return i < 0 ? 0 : i
}

/** Everything the Stage needs to move from one card to another (single-card or stack motion). */
function buildTrans(id: number, from: number, to: number, fromDone: number): Trans {
  const dir: 1 | -1 = to > from ? 1 : -1
  const sf = sceneOf(cards[from])
  const st = sceneOf(cards[to])
  const stacked = sf.zoomed || st.zoomed
  const base = { id, dir, from: { cardIdx: from, done: fromDone } }
  if (Math.abs(to - from) !== 1) return { ...base, kind: stacked ? 'none' : 'slide' }
  const lead = dir === 1 ? cards[to] : cards[from]
  if (stacked) {
    const kind: Kind = lead.into === 'zoomout' ? 'zoomout' : 'peel'
    return { ...base, kind, frames: planFrames(sf, st, dir), moves: movesFor(sf, st, dir) }
  }
  return { ...base, kind: lead.into ?? 'slide' }
}
export default function App() {
  const detected = useMemo(detectOS, [])
  const [os, setOSState] = useState<OS>(() => loadOS() ?? detected)
  const setOS = useCallback((o: OS) => { setOSState(o); saveOS(o) }, [])

  const [s, setS] = useState<S>(() => {
    const card = fromHash()
    return { card, done: 0, applied: 0, playing: false, instant: true, trans: { id: 0, kind: 'none', dir: 1, from: null } }
  })
  const ref = useRef(s)
  const busy = useRef(false)
  const [finishTick, setFinishTick] = useState(0)
  const onBusy = useCallback((b: boolean) => { busy.current = b }, [])
  const [drawer, setDrawer] = useState(false)
  const [picker, setPicker] = useState(false)
  const pickerRef = useRef(picker)
  pickerRef.current = picker
  const [details, setDetails] = useState(false)
  const detailsRef = useRef(details)
  detailsRef.current = details
  const afterSave = useRef<(() => void) | undefined>(undefined)
  const { filled } = useUserDetails()
  const openDetails = useCallback((after?: () => void) => { afterSave.current = after; setDetails(true) }, [])
  const closeDetails = useCallback(() => { afterSave.current = undefined; setDetails(false) }, [])
  useEffect(() => { setDetailsOpener(openDetails); return () => setDetailsOpener(null) }, [openDetails])

  const pickerSeen = useRef(false)
  useEffect(() => {
    if (cards[s.card].id === 'setup' && !pickerSeen.current) {
      pickerSeen.current = true
      setPicker(true)
    }
  }, [s.card])

  const put = (n: S) => { ref.current = n; setS(n) }

  const navTo = useCallback((idx: number, done: number) => {
    const c = ref.current
    if (idx === c.card && done === c.done) return
    put({
      card: idx, done, applied: done, playing: false, instant: true,
      trans: buildTrans(c.trans.id + 1, c.card, idx, c.applied),
    })
  }, [])

  const replay = useCallback(() => {
    const c = ref.current
    const prev = c.card - 1
    const stackCard = prev >= 0 && (sceneOf(cards[c.card]).zoomed || sceneOf(cards[prev]).zoomed)
    const trans: Trans = stackCard
      ? buildTrans(c.trans.id + 1, prev, c.card, cards[prev].steps.length)
      : { id: c.trans.id + 1, kind: 'none', dir: 1, from: null }
    put({ ...c, done: 0, applied: 0, playing: false, instant: true, trans })
  }, [])

  const advance = useCallback(() => {
    const c = ref.current
    const card = cards[c.card]
    if (busy.current) {
      // A press during a card transition only finishes that transition.
      setFinishTick((n) => n + 1)
      return
    }
    if (c.playing) {
      // First press while a step is animating just completes it.
      put({ ...c, playing: false, applied: c.done })
      return
    }
    if (c.done < card.steps.length) {
      const done = c.done + 1
      if (card.view === 'terminal') {
        put({ ...c, done, applied: c.done, playing: true, instant: false })
      } else {
        put({ ...c, done, applied: done, playing: false, instant: false })
      }
    } else if (c.card < last) navTo(c.card + 1, 0)
  }, [navTo])

  const back = useCallback(() => {
    const c = ref.current
    if (c.done > 0) {
        put({ ...c, done: c.done - 1, applied: c.done - 1, playing: false, instant: true })
    } else if (c.card > 0) navTo(c.card - 1, cards[c.card - 1].steps.length)
  }, [navTo])

  const stepDone = useCallback(() => {
    const c = ref.current
    if (!c.playing) return
    put({ ...c, playing: false, applied: c.done })
  }, [])

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      const t = e.target as HTMLElement
      if (detailsRef.current) {
        if (k === 'escape') { e.preventDefault(); closeDetails() }
        return
      }
      if (t.closest('input, textarea, select, [contenteditable]')) return
      if (pickerRef.current) {
        if (k === 'escape' || k === 'o') { e.preventDefault(); setPicker(false) }
        return
      }
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); advance() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back() }
      else if (k === 'd') setDrawer((v) => !v)
      else if (k === 'o') setPicker(true)
      else if (k === 'u') { e.preventDefault(); openDetails() }
      else if (k === 'r') replay()
      else if (k === 'escape') setDrawer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, back, replay, openDetails, closeDetails])

  // blur buttons after click so Space keeps meaning "advance"
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest('button')
      if (b) b.blur()
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  // hash <-> state
  useEffect(() => {
    const want = '#/' + cards[s.card].id
    if (window.location.hash !== want) window.location.hash = want
  }, [s.card])
  useEffect(() => {
    const onHash = () => {
      const i = fromHash()
      if (i !== ref.current.card) navTo(i, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [navTo])

  const card = cards[s.card]
  const ctx = useMemo(() => ({ os, detected, setOS, openPicker: () => setPicker(true) }), [os, detected, setOS])
  const railDelay = s.trans.dir === 1 ? RAIL_DELAY[s.trans.kind] : 0
  const atEnd = s.card === last && s.done >= card.steps.length
  const atStart = s.card === 0 && s.done === 0

  return (
    <OSContext.Provider value={ctx}>
      <div className="app">
        <Stage
          trans={s.trans}
          cur={s.card}
          finishTick={finishTick}
          onBusy={onBusy}
          renderStack={(idx, zoomed) => idx === s.card
            ? <Card cardIdx={idx} done={s.done} applied={s.applied} playing={s.playing} instant={s.instant} onStepDone={stepDone} framed={zoomed} />
            : <Card cardIdx={idx} done={0} applied={0} playing={false} instant onStepDone={() => {}} framed={zoomed} />}
          renderPrev={(f) => (
            <Card cardIdx={f.cardIdx} done={f.done} applied={f.done} playing={false} instant onStepDone={() => {}} />
          )}
        >
          <Card cardIdx={s.card} done={s.done} applied={s.applied} playing={s.playing} instant={s.instant} onStepDone={stepDone} />
        </Stage>
        <Drawer card={card} open={drawer} onClose={() => setDrawer(false)} />
        <footer className="bottom">
          <Rail cards={cards} cur={s.card} delay={railDelay} onJump={(i) => navTo(i, 0)} />
          <div className="footer-row">
            <div className="nav-btns">
              <button className="btn ghost" onClick={back} disabled={atStart}>Prev</button>
              <button className="btn" onClick={advance} disabled={atEnd}>Next</button>
            </div>
            <div className="hints">
              <button className="key" onClick={back} aria-label="Previous step">{'\u2190'}</button>
              <button className="key" onClick={advance} disabled={atEnd} aria-label="Next step">{'\u2192'}</button>
              <button className="key" onClick={() => setDrawer((v) => !v)}><b>D</b> Details</button>
              <button className="key" onClick={() => setPicker(true)}><b>O</b> Your system</button>
              <button className="key" onClick={() => openDetails()}><b>U</b> Your details<span className={'dot' + (filled ? ' on' : '')} aria-label={filled ? 'filled in' : 'empty'} /></button>
              <button className="key" onClick={replay}><b>R</b> Replay</button>
            </div>
          </div>
        </footer>
        <PickerOverlay open={picker} onClose={() => setPicker(false)} />
        <DetailsOverlay open={details} onClose={() => setDetails(false)} onSaved={() => { const f = afterSave.current; afterSave.current = undefined; f?.() }} />
      </div>
    </OSContext.Provider>
  )
}
