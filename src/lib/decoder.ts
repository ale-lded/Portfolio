import { hash2 } from './random'

/**
 * Reveals an element's text left to right out of amber binary digits.
 * The real text stays available to screen readers in a visually hidden copy.
 */
export class Decoder {
  private text: string
  private resolved: HTMLSpanElement
  private bits: HTMLSpanElement
  private ghost: HTMLSpanElement
  private key = ''
  private seed: number

  constructor(el: HTMLElement, seed: number) {
    // The source text lives in data-decode, so constructing twice on the same element is harmless
    this.text = el.dataset.decode || el.textContent || ''
    this.seed = seed
    el.textContent = ''
    const sr = document.createElement('span')
    sr.className = 'sr-only'
    sr.textContent = this.text
    const visual = document.createElement('span')
    visual.setAttribute('aria-hidden', 'true')
    this.resolved = document.createElement('span')
    this.bits = document.createElement('span')
    this.bits.className = 'decode__bits'
    this.ghost = document.createElement('span')
    this.ghost.className = 'decode__ghost'
    visual.append(this.resolved, this.bits, this.ghost)
    el.append(sr, visual)
    this.update(0, 0)
  }

  /** d: 0 hidden → 1 fully readable. p only drives the flicker of the digits. */
  update(d: number, p: number) {
    const L = this.text.length
    const res = Math.floor(d * L)
    const scramble = d <= 0 ? 0 : Math.min(L - res, Math.ceil(L * 0.3))
    const flicker = scramble ? Math.floor(p * 120) : 0
    const key = `${res}|${scramble}|${flicker}`
    if (key === this.key) return
    this.key = key
    let bits = ''
    for (let j = res; j < res + scramble; j++) {
      bits += this.text[j] === ' ' ? ' ' : hash2(this.seed * 997 + j, flicker) & 1 ? '1' : '0'
    }
    this.resolved.textContent = this.text.slice(0, res)
    this.bits.textContent = bits
    this.ghost.textContent = this.text.slice(res + scramble)
  }

  /** Puts the original text back (used by the static, reduced-motion layout). */
  finish() {
    this.update(1, 0)
  }
}
