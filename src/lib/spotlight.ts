import { clamp, lerp, sstep } from './math'

/**
 * Spring settings for the follow-spot, per frame at 60fps.
 * hero: a heavy light pushed by hand: very soft spring, lots of inertia, a little overshoot.
 * cards: a motorised head: stiffer and quicker, but speed-capped so long moves travel at a
 * steady, slightly mechanical pace, then ease in.
 */
const HERO = { stiffness: 0.000047, damping: 0.977, maxSpeed: 0.5 }
const CARDS = { stiffness: 0.00625, damping: 0.919, maxSpeed: 1.5 }
/** touch: a lazy, smooth drift toward the last finger, settling in a second or two. */
const TOUCH = { stiffness: 0.0016, damping: 0.94, maxSpeed: 2.5 }

/** On touch screens the light only leans toward the finger: this share of the way from centre stage. */
const TOUCH_FOLLOW = 0.35

/** The beam's pivot, as a fraction of the viewport height: .podium__beam's top in PodiumLight.css. */
const LAMP_Y = -0.02

type CardOptions = {
  list: HTMLElement
  items: HTMLElement[]
  /** Current scroll progress of the stage, 0 → 1 */
  progress: () => number
  /** Progress at which the cards are fully visible and can be lit */
  ready: number
}

type Options = {
  /** Element that receives --beam-angle, --beam-tilt, --floor-x and --floor-a */
  root: HTMLElement
  /** Cards the beam can land on. Without them the light keeps the slow hero spring throughout. */
  cards?: CardOptions
}

/** A follow-spot that chases the pointer with inertia and lights the card it lands on. */
export class Spotlight {
  private o: Options
  private x = 0
  private y = 0
  private vx = 0
  private vy = 0
  private tx = 0
  private ty = 0
  private raf = 0
  private last = 0
  private litCard: HTMLElement | null = null
  /** No real mouse: the light leans gently toward the last touch and stays there. */
  private touch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches

  constructor(options: Options) {
    this.o = options
    this.rest()
    this.x = this.tx
    this.y = this.ty
    window.addEventListener('pointermove', this.onMove, { passive: true })
    window.addEventListener('pointerdown', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    window.addEventListener('scroll', this.wake, { passive: true })
    window.addEventListener('resize', this.wake)
    this.apply()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerdown', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    window.removeEventListener('scroll', this.wake)
    window.removeEventListener('resize', this.wake)
    this.o.root.style.removeProperty('--beam-angle')
    this.o.root.style.removeProperty('--floor-x')
    this.o.root.style.removeProperty('--floor-a')
    this.o.root.style.removeProperty('--beam-tilt')
    this.light(null)
  }

  /** Where the light points when there is no pointer: centre stage. */
  private rest() {
    this.tx = window.innerWidth / 2
    this.ty = window.innerHeight * 0.45
  }

  private onMove = (e: PointerEvent) => {
    if (this.touch) {
      if (e.pointerType === 'mouse') return
      this.rest()
      this.tx += (e.clientX - this.tx) * TOUCH_FOLLOW
      this.ty += (e.clientY - this.ty) * TOUCH_FOLLOW
    } else {
      if (e.pointerType !== 'mouse') return
      this.tx = e.clientX
      this.ty = e.clientY
    }
    this.wake()
  }

  private onLeave = () => {
    // A lifted finger also fires pointerleave: on touch the light stays where it was sent
    if (this.touch) return
    this.rest()
    this.wake()
  }

  private wake = () => {
    if (this.raf) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    this.raf = 0
    const dt = Math.min(3, (now - this.last) / 16.667)
    this.last = now

    const cards = this.o.cards
    const mix = cards && !this.touch ? sstep(cards.ready - 0.08, cards.ready, cards.progress()) : 0
    const k = this.touch ? TOUCH.stiffness : lerp(HERO.stiffness, CARDS.stiffness, mix)
    const damping = this.touch ? TOUCH.damping : lerp(HERO.damping, CARDS.damping, mix)
    const maxSpeed = this.touch ? TOUCH.maxSpeed : lerp(HERO.maxSpeed, CARDS.maxSpeed, mix)

    this.vx = (this.vx + (this.tx - this.x) * k * dt) * Math.pow(damping, dt)
    this.vy = (this.vy + (this.ty - this.y) * k * dt) * Math.pow(damping, dt)
    const speed = Math.hypot(this.vx, this.vy)
    if (speed > maxSpeed) {
      this.vx *= maxSpeed / speed
      this.vy *= maxSpeed / speed
    }
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.apply()

    const settled = Math.hypot(this.tx - this.x, this.ty - this.y) < 0.3 && speed < 0.05
    if (!settled) this.raf = requestAnimationFrame(this.tick)
  }

  private apply() {
    const W = window.innerWidth
    const H = window.innerHeight
    // Aimed from the beam's own pivot, so it points right at the light's target: the
    // swing widens toward the top corners, where the beam lies almost horizontal
    const lampX = W / 2
    const lampY = LAMP_Y * H
    const angle = clamp(Math.atan2(this.x - lampX, this.y - lampY), -Math.PI / 2, Math.PI / 2)
    // Where the beam meets the floor; once that is off screen the pool of light fades out
    const floorY = H * 0.9
    const hitX = Math.tan(angle) * (floorY - lampY)
    const floorX = clamp(hitX, -W * 0.6, W * 0.6)
    const floorA = 1 - sstep(W * 0.35, W * 0.6, Math.abs(hitX))
    this.o.root.style.setProperty('--beam-angle', `${(-angle).toFixed(4)}rad`)
    this.o.root.style.setProperty('--floor-x', `${floorX.toFixed(1)}px`)
    this.o.root.style.setProperty('--floor-a', floorA.toFixed(3))
    this.o.root.style.setProperty('--beam-tilt', (Math.abs(angle) / (Math.PI / 2)).toFixed(3))

    let lit: HTMLElement | null = null
    const cards = this.o.cards
    // Only a mouse lights cards: on touch the beam is just leaning, not aimed at anything
    if (cards && !this.touch && cards.progress() >= cards.ready) {
      for (const card of cards.items) {
        const r = card.getBoundingClientRect()
        if (this.x >= r.left && this.x <= r.right && this.y >= r.top && this.y <= r.bottom) {
          lit = card
          card.style.setProperty('--lx', `${(this.x - r.left).toFixed(1)}px`)
          card.style.setProperty('--ly', `${(this.y - r.top).toFixed(1)}px`)
        }
      }
    }
    this.light(lit)
  }

  private light(card: HTMLElement | null) {
    if (card === this.litCard) return
    this.litCard?.classList.remove('is-lit')
    card?.classList.add('is-lit')
    this.o.cards?.list.classList.toggle('has-lit', card !== null)
    this.litCard = card
  }
}
