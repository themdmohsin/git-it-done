import { useSyncExternalStore } from 'react'

/** The hands-on tutorial lives under #/workshop (overview) and #/workshop/1 ... #/workshop/9 (stages). */
export const WORKSHOP_PREFIX = '#/workshop'

export const isWorkshopHash = (hash: string = window.location.hash) => hash === WORKSHOP_PREFIX || hash.startsWith(WORKSHOP_PREFIX + '/')

/** '' = overview, '3' = stage 3. */
export function workshopSlug(hash: string = window.location.hash): string {
  if (!isWorkshopHash(hash)) return ''
  return hash.slice(WORKSHOP_PREFIX.length).replace(/^\/+/, '').replace(/\/+$/, '')
}

export const workshopHref = (slug = '') => (slug ? `${WORKSHOP_PREFIX}/${slug}` : WORKSHOP_PREFIX)

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useWorkshopSlug(): string {
  return useSyncExternalStore(subscribe, () => workshopSlug(), () => workshopSlug())
}
