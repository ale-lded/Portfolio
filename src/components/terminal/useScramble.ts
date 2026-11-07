import { useEffect, useState } from 'react'

const GLYPHS = '01<>/\\|#%&*+=?$ABCDEFXZ'

/**
 * Types `text` out left to right, with a band of random glyphs running ahead of it, like a
 * terminal resolving a signal. `runId` replays it for the same text; reduced motion skips it.
 */
export function useScramble(text: string, runId: number, reduced: boolean) {
  /** Tagged with the run it belongs to, so a new run never flashes the previous result */
  const [shown, setShown] = useState({ runId: -1, text: '' })
  const animate = !reduced && text.length > 0

  useEffect(() => {
    if (!animate) return
    const duration = Math.min(1100, 260 + text.length * 9)
    const band = 10
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const solved = Math.floor(p * text.length)
      let out = text.slice(0, solved)
      for (let i = solved; i < Math.min(text.length, solved + band); i++) {
        out += /\s/.test(text[i]) ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setShown({ runId, text: out })
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, runId, animate])

  if (!animate) return text
  return shown.runId === runId ? shown.text : ''
}
