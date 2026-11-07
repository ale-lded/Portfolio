import type { Car } from './car'
import { HALF_WIDTH, offsetLine, RUNOFF, type Track, type Vec } from './track'

/**
 * Draws the race on a 2D canvas. The circuit is a dark stage: only the pool of a
 * follow-spot around the car and its headlights light it, like the beam on the page.
 * The car is the green bug from the hero, in pixel art.
 */

const COLORS = {
  ground: '#0b0b0d',
  dot: 'rgba(255, 236, 214, 0.05)',
  tarmac: '#18181c',
  edge: 'rgba(242, 238, 232, 0.55)',
  centre: 'rgba(255, 236, 214, 0.09)',
  kerbA: '#e9e2d6',
  kerbB: '#ff9a2e',
  wall: 'rgba(255, 181, 71, 0.22)',
  skid: 'rgba(0, 0, 0, 0.78)',
}

/** The car, front at the top, one cell per world pixel block (see PX). */
const SPRITE = [
  '.ggggg.',
  'wgGGGgw',
  'wgGGGgw',
  '.gdddg.',
  '.gdddg.',
  '.gGGGg.',
  'wgGGGgw',
  'wgGGGgw',
  '.rgggr.',
]
const PX = 3
const SPRITE_COLORS: Record<string, string> = {
  g: '#39ff6a',
  G: '#9dffbb',
  d: '#0c2415',
  w: '#0a0a0b',
  r: '#6e2420',
}
const BRAKE_LIGHT = '#ff4a3d'

const SKID_MAX = 2400
/** Visible width of the world in chase view, px at zoom 1 */
const VIEW = 1150

export type View = 'overview' | 'chase'

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private w = 0
  private h = 0
  private dpr = 1
  private readonly track: Track
  private readonly road: Path2D
  private readonly edges: Path2D
  private readonly walls: Path2D
  private readonly kerbs: Path2D
  private readonly mini: Vec[]
  private dots: CanvasPattern | null = null

  /** Camera, in world coordinates, with its zoom; eased toward its target every frame */
  private cam = { x: 0, y: 0, zoom: 0.3 }
  private camReady = false

  /** Skid marks: segments from the rear wheels, oldest overwritten first */
  private skids = new Float32Array(SKID_MAX * 4)
  private skidCount = 0
  private skidHead = 0
  private lastRear: [Vec, Vec] | null = null

  constructor(canvas: HTMLCanvasElement, track: Track) {
    this.ctx = canvas.getContext('2d')!
    this.track = track
    this.road = closedPath(track.pts)
    this.edges = new Path2D()
    this.edges.addPath(closedPath(offsetLine(track, HALF_WIDTH - 5)))
    this.edges.addPath(closedPath(offsetLine(track, -(HALF_WIDTH - 5))))
    this.walls = new Path2D()
    this.walls.addPath(closedPath(offsetLine(track, HALF_WIDTH + RUNOFF)))
    this.walls.addPath(closedPath(offsetLine(track, -(HALF_WIDTH + RUNOFF))))
    this.kerbs = kerbPath(track)
    this.mini = track.pts.filter((_, i) => i % 6 === 0)
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w
    this.h = h
    this.dpr = dpr
    const canvas = this.ctx.canvas
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    // A faint dot grid on the ground, so speed reads even where the track is dark
    const tile = document.createElement('canvas')
    tile.width = tile.height = 48
    const t = tile.getContext('2d')!
    t.fillStyle = COLORS.dot
    t.fillRect(23, 23, 2, 2)
    this.dots = this.ctx.createPattern(tile, 'repeat')
  }

  clearSkids() {
    this.skidCount = 0
    this.skidHead = 0
    this.lastRear = null
  }

  /** Jumps the camera to where it would settle (no easing in). */
  snap(car: Car | null, view: View) {
    const t = this.target(car, view)
    this.cam = { ...t }
    this.camReady = true
  }

  draw(car: Car | null, view: View, dt: number, opts: { lights?: number } = {}) {
    const { ctx, w, h } = this
    if (!w || !h) return
    if (car) this.addSkids(car)

    // Camera: ease toward the target; a knock against the wall shakes it
    const t = this.target(car, view)
    if (!this.camReady) this.snap(car, view)
    const k = 1 - Math.exp(-dt * (view === 'chase' ? 5 : 2.2))
    this.cam.x += (t.x - this.cam.x) * k
    this.cam.y += (t.y - this.cam.y) * k
    this.cam.zoom += (t.zoom - this.cam.zoom) * (1 - Math.exp(-dt * 2.5))
    let sx = 0
    let sy = 0
    if (car && car.sinceWall < 0.3) {
      const a = 7 * (1 - car.sinceWall / 0.3)
      sx = (Math.random() - 0.5) * a
      sy = (Math.random() - 0.5) * a
    }

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.fillStyle = COLORS.ground
    ctx.fillRect(0, 0, w, h)

    // World
    const z = this.cam.zoom
    ctx.setTransform(this.dpr * z, 0, 0, this.dpr * z, this.dpr * (w / 2 - this.cam.x * z + sx), this.dpr * (h / 2 - this.cam.y * z + sy))
    if (this.dots) {
      ctx.fillStyle = this.dots
      const b = this.track.bounds
      ctx.fillRect(b.x, b.y, b.w, b.h)
    }
    this.drawTrack()
    this.drawSkids()
    if (car) this.drawCar(car)

    // The stage lighting, in screen space
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    const lights = opts.lights ?? 1
    if (car) {
      const px = w / 2 + (car.x - this.cam.x) * z + sx
      const py = h / 2 + (car.y - this.cam.y) * z + sy
      this.drawLighting(car, px, py, z, lights)
    } else {
      // Overview: the whole circuit under a soft, even light
      ctx.fillStyle = 'rgba(4, 4, 6, 0.25)'
      ctx.fillRect(0, 0, w, h)
    }
    if (view === 'chase' && car) this.drawMinimap(car)
  }

  private target(car: Car | null, view: View) {
    const b = this.track.bounds
    if (view === 'overview' || !car) {
      const zoom = Math.min(this.w / b.w, this.h / b.h) * 0.98
      return { x: b.x + b.w / 2, y: b.y + b.h / 2, zoom }
    }
    // Look ahead along the velocity, and pull back a little at speed
    const hx = Math.cos(car.heading)
    const hy = Math.sin(car.heading)
    const vx = hx * car.forward - hy * car.lateral
    const vy = hy * car.forward + hx * car.lateral
    const speed = Math.min(1, car.speed() / car.setup.vmax)
    const zoom = (Math.min(this.w, this.h * 1.6) / VIEW) * (1 - 0.16 * speed)
    return { x: car.x + vx * 0.42, y: car.y + vy * 0.42, zoom }
  }

  private drawTrack() {
    const { ctx } = this
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    // Walls: thin lines of stage tape at the edge of the run-off
    ctx.strokeStyle = COLORS.wall
    ctx.lineWidth = 3
    ctx.setLineDash([22, 14])
    ctx.stroke(this.walls)
    ctx.setLineDash([])

    ctx.strokeStyle = COLORS.tarmac
    ctx.lineWidth = HALF_WIDTH * 2
    ctx.stroke(this.road)

    ctx.strokeStyle = COLORS.kerbA
    ctx.lineWidth = 8
    ctx.stroke(this.kerbs)
    ctx.strokeStyle = COLORS.kerbB
    ctx.setLineDash([14, 14])
    ctx.stroke(this.kerbs)

    ctx.strokeStyle = COLORS.centre
    ctx.lineWidth = 3
    ctx.setLineDash([26, 30])
    ctx.stroke(this.road)
    ctx.setLineDash([])

    ctx.strokeStyle = COLORS.edge
    ctx.lineWidth = 2.5
    ctx.stroke(this.edges)

    this.drawStartLine()
  }

  /** A chequered strip across the track at sample 0. */
  private drawStartLine() {
    const { ctx, track } = this
    const p = track.pts[0]
    const ang = Math.atan2(track.tan[0].y, track.tan[0].x)
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(ang)
    const cell = 12
    const rows = Math.ceil((HALF_WIDTH * 2) / cell)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        ctx.fillStyle = (r + c) % 2 ? '#0d0d0f' : '#efe9df'
        ctx.fillRect(-cell + c * cell, -HALF_WIDTH + r * cell, cell, Math.min(cell, HALF_WIDTH * 2 - r * cell))
      }
    }
    ctx.restore()
  }

  private rearWheels(car: Car): [Vec, Vec] {
    const hx = Math.cos(car.heading)
    const hy = Math.sin(car.heading)
    const back = -PX * 3
    const side = PX * 3
    const cx = car.x + hx * back
    const cy = car.y + hy * back
    return [
      { x: cx - hy * side, y: cy + hx * side },
      { x: cx + hy * side, y: cy - hx * side },
    ]
  }

  private addSkids(car: Car) {
    const rear = this.rearWheels(car)
    const marking = car.skid > 0 || (car.braking && car.forward > 200)
    if (marking && this.lastRear) {
      for (let k = 0; k < 2; k++) {
        const a = this.lastRear[k]
        const b = rear[k]
        if (Math.hypot(b.x - a.x, b.y - a.y) > 40) continue
        const o = this.skidHead * 4
        this.skids[o] = a.x
        this.skids[o + 1] = a.y
        this.skids[o + 2] = b.x
        this.skids[o + 3] = b.y
        this.skidHead = (this.skidHead + 1) % SKID_MAX
        this.skidCount = Math.min(SKID_MAX, this.skidCount + 1)
      }
    }
    this.lastRear = rear
  }

  private drawSkids() {
    if (!this.skidCount) return
    const { ctx } = this
    ctx.beginPath()
    for (let i = 0; i < this.skidCount; i++) {
      const o = i * 4
      ctx.moveTo(this.skids[o], this.skids[o + 1])
      ctx.lineTo(this.skids[o + 2], this.skids[o + 3])
    }
    ctx.strokeStyle = COLORS.skid
    ctx.lineWidth = 4
    ctx.lineCap = 'butt'
    ctx.stroke()
  }

  private drawCar(car: Car) {
    const { ctx } = this
    ctx.save()
    ctx.translate(car.x, car.y)
    // A soft green glow under the bug
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 34)
    glow.addColorStop(0, 'rgba(57, 255, 106, 0.22)')
    glow.addColorStop(1, 'rgba(57, 255, 106, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(-34, -34, 68, 68)

    // Sprite rows run front to back: turn it so its front points along the heading
    ctx.rotate(car.heading + Math.PI / 2)
    const rows = SPRITE.length
    const cols = SPRITE[0].length
    const ox = (-cols * PX) / 2
    const oy = (-rows * PX) / 2
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = SPRITE[r][c]
        if (ch === '.') continue
        ctx.fillStyle = ch === 'r' && car.braking ? BRAKE_LIGHT : SPRITE_COLORS[ch]
        ctx.fillRect(ox + c * PX, oy + r * PX, PX + 0.3, PX + 0.3)
      }
    }
    ctx.restore()
  }

  private drawLighting(car: Car, px: number, py: number, z: number, lights: number) {
    const { ctx, w, h } = this
    // Darkness everywhere but the pool of the follow-spot
    const inner = Math.min(w, h) * 0.16
    const outer = Math.max(w, h) * 0.72
    const dark = ctx.createRadialGradient(px, py, inner, px, py, outer)
    dark.addColorStop(0, 'rgba(3, 3, 5, 0)')
    dark.addColorStop(0.45, `rgba(3, 3, 5, ${0.5 * lights})`)
    dark.addColorStop(1, `rgba(3, 3, 5, ${0.86 * lights})`)
    ctx.fillStyle = dark
    ctx.fillRect(0, 0, w, h)

    ctx.globalCompositeOperation = 'lighter'
    // The warm pool itself
    const pool = ctx.createRadialGradient(px, py, 0, px, py, inner * 1.6)
    pool.addColorStop(0, 'rgba(255, 176, 90, 0.10)')
    pool.addColorStop(1, 'rgba(255, 176, 90, 0)')
    ctx.fillStyle = pool
    ctx.fillRect(0, 0, w, h)

    // Headlights: a cone ahead of the car, so the next corner shows up in time
    const reach = 340 * z
    const spread = 0.42
    const hx = Math.cos(car.heading)
    const hy = Math.sin(car.heading)
    const fx = px + hx * 12 * z
    const fy = py + hy * 12 * z
    const beam = ctx.createRadialGradient(fx, fy, 0, fx, fy, reach)
    beam.addColorStop(0, 'rgba(255, 236, 200, 0.16)')
    beam.addColorStop(1, 'rgba(255, 236, 200, 0)')
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.moveTo(fx, fy)
    ctx.arc(fx, fy, reach, car.heading - spread, car.heading + spread)
    ctx.closePath()
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }

  private drawMinimap(car: Car) {
    const { ctx, w } = this
    const b = this.track.bounds
    const mw = Math.min(190, w * 0.2)
    const s = mw / b.w
    const mh = b.h * s
    const x0 = w - mw - 18
    const y0 = 18
    ctx.save()
    ctx.fillStyle = 'rgba(10, 10, 12, 0.7)'
    ctx.fillRect(x0 - 8, y0 - 8, mw + 16, mh + 16)
    ctx.beginPath()
    this.mini.forEach((p, i) => {
      const mx = x0 + (p.x - b.x) * s
      const my = y0 + (p.y - b.y) * s
      if (i) ctx.lineTo(mx, my)
      else ctx.moveTo(mx, my)
    })
    ctx.closePath()
    ctx.strokeStyle = 'rgba(255, 236, 214, 0.35)'
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.stroke()
    const st = this.track.pts[0]
    ctx.fillStyle = '#efe9df'
    ctx.fillRect(x0 + (st.x - b.x) * s - 1.5, y0 + (st.y - b.y) * s - 4, 3, 8)
    ctx.fillStyle = '#39ff6a'
    ctx.shadowColor = '#39ff6a'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(x0 + (car.x - b.x) * s, y0 + (car.y - b.y) * s, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function closedPath(pts: Vec[]) {
  const p = new Path2D()
  pts.forEach((q, i) => (i ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y)))
  p.closePath()
  return p
}

/** Kerbs on both edges, only through the corners (where the track turns sharply). */
function kerbPath(track: Track) {
  const n = track.pts.length
  const corner: boolean[] = []
  for (let i = 0; i < n; i++) {
    const a = track.tan[(i - 4 + n) % n]
    const b = track.tan[(i + 4) % n]
    const turn = Math.abs(Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y))
    corner.push(turn > 0.07)
  }
  // Grow each corner a little so kerbs start before the turn-in
  const grown = corner.map((_, i) => {
    for (let k = -6; k <= 6; k++) if (corner[(i + k + n) % n]) return true
    return false
  })
  const path = new Path2D()
  for (const side of [1, -1]) {
    const line = offsetLine(track, side * (HALF_WIDTH + 1))
    let open = false
    for (let i = 0; i <= n; i++) {
      const k = i % n
      if (grown[k]) {
        if (!open) path.moveTo(line[k].x, line[k].y)
        else path.lineTo(line[k].x, line[k].y)
        open = true
      } else open = false
    }
  }
  return path
}
