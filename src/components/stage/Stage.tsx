import { useEffect, useRef } from 'react'
import { backstage, code, hero, terminal } from '../../content'
import { enterBackstage } from '../../lib/backstage'
import { openTerminal } from '../../lib/terminal'
import { clamp, sstep } from '../../lib/math'
import { Spotlight } from '../../lib/spotlight'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ParticleScene, type LandingText, type LineTarget } from '../../scene/ParticleScene'
import { CODE_LINES } from '../../scene/code'
import { textLinesFromElement, type Rect } from '../../scene/sample'
import { BUILD, lineLanded, pageAt, PHASES, railAt, T } from '../../scene/timeline'
import { PhaseIndicator } from '../PhaseIndicator'
import { Bug } from '../backstage/Bug'
import { PodiumLight } from '../PodiumLight'
import { Hero } from './Hero'
import { PAGE_COUNT, PICK_EVENT, SWIPE, Work, type WorkHandle } from './Work'
import './Stage.css'

/**
 * The scroll stage (Stage.css sets its height). Its sticky child fills the viewport; scroll progress
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
  const workRef = useRef<WorkHandle>(null)

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
    const work = sticky.querySelector<HTMLElement>('.work')!
    const workHead = work.querySelector<HTMLElement>('.work__head')!
    const browser = work.querySelector<HTMLElement>('.browser')!
    const pickers = [...work.querySelectorAll<HTMLElement>('.picker, .work__dots, .work__info')]
    const pages = work.querySelector<HTMLElement>('.browser__pages')!
    /** Phones: the pages are swiped by hand, so the stage is only as long as the build */
    const swipe = window.matchMedia(SWIPE)
    const demo = work.querySelector<HTMLElement>('.rail__page--bistro')!
    // Line i of the code lands on lineEls[i]; the parts marked data-draw come up after
    const lineEls = CODE_LINES.map((_, i) => demo.querySelector<HTMLElement>(`[data-line="${i}"]`))
    const drawEls = [...demo.querySelectorAll<HTMLElement>('[data-draw]')]
    const rail = work.querySelector<HTMLElement>('.rail')!
    /** The page the rail shows, as last told to the window */
    let shownPage = 0
    /** A card was clicked: the page the scroll is on its way to, and since when */
    let picked: { page: number; at: number } | null = null

    const scene = new ParticleScene(canvasRef.current!)
    let current = 0
    let raf = 0
    let ready = false
    let alive = true

    // The stage's last screen (Stage.css) is not part of the sequence: the window holds
    // still there while the "Chi sono" print slides over it. Measured against the pinned
    // scene (100vh), not window.innerHeight, which a phone's toolbar changes as it moves
    const sequenceLength = () => stage.offsetHeight - 2 * sticky.offsetHeight
    // On phones the stage (Stage.css) holds just the build: its scroll maps onto the build's
    // share of the timeline, and the slides never come
    const progress = () => {
      const total = sequenceLength()
      const at = total > 0 ? clamp(-stage.getBoundingClientRect().top / total) : 0
      return swipe.matches ? at * BUILD : at
    }
    /** 0 → 1 over that last screen, as the print covers the pinned view */
    const coverProgress = () =>
      clamp((-stage.getBoundingClientRect().top - sequenceLength()) / Math.max(1, sticky.offsetHeight))

    const build = () => {
      // The code lands on the first page: measure it where it sits before the rail moves
      const railShift = rail.style.transform
      rail.style.transform = ''
      const swiped = pages.scrollLeft
      pages.scrollLeft = 0
      const previous = parts.title
      parts = heroParts()
      const { title } = parts
      if (title !== previous) {
        resizeObserver.unobserve(previous)
        resizeObserver.observe(title)
      }
      const origin = sticky.getBoundingClientRect()
      const rel = (r: DOMRect): Rect => ({ x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height })
      // Where each line of code lands: the browser's own layout of its words on the page
      // (font, size, colour included), and with data-box the outline drawn around them
      const lines = lineEls.map((el): LineTarget | null => {
        if (!el) return null
        const cs = getComputedStyle(el)
        const spec = el.textContent?.trim() ? textLinesFromElement(el, origin)[0] : undefined
        const text: LandingText | undefined = spec && {
          x: spec.x,
          baseline: spec.baseline,
          size: parseFloat(cs.fontSize),
          style: `${cs.fontStyle === 'normal' ? '' : cs.fontStyle} ${cs.fontWeight}`.trim(),
          family: cs.fontFamily,
          letterSpacing: parseFloat(cs.letterSpacing) || 0,
          color: (cs.color.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number) as [number, number, number],
        }
        const box = el.dataset.box !== undefined ? { rect: rel(el.getBoundingClientRect()), radius: parseFloat(cs.borderTopLeftRadius) || 0 } : undefined
        return { text, box }
      })
      const frame = { rect: rel(browser.getBoundingClientRect()), radius: parseFloat(getComputedStyle(browser).borderTopLeftRadius) || 0 }
      rail.style.transform = railShift
      pages.scrollLeft = swiped
      scene.build({
        width: sticky.clientWidth,
        height: sticky.clientHeight,
        // Up to 3x: phones are 3x screens, and at 2x the code text there looks blurry
        dpr: Math.min(3, window.devicePixelRatio || 1),
        hero: textLinesFromElement(title, origin),
        heroBox: {
          top: title.getBoundingClientRect().top - origin.top,
          bottom: title.getBoundingClientRect().bottom - origin.top,
        },
        heroFontSize: parseFloat(getComputedStyle(title).fontSize),
        frame,
        lines,
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
      // The editor shrinks into the photo's place, as the canvas draws its code (scene.dock)…
      const code = scene.code
      const dock = scene.dock(p)
      codeWin.style.transform =
        code && dock.s !== 1 ? `translate(${(dock.x - code.x).toFixed(1)}px, ${(dock.y - code.y).toFixed(1)}px) scale(${dock.s.toFixed(4)})` : ''
      // …and gives way from the top as its lines leave
      const cut = scene.cut(p)
      codeWin.style.clipPath = cut > 0 ? `inset(${cut.toFixed(1)}px 0 0 0 round 14px)` : ''
      codeWin.style.visibility = winA > 0.001 ? 'visible' : 'hidden'

      // The spotlight dims while the code is on screen and comes back up for the work
      const light = 1 - 0.55 * sstep(0.12 * BUILD, 0.24 * BUILD, p) + 0.6 * sstep(0.66 * BUILD, 0.86 * BUILD, p)
      sticky.style.setProperty('--light', light.toFixed(3))

      // The page fills in behind the editor; each line's words show up for real where that
      // line lands; the rest of the page, the heading and the picker come up after
      browser.style.opacity = String(sstep(T.pageBg[0], T.pageBg[1], p))
      lineEls.forEach((el, i) => {
        if (el) el.style.opacity = String(sstep(lineLanded(i), lineLanded(i) + T.land, p))
      })
      const rest = String(sstep(T.pageRest[0], T.pageRest[1], p))
      for (const el of drawEls) el.style.opacity = rest
      workHead.style.opacity = String(sstep(T.heading[0], T.heading[1], p))
      const pickerUp = sstep(T.pickerIn[0], T.pickerIn[1], p)
      for (const el of pickers) {
        el.style.opacity = String(pickerUp)
        el.style.transform = pickerUp < 1 ? `translateY(${((1 - pickerUp) * 12).toFixed(1)}px)` : ''
      }
      // Phones: back before the page is built, the window is back on its first page
      if (swipe.matches && p < T.pickerIn[0] && pages.scrollLeft > 0) pages.scrollLeft = 0

      // Clickable only once it is all there
      work.style.pointerEvents = p >= T.pickerIn[1] ? '' : 'none'

      // Then the rail slides along the pages, a pause on each: the scroll alone decides
      // which page is in the window, and the cards follow it
      const at = railAt(p)
      rail.style.transform = at > 0 ? `translateX(${((-at * 100) / PAGE_COUNT).toFixed(3)}%)` : ''
      const page = Math.min(PAGE_COUNT - 1, Math.round(at))
      // On the way to a clicked card the pages passed on the way don't light their cards
      if (picked && (page === picked.page || performance.now() - picked.at > 2500)) picked = null
      if (!picked && page !== shownPage) {
        shownPage = page
        workRef.current?.setIndex(page)
      }

      // On phones the window takes the whole screen once built: the phase line steps aside
      const phaseOut = swipe.matches ? sstep(T.pageRest[0], T.pickerIn[0], p) : 0
      phase.style.opacity = String(sstep(0.08 * BUILD, 0.14 * BUILD, p) * (1 - phaseOut))
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
      sticky.style.setProperty('--cover', coverProgress().toFixed(3))
      if (current !== target) raf = requestAnimationFrame(tick)
    }
    const request = () => {
      if (ready && !raf) raf = requestAnimationFrame(tick)
    }

    // Follow-spot: chases a real mouse; on touch screens it only leans toward the last finger
    const spotlight = new Spotlight({
      root: sticky,
      // The window takes the quicker spring of the work, but isn't lit like a card
      cards: {
        list: work,
        items: [],
        progress: () => current,
        ready: T.pickerIn[1],
      },
    })

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
        sticky.style.setProperty('--cover', coverProgress().toFixed(3))
        ready = true
      })

    // A card is a shortcut: it scrolls to where the rail shows its page
    const onPick = (e: Event) => {
      const page = (e as CustomEvent<number>).detail
      picked = { page, at: performance.now() }
      shownPage = page
      const top = stage.getBoundingClientRect().top + window.scrollY + pageAt(page) * sequenceLength()
      window.scrollTo({ top, behavior: 'smooth' })
    }
    work.addEventListener(PICK_EVENT, onPick)

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
      work.removeEventListener(PICK_EVENT, onPick)
      spotlight.dispose()
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
        <Work ref={workRef} />
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
