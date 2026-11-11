import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'

/**
 * A card with a back: it turns edge-on, swaps the faces out of sight, and turns back.
 * The back lies over the front (position: absolute), so it has only the front's height;
 * where it holds more (a narrow phone, a longer language), the card grows to fit it while
 * it is turned over. The focus follows the face that is showing.
 *
 * Wire the refs to: the card, the button that turns it (front), and the back's first
 * focusable element (a heading with tabIndex={-1} does). The back needs `backClass`.
 */
export function useFlip<C extends HTMLElement = HTMLLIElement, B extends HTMLElement = HTMLParagraphElement>(backClass: string) {
  const [flipped, setFlipped] = useState(false)
  const card = useRef<C>(null)
  const openButton = useRef<HTMLButtonElement>(null)
  const backStart = useRef<B>(null)

  const fitBack = (toBack: boolean) => {
    const el = card.current
    const backFace = el?.querySelector<HTMLElement>(`.${backClass}`)
    if (!el || !backFace) return
    el.style.minHeight = ''
    // min-height counts the border too, clientHeight does not
    const border = el.offsetHeight - el.clientHeight
    if (toBack && backFace.scrollHeight > el.clientHeight) el.style.minHeight = `${backFace.scrollHeight + border}px`
  }

  const flip = async (to: boolean) => {
    const el = card.current
    const focus = () => (to ? backStart.current : openButton.current)?.focus()
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fitBack(to)
      flushSync(() => setFlipped(to))
      focus()
      return
    }
    const sign = to ? 1 : -1
    // Keep whatever the card already has on (the lift of a hovered card): the turn is added
    // to it, so the card doesn't drop as it starts turning and jump back up when it lands
    const base = getComputedStyle(el).transform
    const lift = base === 'none' ? '' : `${base} `
    const edge = (deg: number) => `${lift}perspective(1400px) rotateY(${deg}deg)`
    await el.animate([{ transform: edge(0) }, { transform: edge(90 * sign) }], {
      duration: 280,
      easing: 'cubic-bezier(0.5, 0, 0.9, 0.5)',
    }).finished
    fitBack(to)
    flushSync(() => setFlipped(to))
    focus()
    el.animate([{ transform: edge(-90 * sign) }, { transform: edge(0) }], {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.15)',
    })
  }

  return { flipped, flip, card, openButton, backStart }
}
