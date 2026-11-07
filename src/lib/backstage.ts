/**
 * The backstage is a second view behind the page, reached through the bug hidden in
 * the hero. It lives on its own hash, so Back returns to the stage and a reload keeps
 * you where you are. Backstage.tsx listens for popstate and plays the transitions.
 */
export const BACKSTAGE_HASH = '#dietro-le-quinte'

export const isBackstageUrl = () => window.location.hash === BACKSTAGE_HASH

/** Opens the backstage from the page, as a new history entry. */
export function enterBackstage() {
  if (isBackstageUrl()) return
  history.pushState({ backstage: true }, '', BACKSTAGE_HASH)
  window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }))
}

/** Back to the stage: the same as the browser's Back when we came from the page. */
export function leaveBackstage() {
  if (!isBackstageUrl()) return
  if (history.state?.backstage) {
    history.back()
    return
  }
  // Landed here directly: there is no stage entry to go back to, so replace this one
  history.replaceState(null, '', window.location.pathname + window.location.search)
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
}
