import { Car, NO_CONTROLS, STEP, type Controls, type SetupId, type TyreId } from './car'
import { locate, type Track } from './track'

export const LAPS = 3
/** Seconds of countdown before the lights go out */
export const COUNTDOWN = 3
/** The car starts this many samples behind the line, so the clock starts as it crosses */
const GRID_BACK = 14

export type Phase = 'countdown' | 'racing' | 'finished'

export type Choice = { tyre: TyreId; setup: SetupId }

/**
 * One race: the car, the clock and the laps. Pure simulation, stepped at the fixed
 * physics rate; it knows nothing about the screen or the keyboard.
 *
 * Laps are counted from progress along the centreline, accumulated sample by sample:
 * driving backwards takes it away again, and the walls keep the car on the circuit,
 * so the only way to complete a lap is to drive it.
 */
export class Race {
  readonly car: Car
  readonly choice: Choice
  phase: Phase = 'countdown'
  /** Seconds since the session started (countdown included) */
  clock = 0
  /** Lap times so far, seconds */
  laps: number[] = []
  /** Samples driven since the start line; a lap is one track's worth */
  progress = -GRID_BACK
  private lastIndex: number
  private lapStart = 0
  private readonly track: Track
  private readonly n: number

  constructor(track: Track, choice: Choice) {
    this.track = track
    this.choice = choice
    this.n = track.pts.length
    this.car = new Car(track, choice.tyre, choice.setup)
    this.car.place(-GRID_BACK)
    this.lastIndex = locate(track, this.car.x, this.car.y).index
  }

  /** Race time: 0 until the lights go out. */
  get time() {
    return Math.max(0, this.clock - COUNTDOWN)
  }

  /** Time into the current lap. */
  get lapTime() {
    return this.phase === 'racing' ? this.time - this.lapStart : 0
  }

  get lap() {
    return Math.min(LAPS, this.laps.length + 1)
  }

  get total() {
    return this.laps.reduce((a, b) => a + b, 0)
  }

  get best() {
    return this.laps.length ? Math.min(...this.laps) : 0
  }

  step(controls: Controls) {
    if (this.phase === 'finished') {
      // The clock has stopped; the car rolls to a stop past the line
      this.car.step({ ...NO_CONTROLS, brake: 0.35 })
      return
    }
    this.clock += STEP
    if (this.phase === 'countdown') {
      if (this.clock < COUNTDOWN) return
      this.phase = 'racing'
    }

    this.car.step(controls)

    const index = locate(this.track, this.car.x, this.car.y).index
    let d = index - this.lastIndex
    if (d > this.n / 2) d -= this.n
    if (d < -this.n / 2) d += this.n
    this.lastIndex = index
    this.progress += d

    if (this.progress >= (this.laps.length + 1) * this.n) {
      // Crossed the line: the exact moment is somewhere in this step, close enough at 120 Hz
      this.laps.push(this.time - this.lapStart)
      this.lapStart = this.time
      if (this.laps.length >= LAPS) this.phase = 'finished'
    }
  }
}
