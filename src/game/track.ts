/**
 * The circuit: a closed Catmull-Rom curve through a few control points, sampled into
 * a dense polyline. Everything else (where the car is, how far round it has gone,
 * whether it is on the grass) is a lookup against those samples.
 *
 * World units are px at zoom 1. The track runs clockwise on screen.
 */

export type Vec = { x: number; y: number }

/** Half the width of the tarmac. */
export const HALF_WIDTH = 62
/** Beyond the tarmac there is this much grass, then a wall. */
export const RUNOFF = 70

/**
 * Control points, in driving order. Checked when they were drawn:
 * - sections of the track stay over 2 × (HALF_WIDTH + RUNOFF) apart (≥ 520 px), so
 *   their walls never overlap, the nearest sample is always the right one and the
 *   circuit can't be cut;
 * - no corner is tighter than HALF_WIDTH + RUNOFF in radius (≥ 140 px), so the inner
 *   wall never folds over itself.
 */
const POINTS: Vec[] = [
  { x: 700, y: 1750 }, // start / finish straight, heading right
  { x: 1500, y: 1760 },
  { x: 2250, y: 1720 },
  { x: 2700, y: 1540 }, // long right-hander
  { x: 2860, y: 1150 },
  { x: 2800, y: 700 },
  { x: 2620, y: 380 }, // hairpin
  { x: 2330, y: 330 },
  { x: 2160, y: 520 },
  { x: 2200, y: 860 }, // back toward the middle
  { x: 2000, y: 1140 },
  { x: 1780, y: 1200 }, // chicane
  { x: 1500, y: 1080 },
  { x: 1220, y: 1200 },
  { x: 1000, y: 1150 },
  { x: 880, y: 800 }, // fast sweep up the left
  { x: 900, y: 480 },
  { x: 680, y: 260 },
  { x: 380, y: 330 },
  { x: 250, y: 800 }, // down the left side
  { x: 280, y: 1350 },
  { x: 420, y: 1660 },
]

/** Samples along the centreline. */
const SAMPLES = 900

export type Track = {
  /** Centreline samples */
  pts: Vec[]
  /** Unit tangent and left normal at each sample */
  tan: Vec[]
  nrm: Vec[]
  /** Arc length at each sample, and the total */
  len: number[]
  length: number
  /** World bounds, with the wall included */
  bounds: { x: number; y: number; w: number; h: number }
}

/** Centripetal Catmull-Rom between p1 and p2. */
function catmull(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const t2 = t * t
  const t3 = t2 * t
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) }
}

export function buildTrack(points = POINTS): Track {
  const n = points.length
  // Sample densely, then resample by arc length so samples are evenly spaced
  const dense: Vec[] = []
  const per = 60
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    for (let k = 0; k < per; k++) dense.push(catmull(p0, p1, p2, p3, k / per))
  }
  const denseLen = [0]
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1]
    const b = dense[i % dense.length]
    denseLen.push(denseLen[i - 1] + Math.hypot(b.x - a.x, b.y - a.y))
  }
  const total = denseLen[dense.length]

  const pts: Vec[] = []
  let j = 0
  for (let i = 0; i < SAMPLES; i++) {
    const s = (i / SAMPLES) * total
    while (denseLen[j + 1] < s) j++
    const a = dense[j]
    const b = dense[(j + 1) % dense.length]
    const u = (s - denseLen[j]) / (denseLen[j + 1] - denseLen[j] || 1)
    pts.push({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u })
  }

  const tan: Vec[] = []
  const nrm: Vec[] = []
  for (let i = 0; i < SAMPLES; i++) {
    const a = pts[(i - 1 + SAMPLES) % SAMPLES]
    const b = pts[(i + 1) % SAMPLES]
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const t = { x: (b.x - a.x) / l, y: (b.y - a.y) / l }
    tan.push(t)
    // Left of the direction of travel (y points down on screen)
    nrm.push({ x: t.y, y: -t.x })
  }

  const len = pts.map((_, i) => (i / SAMPLES) * total)

  const pad = HALF_WIDTH + RUNOFF + 120
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  return {
    pts,
    tan,
    nrm,
    len,
    length: total,
    bounds: { x: minX, y: minY, w: Math.max(...xs) + pad - minX, h: Math.max(...ys) + pad - minY },
  }
}

export type TrackHit = {
  /** Nearest sample */
  index: number
  /** Signed distance from the centreline, positive to the left */
  offset: number
  /** The closest point on the centreline */
  point: Vec
}

/**
 * Where a point is relative to the track: the nearest segment of the centreline,
 * projected exactly, so the offset doesn't jump from sample to sample.
 */
export function locate(track: Track, x: number, y: number): TrackHit {
  const { pts } = track
  const n = pts.length
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  // Refine on the two segments around the nearest sample
  let point = pts[best]
  let index = best
  let nearest = bestD
  for (const [i0, i1] of [
    [(best - 1 + n) % n, best],
    [best, (best + 1) % n],
  ]) {
    const a = pts[i0]
    const b = pts[i1]
    const abx = b.x - a.x
    const aby = b.y - a.y
    const u = Math.max(0, Math.min(1, ((x - a.x) * abx + (y - a.y) * aby) / (abx * abx + aby * aby || 1)))
    const q = { x: a.x + abx * u, y: a.y + aby * u }
    const d = (q.x - x) * (q.x - x) + (q.y - y) * (q.y - y)
    if (d < nearest) {
      nearest = d
      point = q
      index = u < 0.5 ? i0 : i1
    }
  }
  const nv = track.nrm[index]
  const offset = (x - point.x) * nv.x + (y - point.y) * nv.y
  return { index, offset, point }
}

/** A polyline running parallel to the centreline, at a signed offset (positive = left). */
export function offsetLine(track: Track, offset: number): Vec[] {
  return track.pts.map((p, i) => ({ x: p.x + track.nrm[i].x * offset, y: p.y + track.nrm[i].y * offset }))
}
