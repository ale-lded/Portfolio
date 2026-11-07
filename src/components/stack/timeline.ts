import { clamp, sstep } from '../../lib/math'

/**
 * Every moment of the stack sequence, as a fraction of the stage scroll (0 → 1).
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

/** Within a layer window: how far the entrance and the exit have gone. */
export const enterOf = (t: number) => sstep(0, 0.28, t)
export const exitOf = (t: number) => sstep(0.72, 1, t)

/** How much layer i is in focus at progress p: 0 dark → 1 lit. */
export const layerFocus = (i: number, p: number) => {
  const t = layerT(i, p)
  return enterOf(t) * (1 - exitOf(t))
}

export const STACK_PHASES: [end: number, label: string][] = [
  [0.35, '01 — Assemblaggio'],
  [0.89, '02 — Vista esplosa'],
  [0.96, '03 — Compressione'],
  [1.01, '04 — Lo stack'],
]
