import { clamp, sstep } from '../../lib/math'

/**
 * Every moment of the stack sequence, as a fraction of a reference stage of
 * REFERENCE_VH (0 → 1). The real stage is shorter: the reading holds are compressed
 * (see HOLD_KEEP and timelineAt), everything else keeps its scroll length.
 * Phases: 0–0.04 list · 0.04–0.35 the list folds into a pile and the layers open
 * · 0.35–0.89 exploded view, one layer at a time, each with its own choreography
 * (see layerFx.ts) · 0.89–0.95 the layers compress into one block · 0.95–1 still.
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
   * They overlap a little, so the next title takes off as the previous text leaves,
   * but only once a standing plate is back in the stack.
   */
  layers: { start: 0.35, step: 0.13, length: 0.15 },
  /** Whole stack turns slowly while it is on screen */
  sweep: [0.12, 0.98],
  compress: [0.89, 0.95],
  introOut: [0.25, 0.33],
  outroIn: [0.93, 0.985],
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
 * Share of each reading hold that is kept on the scroll. Entrances, title flights and
 * exits keep their full reference length; only the time a card sits still is shortened.
 */
export const HOLD_KEEP = 2 / 3

/** The reading holds, as [from, to] on the reference timeline. Nothing else moves in them. */
const HOLDS = Array.from({ length: 4 }, (_, i) => {
  const s = S.layers.start + i * S.layers.step
  return [s + S.layers.length * READ_WINDOW[0], s + S.layers.length * READ_WINDOW[1]] as const
})

/** Fraction of the reference scroll that the compressed holds remove. */
const REMOVED = HOLDS.reduce((sum, [a, b]) => sum + (b - a) * (1 - HOLD_KEEP), 0)

/** Real stage height, vh: the reference minus what the compressed holds remove. */
export const STACK_VH = 100 + (REFERENCE_VH - 100) * (1 - REMOVED)

/** Scroll progress of the real stage → time on the reference timeline. */
export function timelineAt(scroll: number) {
  let left = clamp(scroll) * (1 - REMOVED)
  let at = 0
  for (const [a, b] of HOLDS) {
    if (left <= a - at) return at + left
    left -= a - at
    const kept = (b - a) * HOLD_KEEP
    if (left <= kept) return a + left / HOLD_KEEP
    left -= kept
    at = b
  }
  return Math.min(1, at + left)
}

/** Time on the reference timeline → scroll progress of the real stage. */
export function scrollAt(time: number) {
  let removed = 0
  for (const [a, b] of HOLDS) {
    if (time <= a) break
    removed += (Math.min(time, b) - a) * (1 - HOLD_KEEP)
  }
  return (time - removed) / (1 - REMOVED)
}

/**
 * Scroll positions (fractions of the real stage) the page snaps to: the middle of each
 * layer's reading hold, and the finished stack. See .stack__snap in Stack.css.
 */
export const SNAP_POINTS = [...HOLDS.map(([a, b]) => scrollAt((a + b) / 2)), scrollAt(0.985)]

/** Within a layer window: how far the entrance and the exit have gone. */
export const enterOf = (t: number) => sstep(0, 0.28, t)
export const exitOf = (t: number) => sstep(0.72, 1, t)

/** How much a layer is in focus at choreography time t: 0 dark → 1 lit. */
export const focusOf = (t: number) => enterOf(t) * (1 - exitOf(t))

export const STACK_PHASES: [end: number, label: string][] = [
  [0.35, '01 — Assemblaggio'],
  [0.89, '02 — Vista esplosa'],
  [0.96, '03 — Compressione'],
  [1.01, '04 — Lo stack'],
]
