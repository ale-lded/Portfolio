import { HALF_WIDTH, locate, RUNOFF, type Track } from './track'

/**
 * Arcade car physics, top-down. The car keeps a velocity of its own; steering turns
 * the body, and the tyres pull the velocity back in line with it at a rate set by
 * their grip. Low grip or high speed leave some of it sideways: the car slides.
 *
 * Units: world px, seconds, radians. Always stepped at a fixed rate (see STEP).
 */

/** Physics step: 120 Hz, the same on every machine, so lap times are comparable. */
export const STEP = 1 / 120

export type TyreId = 'soft' | 'medium' | 'hard'
export type SetupId = 'speed' | 'balanced' | 'corner'

export type TyreSpec = {
  /** How fast sideways sliding is cancelled when the tyre is new, 1/s */
  grip: number
  /** Grip lost per lap driven, as a fraction (sliding wears them faster) */
  wear: number
}

export type SetupSpec = {
  /** Top speed, px/s */
  vmax: number
  /** Acceleration from standstill, px/s² */
  accel: number
  /** Turn rate at full lock, rad/s */
  steer: number
  /** Multiplier on tyre grip (downforce, in a way) */
  grip: number
}

/*
 * Balanced with a robot driver over the race (1 lap): all nine combinations finish
 * within about 0.2 s of each other, each strong somewhere else. Softs are quickest
 * through the middle of the lap and fade by the end (worn ~90%); hards are steady;
 * the speed setup wins the long straight, the corner setup the twisty section.
 * Drivers who slide a lot wear their tyres faster than the robot does.
 */
export const TYRES: Record<TyreId, TyreSpec> = {
  soft: { grip: 9.8, wear: 0.7 },
  medium: { grip: 8.1, wear: 0.2 },
  hard: { grip: 7.4, wear: 0.03 },
}

export const SETUPS: Record<SetupId, SetupSpec> = {
  speed: { vmax: 650, accel: 265, steer: 2.45, grip: 0.96 },
  balanced: { vmax: 570, accel: 275, steer: 2.6, grip: 1 },
  corner: { vmax: 510, accel: 285, steer: 2.8, grip: 1.05 },
}

/** What the driver is asking for this step: each axis -1 → 1. */
export type Controls = { throttle: number; brake: number; steer: number; handbrake: boolean }

export const NO_CONTROLS: Controls = { throttle: 0, brake: 0, steer: 0, handbrake: false }

const BRAKE = 820
const REVERSE_MAX = 140
/** Extra slowing when lifting off, 1/s */
const ENGINE_BRAKE = 0.45
/** On the grass: extra drag (1/s) and what is left of the grip */
const GRASS_DRAG = 1.7
const GRASS_GRIP = 0.55
/** Speed kept when hitting the wall */
const WALL_KEEP = 0.45
/** Below this sideways speed the tyres leave no marks, px/s */
const SKID_FROM = 75

export class Car {
  x = 0
  y = 0
  heading = 0
  /** Velocity in the car's own frame: along the body and to its right */
  forward = 0
  lateral = 0
  /** 0 new → 1 finished */
  wear = 0
  onGrass = false
  /** Seconds since the car last touched the wall: drives the screen shake */
  sinceWall = Infinity
  /** Sideways speed, for skid marks and sound */
  skid = 0
  braking = false

  readonly tyre: TyreSpec
  readonly setup: SetupSpec
  private readonly track: Track

  constructor(track: Track, tyre: TyreId, setup: SetupId) {
    this.track = track
    this.tyre = TYRES[tyre]
    this.setup = SETUPS[setup]
  }

  /** Puts the car on the centreline at sample i, facing along the track. */
  place(i: number) {
    const n = this.track.pts.length
    const k = ((i % n) + n) % n
    const p = this.track.pts[k]
    const t = this.track.tan[k]
    this.x = p.x
    this.y = p.y
    this.heading = Math.atan2(t.y, t.x)
    this.forward = 0
    this.lateral = 0
    this.wear = 0
    this.sinceWall = Infinity
  }

  /** Current grip, after wear, setup and surface. */
  grip() {
    const surface = this.onGrass ? GRASS_GRIP : 1
    return this.tyre.grip * this.setup.grip * (1 - 0.45 * this.wear) * surface
  }

  speed() {
    return Math.hypot(this.forward, this.lateral)
  }

  step(c: Controls) {
    const dt = STEP
    const { vmax, accel, steer } = this.setup

    // Along the body: engine against a linear drag that tops out at vmax
    let f = this.forward
    if (c.throttle > 0) f += c.throttle * accel * dt
    if (c.brake > 0) {
      if (f > 5) f = Math.max(0, f - c.brake * BRAKE * dt)
      else f = Math.max(-REVERSE_MAX, f - c.brake * accel * 0.6 * dt)
    }
    f -= f * (accel / vmax) * dt
    if (c.throttle <= 0) f -= f * ENGINE_BRAKE * dt
    if (this.onGrass) f -= f * GRASS_DRAG * dt
    this.braking = c.brake > 0 && f > 5

    // Steering: none standing still, full in the slow corners, less at speed
    const speedIn = Math.min(1, Math.abs(f) / 90)
    const turn = c.steer * steer * speedIn / (1 + Math.abs(f) / 750)
    const dir = f >= 0 ? 1 : -1
    const dh = turn * dir * dt
    this.heading += dh

    // The body turned under the velocity: what was forward is now partly sideways
    let l = this.lateral
    const cos = Math.cos(dh)
    const sin = Math.sin(dh)
    const nf = f * cos + l * sin
    l = -f * sin + l * cos
    f = nf

    // Tyres cancel the sideways part at their grip rate; the handbrake lets it go
    const g = this.grip() * (c.handbrake ? 0.3 : 1)
    l *= Math.exp(-g * dt)
    // Sliding scrubs speed
    f -= Math.sign(f) * Math.min(Math.abs(f), Math.abs(l) * 0.35 * dt)
    if (c.handbrake) f -= f * 0.9 * dt

    this.forward = f
    this.lateral = l
    this.skid = Math.abs(l) > SKID_FROM ? Math.abs(l) : 0

    // Move
    const hx = Math.cos(this.heading)
    const hy = Math.sin(this.heading)
    const vx = hx * f - hy * l
    const vy = hy * f + hx * l
    this.x += vx * dt
    this.y += vy * dt

    // Wear: by distance, more when sliding
    const lap = this.track.length
    this.wear = Math.min(1, this.wear + ((Math.abs(f) + Math.abs(l) * 3) * dt / lap) * this.tyre.wear)

    // Surface and walls
    const hit = locate(this.track, this.x, this.y)
    const off = Math.abs(hit.offset)
    this.onGrass = off > HALF_WIDTH
    this.sinceWall += dt
    const wall = HALF_WIDTH + RUNOFF
    if (off > wall) {
      // Back inside the wall, with the outward part of the velocity gone and a speed penalty
      const nrm = this.track.nrm[hit.index]
      const side = Math.sign(hit.offset)
      this.x = hit.point.x + nrm.x * side * wall
      this.y = hit.point.y + nrm.y * side * wall
      const out = (vx * nrm.x + vy * nrm.y) * side
      if (out > 0) {
        const wx = vx - nrm.x * side * out * 1.3
        const wy = vy - nrm.y * side * out * 1.3
        // Back into the car's frame
        this.forward = (wx * hx + wy * hy) * WALL_KEEP
        this.lateral = (-wx * hy + wy * hx) * WALL_KEEP
        if (out > 60) this.sinceWall = 0
      }
    }
  }
}
