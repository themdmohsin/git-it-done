import { useSyncExternalStore } from 'react'
import App from './App'
import { ContribApp } from './contrib/App'
import { isInGuide } from './contrib/router'
import { WorkshopApp } from './tutorial/WorkshopApp'
import { isWorkshopHash } from './tutorial/router'

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

/**
 * The only top-level architectural seam the extra sites need: a hash-prefix switch between the
 * existing full-viewport presentation deck, the scrollable open source guide (#/learn) and the
 * hands-on tutorial (#/workshop). Both read
 * `window.location.hash` directly, so direct loads, refreshes and browser back/forward all work
 * the same way the presentation deck's own hash navigation already did.
 */
export default function Root() {
  const guide = useSyncExternalStore(subscribe, isInGuide, isInGuide)
  const tutorial = useSyncExternalStore(subscribe, isWorkshopHash, isWorkshopHash)
  if (tutorial) return <WorkshopApp />
  return guide ? <ContribApp /> : <App />
}
