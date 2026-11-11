import { useEffect, useRef } from 'react'
import { backstage, code, hero, terminal } from '../../content'
import { enterBackstage } from '../../lib/backstage'
import { openTerminal } from '../../lib/terminal'
import { Decoder } from '../../lib/decoder'
import { clamp, sstep } from '../../lib/math'
import { Spotlight } from '../../lib/spotlight'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ParticleScene, type CardSpec } from '../../scene/ParticleScene'
import { textLinesFromElement, textSpecFromElement } from '../../scene/sample'
import { PHASES, T } from '../../scene/timeline'
import { PhaseIndicator } from '../PhaseIndicator'
import { Bug } from '../backstage/Bug'
import { PodiumLight } from '../PodiumLight'
import { Hero } from './Hero'
import { Work } from './Work'
import './Stage.css'

/**
 * The 300vh scroll stage. Its sticky child fills the viewport; scroll progress
 * through the stage (0 → 1) drives the whole sequence. React builds the
 * structure once; every frame is then applied imperatively, without re-renders.
 */
export function Stage() {
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const codeWinRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const stage = stageRef.current!
    const sticky = stickyRef.current!
    const codeWin = codeWinRef.current!
    const phase = phaseRef.current!
    const phaseLabel = phase.querySelector<HTMLElement>('.phase__label')!
    const phaseFill = phase.querySelector<HTMLElement>('.phase__fill')!
    // The hero's elements are read again on every build, not kept from the first render:
    // the title is measured where it is now, even after its layout or font has changed
    const heroParts = () => {
      const hero = heroRef.current!
      return {
        title: titleRef.current!,
        fades: [...hero.querySelectorAll<HTMLElement>('.hero__fade')],
        hint: hero.querySelector<HTMLElement>('.hero__hint')!,
        bugs: [...sticky.querySelectorAll<HTMLElement>('.bug')],
      }
    }
    let parts = heroParts()
    const workHead = sticky.querySelector<HTMLElement>('.work__head')!
    const cards = [...sticky.querySelectorAll<HTMLElement>('.card')]
    const cardDecoders = cards.map((card, i) =>
      [...card.querySelectorAll<HTMLElement>('[data-decode]')].map((el, k) => new Decoder(el, i * 10 + k)),
    )

    const scene = new ParticleScene(canvasRef.current!)
    let current = 0
    let raf = 0
    let ready = false
    let alive = true

    const progress = () => {
      const total = stage.offsetHeight - window.innerHeight
      return total > 0 ? clamp(-stage.getBoundingClientRect().top / total) : 0
    }

    const build = () => {
      const previous = parts.title
      parts = heroParts()
      const { title } = parts
      if (title !== previous) {
        resizeObserver.unobserve(previous)
        resizeObserver.observe(title)
      }
      const origin = sticky.getBoundingClientRect()
      const cardSpecs: CardSpec[] = cards.map((card) => {
        const r = card.getBoundingClientRect()
        return {
          rect: { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height },
          title: textSpecFromElement(card.querySelector<HTMLElement>('.card__title')!, origin),
          radius: parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0,
        }
      })
      scene.build({
        width: sticky.clientWidth,
        height: sticky.clientHeight,
        dpr: Math.min(2, window.devicePixelRatio || 1),
        hero: textLinesFromElement(title, origin),
        heroBox: {
          top: title.getBoundingClientRect().top - origin.top,
          bottom: title.getBoundingClientRect().bottom - origin.top,
        },
        heroFontSize: parseFloat(getComputedStyle(title).fontSize),
        cards: cardSpecs,
      })
      const code = scene.code!
      Object.assign(codeWin.style, {
        left: `${code.x}px`,
        top: `${code.y}px`,
        width: `${code.w}px`,
        height: `${code.h}px`,
      })
    }

    const apply = (p: number) => {
      scene.render(p)
      const { title, fades: heroFades, hint, bugs } = parts

      const copyOut = sstep(T.heroCopyOut[0], T.heroCopyOut[1], p)
      for (const el of heroFades) {
        el.style.opacity = String(1 - copyOut)
        el.style.transform = copyOut ? `translateY(${-copyOut * 16}px)` : ''
        // Gone copy can't be clicked: the buttons leave with it
        el.style.visibility = copyOut > 0.99 ? 'hidden' : ''
      }
      hint.style.opacity = String(1 - sstep(T.hintOut[0], T.hintOut[1], p))
      // The bugs belong to the hero: they leave with its copy and can't be clicked once gone
      for (const bug of bugs) {
        bug.style.opacity = String(1 - copyOut)
        bug.style.visibility = copyOut > 0.99 ? 'hidden' : ''
      }
      title.style.opacity = String(1 - sstep(T.swap[0], T.swap[1], p))

      const winA = sstep(T.codeWindowIn[0], T.codeWindowIn[1], p) * (1 - sstep(T.codeWindowOut[0], T.codeWindowOut[1], p))
      codeWin.style.opacity = String(winA)
      codeWin.style.visibility = winA > 0.001 ? 'visible' : 'hidden'

      // The spotlight dims while the code is on screen and comes back up for the work
      const light = 1 - 0.55 * sstep(0.1, 0.2, p) + 0.6 * sstep(0.62, 0.8, p)
      sticky.style.setProperty('--light', light.toFixed(3))

      workHead.style.opacity = String(sstep(T.cardsIn[0] - 0.04, T.cardsIn[1] - 0.04, p))
      cards.forEach((card, i) => {
        const o = sstep(T.cardsIn[0] + i * 0.015, T.cardsIn[1] + i * 0.015, p)
        card.style.opacity = String(o)
        card.style.pointerEvents = o > 0.95 ? 'auto' : 'none'
        const d = sstep(T.decode[0] + i * 0.02, T.decode[1], p)
        cardDecoders[i].forEach((decoder, k) => decoder.update(clamp(d * 1.5 - k * 0.2), p))
      })

      phase.style.opacity = String(sstep(0.07, 0.12, p))
      phaseFill.style.transform = `scaleX(${p.toFixed(4)})`
      const label = PHASES.find(([end]) => p < end)![1]
      if (phaseLabel.textContent !== label) phaseLabel.textContent = label
    }

    // Smoothly chase the real scroll position; reversible because apply() only depends on p
    const tick = () => {
      raf = 0
      const target = progress()
      current += (target - current) * 0.12
      if (Math.abs(target - current) < 0.0003) current = target
      apply(current)
      if (current !== target) raf = requestAnimationFrame(tick)
    }
    const request = () => {
      if (ready && !raf) raf = requestAnimationFrame(tick)
    }

    // Follow-spot only with a real mouse: on touch screens the light stays put
    const spotlight = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ? new Spotlight({
          root: sticky,
          cards: {
            list: sticky.querySelector<HTMLElement>('.work__cards')!,
            items: cards,
            progress: () => current,
            ready: T.cardsIn[1],
          },
        })
      : null

    // Measure again once things settle: the window or the title changed size
    let resizeTimer = 0
    const rebuild = () => {
      if (!ready) return
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        build()
        apply(current)
      }, 120)
    }
    const resizeObserver = new ResizeObserver(rebuild)

    // Sampling needs the real fonts, otherwise the pixels would come from a fallback face
    Promise.all([
      document.fonts.load('600 80px "Geist Variable"'),
      document.fonts.load('300 80px "Geist Variable"'),
      document.fonts.load('700 100px "Inter Variable"'),
      document.fonts.load('400 16px "JetBrains Mono"'),
    ])
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => {
        if (!alive) return
        build()
        current = progress()
        apply(current)
        ready = true
      })

    window.addEventListener('scroll', request, { passive: true })
    resizeObserver.observe(sticky)
    resizeObserver.observe(parts.title)
    // In development, an edit to the hero's code or styles can move the title without
    // resizing anything: measure again after every hot update
    import.meta.hot?.on('vite:afterUpdate', rebuild)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('scroll', request)
      spotlight?.dispose()
      resizeObserver.disconnect()
      import.meta.hot?.off('vite:afterUpdate', rebuild)
    }
  }, [reduced])

  return (
    <section className={`stage${reduced ? ' stage--static' : ''}`} ref={stageRef} aria-label={hero.stageLabel}>
      <span id="work" className="stage__anchor" aria-hidden="true" />
      <div className="stage__sticky" ref={stickyRef}>
        <PodiumLight />
        <Hero ref={heroRef} titleRef={titleRef} />
        <div className="code-win" ref={codeWinRef} aria-hidden="true">
          <div className="code-win__bar mono">
            <i />
            <i />
            <i />
            <span className="code-win__file">{code.file}</span>
            <span className="code-win__lang">{code.lang}</span>
          </div>
        </div>
        <Work />
        <canvas className="stage__canvas" ref={canvasRef} aria-hidden="true" />
        {/* The two hero easter eggs sit above every layer of the stage, so nothing covers them:
            the race on the podium floor, the cipher terminal up in the dark top left */}
        {!reduced && <Bug className="bug--stage" label={backstage.bug} onClick={enterBackstage} />}
        {!reduced && <Bug className="bug--hero" label={terminal.trigger} onClick={openTerminal} />}
        <PhaseIndicator ref={phaseRef} label={PHASES[0][1]} />
      </div>
    </section>
  )
}
