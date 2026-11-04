import { useEffect, useState } from 'react'

/** How long a closing overlay stays mounted. It must be a little longer than the CSS exit animation. */
export const EXIT_MS = 260

/**
 * Keeps an overlay mounted while its CSS exit animation plays.
 * The animation itself lives in styles.css, so the page never depends on a JavaScript-driven
 * opacity animation that finishes one frame before its final style is committed.
 */
export function usePresence(open: boolean) {
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) { setMounted(true); return }
    const t = window.setTimeout(() => setMounted(false), EXIT_MS)
    return () => window.clearTimeout(t)
  }, [open])
  return { mounted: mounted || open, closing: !open }
}
