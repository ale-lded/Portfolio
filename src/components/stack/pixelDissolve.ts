import { clamp, easeOutCubic } from '../../lib/math'
import { mulberry32 } from '../../lib/random'
import { sampleText, textLinesFromElement } from '../../scene/sample'

export type DissolveSource = {
  el: HTMLElement
  color: string
  /** Sampling grid in px: smaller text needs a finer grid */
  step: number
}

const AMBER = '#ffb547'
/** Part of the dissolve during which particles keep starting, left to right */
const SWEEP = 0.45

/**
 * Turns a block of DOM text into its pixels and scatters them, the way the hero
 * crumbles. `draw(d)` is a pure function of d (0 = intact text, 1 = gone), so it
 * plays backwards when scrolling up.
 */
export class PixelDissolve {
  private n = 0
  private hx = new Float32Array(0)
  private hy = new Float32Array(0)
  private dx = new Float32Array(0)
  private dy = new Float32Array(0)
  private delay = new Float32Array(0)
  private size = new Float32Array(0)
  private color = new Uint8Array(0)
  private amber = new Uint8Array(0)
  private palette: string[] = []

  /** Samples the sources where they are laid out now, relative to `origin`. */
  build(sources: DissolveSource[], origin: DOMRect) {
    const xs: number[] = []
    const ys: number[] = []
    const sizes: number[] = []
    const colors: number[] = []
    this.palette = [...new Set([...sources.map((s) => s.color), AMBER])]
    for (const source of sources) {
      const colorIndex = this.palette.indexOf(source.color)
      for (const spec of textLinesFromElement(source.el, origin)) {
        const pts = sampleText(spec, source.step)
        for (let k = 0; k < pts.length; k += 2) {
          xs.push(pts[k])
          ys.push(pts[k + 1])
          sizes.push(source.step * 0.9)
          colors.push(colorIndex)
        }
      }
    }

    const n = (this.n = xs.length)
    this.hx = Float32Array.from(xs)
    this.hy = Float32Array.from(ys)
    this.size = Float32Array.from(sizes)
    this.color = Uint8Array.from(colors)
    this.dx = new Float32Array(n)
    this.dy = new Float32Array(n)
    this.delay = new Float32Array(n)
    this.amber = new Uint8Array(n)

    const minX = Math.min(...xs)
    const spanX = Math.max(1, Math.max(...xs) - minX)
    const rnd = mulberry32(4242)
    for (let i = 0; i < n; i++) {
      // Drift up and to the right, toward the stack the text came from
      this.dx[i] = 30 + rnd() * 110
      this.dy[i] = -(16 + rnd() * 80) + (rnd() - 0.5) * 30
      this.delay[i] = ((xs[i] - minX) / spanX) * SWEEP + rnd() * 0.06
      this.amber[i] = rnd() < 0.3 ? 1 : 0
    }
  }

  draw(ctx: CanvasRenderingContext2D, d: number) {
    if (d <= 0 || d >= 1) return
    for (let i = 0; i < this.n; i++) {
      const u = clamp((d - this.delay[i]) / (1 - SWEEP))
      if (u >= 1) continue
      const e = easeOutCubic(u)
      const s = this.size[i]
      ctx.globalAlpha = Math.pow(1 - u, 1.4)
      // Leaving pixels catch the amber light
      ctx.fillStyle = this.amber[i] && u > 0.08 ? AMBER : this.palette[this.color[i]]
      ctx.fillRect(this.hx[i] + this.dx[i] * e - s / 2, this.hy[i] + this.dy[i] * e - s / 2, s, s)
    }
    ctx.globalAlpha = 1
  }
}
