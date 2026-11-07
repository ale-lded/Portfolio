import { NO_CONTROLS, STEP, type Controls } from './car'
import { COUNTDOWN, LAPS, Race, type Choice } from './race'
import { Renderer } from './render'
import { buildTrack } from './track'

/**
 * The game loop around a Race: keyboard in, fixed-step physics, drawing out, and the
 * screens in between. The React side (Race.tsx) only shows the menus and the HUD.
 *
 * select → countdown → racing ⇄ paused → finished → select or countdown again
 */
export type GamePhase = 'select' | 'countdown' | 'racing' | 'paused' | 'finished'

export type Hud = {
  lap: number
  laps: number
  time: number
  lapTime: number
  best: number
  /** 0 new → 1 worn out */
  wear: number
  speed: number
  /** Countdown lights lit (1 → 3), 0 once they are out */
  lights: number
}

export type Result = { choice: Choice; time: number; laps: number[]; best: number }

type Events = {
  phase: (phase: GamePhase) => void
  hud: (hud: Hud) => void
  finish: (result: Result) => void
}

/** Steering ramps in and out instead of snapping, rad of lock per second */
const STEER_RATE = 7
/** After the flag, this long before the results come up, s */
const COOL_DOWN = 1.6

const KEYS: Record<string, keyof Held> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'handbrake',
}
type Held = { up: boolean; down: boolean; left: boolean; right: boolean; handbrake: boolean }

export class Game {
  phase: GamePhase = 'select'
  private readonly track = buildTrack()
  private readonly renderer: Renderer
  private readonly canvas: HTMLCanvasElement
  private readonly events: Events
  private race: Race | null = null
  private held: Held = { up: false, down: false, left: false, right: false, handbrake: false }
  private steer = 0
  private acc = 0
  private last = 0
  private raf = 0
  private active = false
  private finishedFor = 0
  private resizeObserver: ResizeObserver

  constructor(canvas: HTMLCanvasElement, events: Events) {
    this.canvas = canvas
    this.events = events
    this.renderer = new Renderer(canvas, this.track)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
    // Capture phase: Escape pauses the race before the backstage gets to close
    window.addEventListener('keydown', this.onKeyDown, true)
    window.addEventListener('keyup', this.onKeyUp, true)
    window.addEventListener('blur', this.onBlur)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.resizeObserver.disconnect()
    window.removeEventListener('keydown', this.onKeyDown, true)
    window.removeEventListener('keyup', this.onKeyUp, true)
    window.removeEventListener('blur', this.onBlur)
  }

  /** Runs the loop only while the backstage is open; closing it pauses a race. */
  setActive(active: boolean) {
    this.active = active
    if (!active) {
      if (this.phase === 'racing' || this.phase === 'countdown') this.setPhase('paused')
      cancelAnimationFrame(this.raf)
      this.raf = 0
      return
    }
    if (!this.raf) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  start(choice: Choice) {
    this.race = new Race(this.track, choice)
    this.renderer.clearSkids()
    this.acc = 0
    this.steer = 0
    this.finishedFor = 0
    this.releaseKeys()
    this.setPhase('countdown')
  }

  restart() {
    if (this.race) this.start(this.race.choice)
  }

  pause() {
    if (this.phase === 'racing' || this.phase === 'countdown') this.setPhase('paused')
  }

  resume() {
    if (this.phase !== 'paused' || !this.race) return
    this.releaseKeys()
    this.last = performance.now()
    this.setPhase(this.race.phase === 'countdown' ? 'countdown' : 'racing')
  }

  toSelect() {
    this.race = null
    this.renderer.clearSkids()
    this.setPhase('select')
  }

  private setPhase(phase: GamePhase) {
    if (phase === this.phase) return
    this.phase = phase
    this.events.phase(phase)
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    this.renderer.resize(r.width, r.height, Math.min(2, window.devicePixelRatio || 1))
  }

  private controls(): Controls {
    const h = this.held
    const target = (h.right ? 1 : 0) - (h.left ? 1 : 0)
    const d = target - this.steer
    this.steer += Math.sign(d) * Math.min(Math.abs(d), STEER_RATE * STEP)
    return { throttle: h.up ? 1 : 0, brake: h.down ? 1 : 0, steer: this.steer, handbrake: h.handbrake }
  }

  private frame = (now: number) => {
    this.raf = this.active ? requestAnimationFrame(this.frame) : 0
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    const race = this.race

    if (race && (this.phase === 'countdown' || this.phase === 'racing' || this.phase === 'finished')) {
      this.acc += dt
      while (this.acc >= STEP) {
        this.acc -= STEP
        race.step(this.phase === 'finished' ? NO_CONTROLS : this.controls())
      }
      if (this.phase === 'countdown' && race.phase !== 'countdown') this.setPhase('racing')
      if (this.phase === 'racing' && race.phase === 'finished') {
        this.setPhase('finished')
        this.finishedFor = 0
      }
      if (this.phase === 'finished') {
        const before = this.finishedFor
        this.finishedFor += dt
        if (before < COOL_DOWN && this.finishedFor >= COOL_DOWN) {
          this.events.finish({ choice: race.choice, time: race.total, laps: [...race.laps], best: race.best })
        }
      }
    }

    const view = race && this.phase !== 'select' ? 'chase' : 'overview'
    // During the countdown the stage lights come down onto the car
    const lights = race && race.phase === 'countdown' ? Math.min(1, race.clock / COUNTDOWN) : 1
    this.renderer.draw(view === 'chase' ? race!.car : null, view, dt, { lights })

    if (race) {
      this.events.hud({
        lap: race.lap,
        laps: LAPS,
        time: race.time,
        lapTime: race.lapTime,
        best: race.best,
        wear: race.car.wear,
        speed: race.car.speed(),
        lights: race.phase === 'countdown' ? Math.min(3, Math.floor(race.clock) + 1) : 0,
      })
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.active || isTyping(e)) return
    const racing = this.phase === 'racing' || this.phase === 'countdown'

    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (racing) this.pause()
      else if (this.phase === 'paused') this.resume()
      else return
      // Handled here: the backstage must not close
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (e.code === 'KeyR' && this.race && this.phase !== 'select') {
      e.preventDefault()
      this.restart()
      return
    }
    const key = KEYS[e.code]
    if (key && racing) {
      // No scrolling, and no clicking a focused button with Space
      e.preventDefault()
      this.held[key] = true
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    const key = KEYS[e.code]
    if (key) this.held[key] = false
  }

  private onBlur = () => {
    this.releaseKeys()
    this.pause()
  }

  private releaseKeys() {
    this.held = { up: false, down: false, left: false, right: false, handbrake: false }
  }
}

const isTyping = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}
