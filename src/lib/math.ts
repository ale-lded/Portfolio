export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

/** Hermite smoothstep between edges a and b. */
export const sstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Quadratic Bézier on one axis. */
export const bezier = (a: number, control: number, b: number, t: number) =>
  (1 - t) * (1 - t) * a + 2 * (1 - t) * t * control + t * t * b
