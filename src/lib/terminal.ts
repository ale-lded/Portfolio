/**
 * The cipher terminal opens from the footer, but lives at the root of the app (next to
 * the backstage). A window event connects the two without threading props through.
 */
const OPEN_EVENT = 'terminal:open'

export function openTerminal() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

/** Subscribes to open requests; returns the unsubscribe function. */
export function onOpenTerminal(listener: () => void) {
  window.addEventListener(OPEN_EVENT, listener)
  return () => window.removeEventListener(OPEN_EVENT, listener)
}
