import { clamp, lerp, sstep } from '../../lib/math'
import type { Point } from './project'
import { readWarp } from './timeline'

/**
 * The choreography of the exploded view, the same for every layer: the plate leaves
 * the stack and stands up in front of it, facing the viewer; its title flies out of
 * it to the panel on the left, then back in before the plate lies down and returns
 * to its place.
 *
 * Everything is a pure function of the layer's local progress t (0 → 1, see layerT
 * in timeline.ts), so it all plays backwards. Every plate moves relative to its own
 * place in the stack; the rest of the stack never moves for a single layer.
 */

/** The span of choreography time in which the card is readable (text fully in the panel). */
const READABLE: [number, number] = [0.46, 0.6]

/** Choreography time for a layer at scroll-local progress u: short way in, long read, short way out. */
export const layerTime = (u: number) => readWarp(u, ...READABLE)

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
 * Where a standing plate ends up, in camera space, as fractions of the plate width.
 * The same spot for every layer, so each one is read in the same place.
 */
export const STAND_SPOT = { x: -0.12, y: 0, depth: 0.8 } as const

/** Extra motion of a plate on top of its place in the stack. */
export function plateMove(t: number, W: number, H: number): PlateMove {
  // Out of the pile first, then up; on the way back the same in reverse
  const out = sstep(0, 0.12, t) * (1 - sstep(0.86, 1, t))
  const up = sstep(0.08, 0.24, t) * (1 - sstep(0.74, 0.9, t))
  return { slide: -out * W * 0.55, lift: out * H * 0.1, face: up, detach: out, stand: up }
}

/** When the title leaves its plate and comes back (fractions of t). */
const TIMING = { flyIn: [0.2, 0.44], restIn: [0.38, 0.47], restOut: [0.6, 0.66], flyBack: [0.62, 0.76] } as const

/** Quintic ease in-out: starts gently and settles very slowly into place. */
const smootherstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/** How far the title is out of its plate: 0 on the plate → 1 in the panel. */
const flightOf = (t: number) =>
  Math.min(smootherstep(TIMING.flyIn[0], TIMING.flyIn[1], t), 1 - sstep(TIMING.flyBack[0], TIMING.flyBack[1], t))

/** Opacity of the title printed on the plate itself: it is gone while it is in the panel. */
export function plateNameOpacity(t: number) {
  // Swaps instantly: the flying copy starts exactly on top of it
  const leave = sstep(TIMING.flyIn[0], TIMING.flyIn[0] + 0.015, t)
  const back = sstep(TIMING.flyBack[1] - 0.04, TIMING.flyBack[1], t)
  return 1 - leave * (1 - back)
}

/** The two ends of the title on its plate, projected on screen: where the flight starts. */
export type FlightStart = { from: Point; to: Point }

/** One layer's text panel on the left, driven by its choreography. */
export class LayerPanel {
  private el: HTMLElement
  private count: HTMLElement
  private name: HTMLElement
  private text: HTMLElement

  /** Measured on build, relative to the sticky viewport */
  private nameCenter: Point = { x: 0, y: 0 }
  private nameWidth = 1

  constructor(el: HTMLElement) {
    this.el = el
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
  }

  /** Applies the panel for local progress t. */
  update(t: number, flight: FlightStart) {
    const f = flightOf(t)
    // The title is visible from the moment it leaves the plate until it is back on it
    const nameA = f > 0 ? 1 : 0
    const restA = sstep(TIMING.restIn[0], TIMING.restIn[1], t) * (1 - sstep(TIMING.restOut[0], TIMING.restOut[1], t))

    if (f > 0 && f < 1) {
      const { from, to } = flight
      const cx = (from.x + to.x) / 2
      const cy = (from.y + to.y) / 2
      const dx = (cx - this.nameCenter.x) * (1 - f)
      // An arc: the title rises a little on its way over
      const dy = (cy - this.nameCenter.y) * (1 - f) - Math.sin(Math.PI * f) * 40
      const angle = Math.atan2(to.y - from.y, to.x - from.x) * (1 - f)
      const s = lerp(Math.hypot(to.x - from.x, to.y - from.y) / this.nameWidth, 1, f)
      this.name.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${angle.toFixed(4)}rad) scale(${s.toFixed(3)})`
    } else {
      this.name.style.transform = ''
    }
    this.name.style.opacity = String(nameA)

    const rise = restA < 1 ? `translateY(${((1 - restA) * 10).toFixed(2)}px)` : ''
    for (const el of [this.count, this.text]) {
      el.style.opacity = restA.toFixed(3)
      el.style.transform = rise
    }
    this.el.style.visibility = Math.max(nameA, restA) > 0.001 ? 'visible' : 'hidden'
  }
}
