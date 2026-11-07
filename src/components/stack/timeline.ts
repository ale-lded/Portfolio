import { stack } from '../../content'
import { clamp, sstep } from '../../lib/math'

/**
 * Every moment of the stack sequence, as a fraction of a reference stage of
 * REFERENCE_VH (0 → 1). The real stage stretches or compresses parts of it on the
 * scroll (see ENTRANCE_SCALE, HOLD_SCALE and timelineAt).
 * Phases: 0–0.04 list · 0.04–0.35 the list folds into a pile and the layers open
 * · 0.35–0.935 exploded view, one layer at a time, all with the same choreography
 * (see layerFx.ts) · 0.935–0.98 the layers compress into one block · 0.98–1 still.
 */
export const S = {
  /** Flat list → isometric pile */
  fold: [0.04, 0.22],
  /** Each row grows from its header strip into a full plate */
  open: [0.15, 0.3],
  /** The gaps between the layers widen */
  explode: [0.27, 0.38],
  /**
   * Layer windows: layer i plays over [start + i·step, start + i·step + length].
   * Every plate stands up in the same spot, so the next one may only leave the pile
   * once the previous one is lying down again (plateMove, "up" over at t = 0.9, which
   * readWarp puts at 96.5% of the window). The windows overlap just by the last slide
   * back in, which runs parallel to the next slide out, a plate's gap apart.
   */
  layers: { start: 0.35, step: 0.145, length: 0.15 },
  /** Whole stack turns slowly while it is on screen */
  sweep: [0.12, 0.99],
  compress: [0.935, 0.98],
  introOut: [0.25, 0.33],
  outroIn: [0.965, 0.995],
} as const

/** Isometric camera: tilt back on X, turn on Z. Degrees. Perspective in px. */
export const CAMERA = { rx: 56, rzStart: -40, rzEnd: -27, perspective: 1800 } as const

/** Local progress of layer i's window: 0 before it starts, 1 once it is over. */
export const layerT = (i: number, p: number) => {
  const { start, step, length } = S.layers
  return clamp((p - (start + i * step)) / length)
}

/**
 * How a layer window is split along the scroll: the choreography up to the moment the
 * card is readable plays in the first READ_WINDOW[0] of it, the card then holds still
 * until READ_WINDOW[1], and the exit uses the rest. Short way in, long read, short way out.
 */
export const READ_WINDOW = [0.18, 0.86] as const

/**
 * Remaps scroll-local progress u to choreography time t, given the span of t in which
 * the card is readable ([r0, r1]): that span gets most of the scroll.
 */
export function readWarp(u: number, r0: number, r1: number) {
  const [a, b] = READ_WINDOW
  if (u <= a) return (u / a) * r0
  if (u >= b) return r1 + ((u - b) / (1 - b)) * (1 - r1)
  return r0 + ((u - a) / (b - a)) * (r1 - r0)
}

/** Height of the stage the timeline fractions (S) are written for. */
const REFERENCE_VH = 640

/**
 * How much scroll each part of a layer window gets, relative to the reference:
 * the entrance (plate out, title flying to the panel) is stretched so it reads as a
 * slow, fluid arrival; the reading hold is shortened; the exit (title back on the
 * plate, plate down and back in) is stretched too, so it plays at about the same pace
 * as the entrance instead of snapping shut in a fraction of a wheel step.
 */
export const ENTRANCE_SCALE = 3
export const HOLD_SCALE = 1 / 2
export const EXIT_SCALE = 4

/** Stretched or compressed spans of the reference timeline, in order and not overlapping. */
const SPANS = Array.from({ length: 4 }, (_, i) => {
  const s = S.layers.start + i * S.layers.step
  const readFrom = s + S.layers.length * READ_WINDOW[0]
  const readTo = s + S.layers.length * READ_WINDOW[1]
  // The tail of an exit overlaps the next entrance: that part takes the entrance's scale
  const exitTo = i < 3 ? s + S.layers.step : s + S.layers.length
  return [
    { from: s, to: readFrom, scale: ENTRANCE_SCALE },
    { from: readFrom, to: readTo, scale: HOLD_SCALE, hold: true },
    { from: readTo, to: exitTo, scale: EXIT_SCALE },
  ]
}).flat()

/** Real stage length relative to the reference (scroll part only, without the last screen). */
const LENGTH = 1 + SPANS.reduce((sum, span) => sum + (span.to - span.from) * (span.scale - 1), 0)

/** Real stage height, vh. */
export const STACK_VH = 100 + (REFERENCE_VH - 100) * LENGTH

/** Time on the reference timeline → scroll progress of the real stage. */
export function scrollAt(time: number) {
  let distance = time
  for (const span of SPANS) {
    if (time <= span.from) break
    distance += (Math.min(time, span.to) - span.from) * (span.scale - 1)
  }
  return distance / LENGTH
}

/** Scroll progress of the real stage → time on the reference timeline. */
export function timelineAt(scroll: number) {
  let left = clamp(scroll) * LENGTH
  let at = 0
  for (const span of SPANS) {
    if (left <= span.from - at) return at + left
    left -= span.from - at
    const length = (span.to - span.from) * span.scale
    if (left <= length) return span.from + left / span.scale
    left -= length
    at = span.to
  }
  return Math.min(1, at + left)
}

/**
 * Scroll positions (fractions of the real stage) the page snaps to: the middle of each
 * layer's reading hold, and the finished stack. See .stack__snap in Stack.css.
 */
export const SNAP_POINTS = [
  ...SPANS.filter((span) => span.hold).map((span) => scrollAt((span.from + span.to) / 2)),
  scrollAt(0.995),
]

/** Within a layer window: how far the entrance and the exit have gone. */
export const enterOf = (t: number) => sstep(0, 0.28, t)
export const exitOf = (t: number) => sstep(0.72, 1, t)

/** How much a layer is in focus at choreography time t: 0 dark → 1 lit. */
export const focusOf = (t: number) => enterOf(t) * (1 - exitOf(t))

export const STACK_PHASES: [end: number, label: string][] = [
  [0.35, stack.phases[0]],
  [0.935, stack.phases[1]],
  [0.985, stack.phases[2]],
  [1.01, stack.phases[3]],
]
