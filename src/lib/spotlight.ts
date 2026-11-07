import { clamp, lerp, sstep } from './math'

/**
 * Spring settings for the follow-spot, per frame at 60fps.
 * hero: a heavy light pushed by hand: very soft spring, lots of inertia, a little overshoot.
 * cards: a motorised head: stiffer and quicker, but speed-capped so long moves travel at a
 * steady, slightly mechanical pace, then ease in.
 */
const HERO = { stiffness: 0.0007, damping: 0.963, maxSpeed: 14 }
const CARDS = { stiffness: 0.012, damping: 0.85, maxSpeed: 12 }

type Options = {
  /** Element that receives --beam-angle and --floor-x */
  root: HTMLElement
  cardList: HTMLElement
  cards: HTMLElement[]
  /** Current scroll progress of the stage, 0 → 1 */
  progress: () => number
  /** Progress at which the cards are fully visible and can be lit */
  cardsReady: number
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

  constructor(options: Options) {
    this.o = options
    this.rest()
    this.x = this.tx
    this.y = this.ty
    window.addEventListener('pointermove', this.onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    window.addEventListener('scroll', this.wake, { passive: true })
    window.addEventListener('resize', this.wake)
    this.apply()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('pointermove', this.onMove)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    window.removeEventListener('scroll', this.wake)
    window.removeEventListener('resize', this.wake)
    this.o.root.style.removeProperty('--beam-angle')
    this.o.root.style.removeProperty('--floor-x')
    this.light(null)
  }

  /** Where the light points when there is no pointer: centre stage. */
  private rest() {
    this.tx = window.innerWidth / 2
    this.ty = window.innerHeight * 0.45
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    this.tx = e.clientX
    this.ty = e.clientY
    this.wake()
  }

  private onLeave = () => {
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

    const mix = sstep(this.o.cardsReady - 0.08, this.o.cardsReady, this.o.progress())
    const k = lerp(HERO.stiffness, CARDS.stiffness, mix)
    const damping = lerp(HERO.damping, CARDS.damping, mix)
    const maxSpeed = lerp(HERO.maxSpeed, CARDS.maxSpeed, mix)

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
    // The beam pivots above the top centre. Aiming from a point well above the
    // viewport keeps the swing gentle and avoids hitting the limit near the edges.
    const lampX = W / 2
    const lampY = -0.5 * H
    const angle = clamp(Math.atan2(this.x - lampX, this.y - lampY), -0.5, 0.5)
    const floorY = H * 0.9
    const floorX = clamp(Math.tan(angle) * (floorY - lampY), -W * 0.3, W * 0.3)
    this.o.root.style.setProperty('--beam-angle', `${(-angle).toFixed(4)}rad`)
    this.o.root.style.setProperty('--floor-x', `${floorX.toFixed(1)}px`)

    let lit: HTMLElement | null = null
    if (this.o.progress() >= this.o.cardsReady) {
      for (const card of this.o.cards) {
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
    this.o.cardList.classList.toggle('has-lit', card !== null)
    this.litCard = card
  }
}
