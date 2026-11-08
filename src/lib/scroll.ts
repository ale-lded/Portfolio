const ease = (t: number) => 1 - (1 - t) ** 3

/**
 * Back to the top of the page, driven by hand rather than by the browser's smooth scroll:
 * a long smooth scroll can be cut short by the scroll stages rearranging the page as it
 * passes them, and would replay every scroll animation backwards on the way up. From far
 * down the page jumps most of the way at once, then glides the last stretch.
 */
export function scrollToTop() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    return
  }

  const glide = window.innerHeight * 1.2
  if (window.scrollY > glide) window.scrollTo({ top: glide, behavior: 'instant' })

  const from = window.scrollY
  const duration = 700
  const start = performance.now()
  let done = false

  const step = (now: number) => {
    if (done) return
    const t = Math.min((now - start) / duration, 1)
    window.scrollTo({ top: from * (1 - ease(t)), behavior: 'instant' })
    if (t < 1) requestAnimationFrame(step)
    else done = true
  }
  requestAnimationFrame(step)

  // Should the tab not be painting (frames paused), land anyway
  window.setTimeout(() => {
    if (done) return
    done = true
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, duration + 300)
}
