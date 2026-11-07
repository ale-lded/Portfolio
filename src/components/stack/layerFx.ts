import { clamp, lerp, sstep } from '../../lib/math'
import type { Point } from './project'
import { PixelDissolve } from './pixelDissolve'
import { readWarp } from './timeline'

/**
 * The choreographies of the exploded view: how each plate moves and how its text
 * gets into the panel on the left. Everything is a pure function of the layer's
 * local progress t (0 → 1, see layerT in timeline.ts), so it all plays backwards.
 *
 * - fly:   the plate slides out, its title lifts off the card and flies into the
 *          panel; on the way out the text crumbles into pixels, like the hero.
 * - stand: the plate leaves the stack and stands up in front of it, facing the
 *          viewer; the title flies out of it to the panel, then back in before the
 *          plate lies down and returns to its place.
 *
 * Every plate moves relative to its own place in the stack; the rest of the stack
 * never moves for a single layer.
 */
export type LayerStyle = 'fly' | 'stand'

export type LayerFx = {
  style: LayerStyle
  /** fly only: how far the plate slides along its own x axis, as a fraction of its width (negative = left) */
  slide?: number
}

/** Which choreography each layer plays, top to bottom: 3 mirrors 1, 4 mirrors 2. */
export const LAYER_FX: LayerFx[] = [
  { style: 'fly', slide: 0.16 },
  { style: 'stand' },
  // Half the card out on its left, so the layers above don't hide it
  { style: 'fly', slide: -0.5 },
  { style: 'stand' },
]

export const LAYER_STYLES: LayerStyle[] = LAYER_FX.map((fx) => fx.style)

/** The span of choreography time in which the card is readable (text fully in the panel). */
const READABLE: Record<LayerStyle, [number, number]> = {
  fly: [0.42, 0.72],
  stand: [0.46, 0.6],
}

/** Choreography time for a layer at scroll-local progress u: short way in, long read, short way out. */
export const layerTime = (style: LayerStyle, u: number) => readWarp(u, ...READABLE[style])

export type PlateMove = {
  /** Along the plate's own x axis, px */
  slide: number
  /** Toward the camera along the stack's axis, px */
  lift: number
  /** 0 → 1: how much the plate turns to face the viewer */
  face: number
  /** 0 → 1: how far the plate has left the stack (its pillars fade out) */
  detach: number
  /** 0 → 1: how far the plate has travelled to its spot in front of the camera */
  stand: number
}

/**
 * Where the first standing plate ends up, in camera space, as fractions of the plate
 * width. Lower standing plates stand up the same way, shifted by their own place in
 * the stack (see StackStage).
 */
export const STAND_SPOT = { x: -0.12, y: 0, depth: 0.8 } as const

/** Extra motion of a plate on top of its place in the stack. */
export function plateMove(fx: LayerFx, t: number, W: number, H: number): PlateMove {
  if (fx.style === 'stand') {
    // Out of the pile first, then up; on the way back the same in reverse
    const out = sstep(0, 0.12, t) * (1 - sstep(0.86, 1, t))
    const up = sstep(0.08, 0.24, t) * (1 - sstep(0.74, 0.9, t))
    return { slide: -out * W * 0.55, lift: out * H * 0.1, face: up, detach: out, stand: up }
  }
  const inOut = sstep(0, 0.28, t) * (1 - sstep(0.72, 1, t))
  const slide = fx.slide ?? 0.16
  // A plate that slides far out of the pile lets go of its pillars, like a standing one
  const detach = Math.abs(slide) >= 0.3 ? inOut : 0
  return { slide: inOut * W * slide, lift: inOut * H * 0.16, face: 0, detach, stand: 0 }
}

/** When the title leaves its plate and comes back, per style (fractions of t). */
const TIMING = {
  // Takes off a beat after the window opens: the previous plate is settling back meanwhile
  fly: { flyIn: [0.06, 0.34], restIn: [0.3, 0.42], restOut: null, flyBack: null, dissolveFrom: 0.72 },
  stand: { flyIn: [0.2, 0.44], restIn: [0.38, 0.47], restOut: [0.6, 0.66], flyBack: [0.62, 0.76], dissolveFrom: null },
} as const

/** Quintic ease in-out: starts gently and settles very slowly into place. */
const smootherstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/** How far the title is out of its plate: 0 on the plate → 1 in the panel. */
function flightOf(style: LayerStyle, t: number) {
  const timing = TIMING[style]
  const out = smootherstep(timing.flyIn[0], timing.flyIn[1], t)
  return timing.flyBack ? Math.min(out, 1 - sstep(timing.flyBack[0], timing.flyBack[1], t)) : out
}

/** Opacity of the title printed on the plate itself: it is gone while it is in the panel. */
export function plateNameOpacity(style: LayerStyle, t: number) {
  const timing = TIMING[style]
  const start = timing.flyIn[0]
  // "stand" swaps instantly: the flying copy starts exactly on top of it, unsquashed
  const leave = sstep(start, start + (timing.flyBack ? 0.015 : 0.1), t)
  const back = timing.flyBack ? sstep(timing.flyBack[1] - 0.04, timing.flyBack[1], t) : sstep(0.75, 0.95, t)
  return 1 - leave * (1 - back)
}

/** The two ends of the title on its plate, projected on screen: where the flight starts. */
export type FlightStart = { from: Point; to: Point }

const TEXT_COLOR = '#f2eee8'
const BODY_COLOR = '#bdb7af'
const MUTED_COLOR = '#8e8a84'

/** One layer's text panel on the left, driven by its choreography. */
export class LayerPanel {
  readonly style: LayerStyle
  private el: HTMLElement
  private count: HTMLElement
  private name: HTMLElement
  private text: HTMLElement
  private dissolve = new PixelDissolve()

  /** Measured on build, relative to the sticky viewport */
  private nameCenter: Point = { x: 0, y: 0 }
  private nameWidth = 1

  constructor(el: HTMLElement, style: LayerStyle) {
    this.el = el
    this.style = style
    this.count = el.querySelector<HTMLElement>('.stack__count')!
    this.name = el.querySelector<HTMLElement>('.stack__name')!
    this.text = el.querySelector<HTMLElement>('.stack__text')!
  }

  /** Reads where the panel's text sits at rest. Call with no transforms applied. */
  measure(origin: DOMRect) {
    for (const el of [this.el, this.name, this.count, this.text]) el.style.transform = ''
    const r = this.name.getBoundingClientRect()
    this.nameCenter = { x: r.left + r.width / 2 - origin.left, y: r.top + r.height / 2 - origin.top }
    this.nameWidth = Math.max(1, r.width)
    if (TIMING[this.style].dissolveFrom !== null) {
      this.dissolve.build(
        [
          { el: this.count, color: MUTED_COLOR, step: 1.5 },
          { el: this.name, color: TEXT_COLOR, step: 2 },
          { el: this.text, color: BODY_COLOR, step: 1.5 },
        ],
        origin,
      )
    }
  }

  /** Applies the panel for local progress t. Returns how far the text has crumbled (0 = not at all). */
  update(t: number, flight: FlightStart): number {
    const timing = TIMING[this.style]
    const f = flightOf(this.style, t)
    const d = timing.dissolveFrom === null ? 0 : clamp((t - timing.dissolveFrom) / (1 - timing.dissolveFrom))
    const intact = d > 0 ? 0 : 1

    // The title is visible from the moment it leaves the plate until it is back on it
    const nameA = (timing.flyBack ? (f > 0 ? 1 : 0) : sstep(timing.flyIn[0], timing.flyIn[0] + 0.05, t)) * intact
    let restA = sstep(timing.restIn[0], timing.restIn[1], t) * intact
    if (timing.restOut) restA *= 1 - sstep(timing.restOut[0], timing.restOut[1], t)

    if (f > 0 && f < 1) {
      const { from, to } = flight
      const cx = (from.x + to.x) / 2
      const cy = (from.y + to.y) / 2
      const dx = (cx - this.nameCenter.x) * (1 - f)
      // An arc: the title rises a little on its way over
      const dy = (cy - this.nameCenter.y) * (1 - f) - Math.sin(Math.PI * f) * 40
      const angle = Math.atan2(to.y - from.y, to.x - from.x) * (1 - f)
      const s0 = Math.hypot(to.x - from.x, to.y - from.y) / this.nameWidth
      // A plate seen from above shows its title squashed vertically; a standing one does not
      const squash = this.style === 'stand' ? 1 : 0.7
      const sx = lerp(s0, 1, f)
      const sy = lerp(s0 * squash, 1, f)
      this.name.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${angle.toFixed(4)}rad) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`
    } else {
      this.name.style.transform = ''
    }
    this.name.style.opacity = nameA.toFixed(3)

    const rise = restA < 1 ? `translateY(${((1 - restA) * 10).toFixed(2)}px)` : ''
    for (const el of [this.count, this.text]) {
      el.style.opacity = restA.toFixed(3)
      el.style.transform = rise
    }
    this.el.style.visibility = Math.max(nameA, restA) > 0.001 ? 'visible' : 'hidden'
    return d
  }

  /** Draws the crumbling text, if this panel is dissolving. */
  drawDissolve(ctx: CanvasRenderingContext2D, d: number) {
    this.dissolve.draw(ctx, d)
  }
}
