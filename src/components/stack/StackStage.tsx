import { useEffect, useRef, type CSSProperties } from 'react'
import { stack } from '../../content'
import { clamp, lerp, sstep } from '../../lib/math'
import { Spotlight } from '../../lib/spotlight'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { PhaseIndicator } from '../PhaseIndicator'
import { PodiumLight } from '../PodiumLight'
import { LayerArt } from './LayerArt'
import {
  DRAWER_ROOM,
  DRAWER_SPOT,
  drawerPresence,
  LAYER_STYLES,
  layerTime,
  LayerPanel,
  plateMove,
  plateNameOpacity,
  STAND_SPOT,
} from './layerFx'
import { fromCamera, projectOnPlate, type View } from './project'
import { CAMERA, focusOf, inEntrance, layerT, S, SNAP_POINTS, STACK_PHASES, STACK_VH, timelineAt } from './timeline'
import './Stack.css'

const LAYERS = stack.skills.length
/** Thickness of a plate, px. Also the gap left between plates once compressed. */
const THICKNESS = 12
/** Pillars are drawn at this length and scaled to the current gap */
const PILLAR = 100
/** Space between the rows while they are still a flat list */
const ROW_GAP = 8
const DEG = Math.PI / 180

/**
 * The second scroll stage, between "Chi sono" and "Contatti". The skills start as
 * a plain list, fold into an isometric pile of plates, explode so each layer can be
 * read on its own (each with its own choreography, see layerFx.ts), then compress
 * into a single block.
 *
 * Same contract as Stage: React builds the structure once, then every frame is a
 * pure function of scroll progress applied imperatively, so it plays backwards too.
 * The 3D is plain CSS (preserve-3d). Opacity, filters and clip-paths only ever go on
 * leaf faces: on a preserve-3d container they would flatten the scene.
 */
export function StackStage() {
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<HTMLDivElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced) return
    const stage = stageRef.current!
    const sticky = stickyRef.current!
    const scene = sceneRef.current!
    const group = groupRef.current!
    const phase = phaseRef.current!
    const fx = fxRef.current!
    const fxCtx = fx.getContext('2d')!
    const phaseLabel = phase.querySelector<HTMLElement>('.phase__label')!
    const phaseFill = phase.querySelector<HTMLElement>('.phase__fill')!
    const introOutro = [...sticky.querySelectorAll<HTMLElement>('.stack__panel--intro, .stack__panel--outro')]
    const panels = [...sticky.querySelectorAll<HTMLElement>('.stack__panel--layer')].map(
      (el, i) => new LayerPanel(el, LAYER_STYLES[i]),
    )
    const shadow = group.querySelector<HTMLElement>('.stack__shadow')!
    const plates = [...group.querySelectorAll<HTMLElement>('.plate')].map((el) => ({
      el,
      face: el.querySelector<HTMLElement>('.plate__face')!,
      name: el.querySelector<HTMLElement>('.plate__name')!,
      shade: el.querySelector<HTMLElement>('.plate__shade')!,
      front: el.querySelector<HTMLElement>('.plate__edge--front')!,
      side: el.querySelector<HTMLElement>('.plate__edge--side')!,
      pillars: [...el.querySelectorAll<HTMLElement>('.plate__pillar')].map((pillar) => ({
        el: pillar,
        /** Front pillars follow the plate's lower edge while it opens */
        front: pillar.matches('.plate__pillar--bl, .plate__pillar--br'),
      })),
    }))

    // Measured on build: plate size, header strip, widest gap that fits, layout anchors
    let W = 0
    let H = 0
    let rowH = 0
    let maxGap = 0
    let compact = false
    let origin = { x: 0, y: 0 }
    /** The plate title's box in plate coordinates (same for every plate) */
    const title = { x: 0, y: 0, w: 0, h: 0 }
    let fxDrawn = false

    const build = () => {
      const first = plates[0]
      W = first.el.offsetWidth
      H = first.el.offsetHeight
      // Header strip plus the face's 1px top border: the clip lands right under the divider
      const head = first.el.querySelector<HTMLElement>('.plate__head')!
      rowH = head.offsetHeight + 1
      title.x = first.name.offsetLeft + 1
      title.y = first.name.offsetTop + 1
      title.w = first.name.offsetWidth
      title.h = first.name.offsetHeight
      compact = sticky.clientWidth < 960

      // Screen height of one tilted plate, then spread the rest of the room between the gaps
      const rx = CAMERA.rx * DEG
      const rz = Math.abs(CAMERA.rzStart) * DEG
      const plateOnScreen = (W * Math.sin(rz) + H * Math.cos(rz)) * Math.cos(rx)
      const room = sticky.clientHeight * (compact ? 0.5 : 0.7)
      maxGap = clamp((room - plateOnScreen) / ((LAYERS - 1) * Math.sin(rx)), THICKNESS * 3, H * 0.6)

      const box = sticky.getBoundingClientRect()
      const at = scene.getBoundingClientRect()
      origin = { x: at.left - box.left, y: at.top - box.top }
      for (const panel of panels) panel.measure(box)

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      fx.width = Math.round(sticky.clientWidth * dpr)
      fx.height = Math.round(sticky.clientHeight * dpr)
      fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fxDrawn = true
    }

    // Pointer parallax: a few degrees of tilt, chased with inertia like the follow-spot
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    // Same follow-spot as the hero, with its slow, heavy spring; only with a real mouse
    const spotlight = finePointer ? new Spotlight({ root: sticky }) : null
    const tilt = { x: 0, z: 0, tx: 0, tz: 0 }

    /** scroll: progress through the real stage. p: time on the reference timeline. */
    const apply = (scroll: number) => {
      const p = timelineAt(scroll)
      const fold = sstep(S.fold[0], S.fold[1], p)
      const open = sstep(S.open[0], S.open[1], p)
      const explode = sstep(S.explode[0], S.explode[1], p)
      const compress = sstep(S.compress[0], S.compress[1], p)
      const sweep = sstep(S.sweep[0], S.sweep[1], p)

      const rx = CAMERA.rx * fold + tilt.x * fold
      const rz = lerp(0, CAMERA.rzStart, fold) + (CAMERA.rzEnd - CAMERA.rzStart) * sweep + tilt.z * fold

      // Where each layer is in its choreography; drawers need room before the camera is set
      const ts = plates.map((_, i) => layerTime(LAYER_STYLES[i], layerT(i, p)))
      const room = Math.max(0, ...ts.map((t, i) => drawerPresence(LAYER_STYLES[i], t))) * (1 - compress)
      const zoom = lerp(1, DRAWER_ROOM.zoom, room)
      const raise = DRAWER_ROOM.raise * sticky.clientHeight * room
      const z = zoom.toFixed(4)
      group.style.transform = `translateY(${(-raise).toFixed(2)}px) scale3d(${z}, ${z}, ${z}) rotateX(${rx.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg)`
      const view: View = { rx, rz, perspective: CAMERA.perspective, ox: origin.x, oy: origin.y, zoom, raise }

      // Pile → exploded → compressed: the plates end up touching
      const gap = lerp(lerp(THICKNESS * 1.6, maxGap, explode), THICKNESS, compress)
      const visibleH = lerp(rowH, H, open)
      // Lit layers only matter between the explosion and the compression
      const focusPhase = sstep(S.explode[1] - 0.04, S.explode[1], p) * (1 - sstep(S.compress[0] - 0.01, S.compress[0] + 0.02, p))
      const free = 1 - compress

      // Where every plate is this frame
      const moves = ts.map((t, i) => plateMove(LAYER_STYLES[i], t, W, H))
      // A standing plate goes to a fixed spot in front of the camera, whatever the stack's angle
      // Same depth everywhere (any closer and the plate above cuts through it); centred on phones
      const standSpot = fromCamera(view, {
        x: compact ? 0 : STAND_SPOT.x * W,
        y: STAND_SPOT.y * H,
        z: STAND_SPOT.depth * W,
      })
      const drawerSpot = fromCamera(view, { x: DRAWER_SPOT.x * W, y: DRAWER_SPOT.y * H, z: DRAWER_SPOT.depth * W })
      const pos = moves.map((move, i) => {
        // Keep the visible part of each plate centred while it opens downward
        let ty = lerp((i - (LAYERS - 1) / 2) * (rowH + ROW_GAP), 0, fold) + (H - visibleH) / 2
        // Phones have less room on the sides
        let tx = move.slide * free * (compact ? 0.6 : 1)
        let tz = ((LAYERS - 1) / 2 - i) * gap * fold + move.lift * free
        // Drawers come out toward the viewer, to the same spot whatever the stack's angle
        const pull = move.pull * free
        if (pull > 0) {
          tx = lerp(tx, drawerSpot.x, pull)
          ty = lerp(ty, drawerSpot.y, pull)
          tz = lerp(tz, drawerSpot.z, pull)
        }
        const stand = move.stand * free
        if (stand > 0) {
          tx = lerp(tx, standSpot.x, stand)
          ty = lerp(ty, standSpot.y, stand)
          tz = lerp(tz, standSpot.z, stand)
        }
        return { tx, ty, tz, face: move.face * free }
      })

      plates.forEach((plate, i) => {
        const { tx, ty, tz, face } = pos[i]
        const act = focusOf(ts[i])
        // Turning to face the viewer = undoing the group's rotation, partially
        const turn = face > 0.001 ? ` rotateZ(${(-rz * face).toFixed(3)}deg) rotateX(${(-rx * face).toFixed(3)}deg)` : ''
        plate.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, ${tz.toFixed(2)}px)${turn}`

        plate.face.style.clipPath = `inset(0 0 ${(H - visibleH).toFixed(2)}px 0 round 6px)`
        plate.el.style.setProperty('--act', act.toFixed(3))
        plate.shade.style.opacity = ((1 - act) * 0.55 * focusPhase).toFixed(3)
        plate.name.style.opacity = plateNameOpacity(LAYER_STYLES[i], ts[i]).toFixed(3)

        plate.front.style.transform = `translateY(${visibleH.toFixed(2)}px) rotateX(-90deg)`
        plate.front.style.opacity = fold.toFixed(3)
        plate.side.style.transform = `rotateY(90deg) scaleY(${(visibleH / H).toFixed(4)})`
        plate.side.style.opacity = fold.toFixed(3)

        // Pillars hang from the corners down to the next plate, wherever it is right now
        const pillarLen = i < LAYERS - 1 ? Math.max(0, tz - pos[i + 1].tz - THICKNESS) : 0
        // Pillars fade while either end of them has left the stack
        const attached = 1 - Math.max(moves[i].detach, moves[i + 1]?.detach ?? 0)
        const pillarA = explode * free * attached
        const hang = `translateZ(${-THICKNESS}px) rotateX(-90deg) scaleY(${(pillarLen / PILLAR).toFixed(4)})`
        for (const pillar of plate.pillars) {
          pillar.el.style.transform = pillar.front ? `translateY(${(visibleH - H).toFixed(2)}px) ${hang}` : hang
          pillar.el.style.opacity = pillarA.toFixed(3)
        }
      })

      const bottomZ = -((LAYERS - 1) / 2) * gap * fold
      shadow.style.transform = `translate3d(-50%, -50%, ${(bottomZ - THICKNESS - 24).toFixed(2)}px)`
      shadow.style.opacity = (fold * 0.9).toFixed(3)

      // A point of plate i, in its own coordinates (top-left origin), on screen
      const onScreen = (i: number, x: number, y: number) => projectOnPlate(view, pos[i], x - W / 2, y - H / 2)

      // Layer panels: each title starts its flight from where it is printed on its plate
      if (fxDrawn) {
        fxCtx.clearRect(0, 0, fx.width, fx.height)
        fxDrawn = false
      }
      panels.forEach((panel, i) => {
        const midY = title.y + title.h / 2
        const dissolve = panel.update(ts[i], {
          from: onScreen(i, title.x, midY),
          to: onScreen(i, title.x + title.w, midY),
        })
        if (dissolve > 0 && dissolve < 1) {
          panel.drawDissolve(fxCtx, dissolve)
          fxDrawn = true
        }
      })

      // Intro and outro copy
      const introA = 1 - sstep(S.introOut[0], S.introOut[1], p)
      const outroA = sstep(S.outroIn[0], S.outroIn[1], p)
      ;[introA, outroA].forEach((o, k) => {
        const panel = introOutro[k]
        panel.style.opacity = o.toFixed(3)
        panel.style.transform = o < 1 ? `translateY(${((1 - o) * 14).toFixed(2)}px)` : ''
        panel.style.visibility = o > 0.001 ? 'visible' : 'hidden'
      })

      // Light comes up as the stack assembles and flares when it is complete.
      // While the stage is still sliding in from below it stays dim, so its top edge never shows.
      const entering = sstep(0.3, 1, 1 - stage.getBoundingClientRect().top / window.innerHeight)
      const light = (0.5 + 0.5 * sstep(0.04, 0.3, p) + 0.2 * compress) * entering
      sticky.style.setProperty('--light', light.toFixed(3))

      phase.style.opacity = String(sstep(0.03, 0.08, p))
      phaseFill.style.transform = `scaleX(${p.toFixed(4)})`
      const label = STACK_PHASES.find(([end]) => p < end)![1]
      if (phaseLabel.textContent !== label) phaseLabel.textContent = label
    }

    const progress = () => {
      const total = stage.offsetHeight - window.innerHeight
      return total > 0 ? clamp(-stage.getBoundingClientRect().top / total) : 0
    }

    /**
     * One-way latch. Scrubbing back and forth works while the sequence is in progress, but
     * once it is complete and the visitor has moved on to the next section, the stage locks
     * on its final frame and collapses to a single screen, so scrolling back up passes the
     * finished stack instead of replaying it in reverse. It re-arms once the stage is out of
     * view below the viewport: scrolling down into it again plays it from the start.
     */
    let latched = false
    let collapsed = false
    let collapseTimer = 0

    /**
     * Shrinks the finished stage to one screen. Only done once scrolling has come to
     * rest: changing the page height in the middle of a smooth scroll (a nav link, say)
     * would cut that scroll short.
     */
    const collapse = () => {
      if (!latched || collapsed) return
      const r = stage.getBoundingClientRect()
      if (r.bottom > window.innerHeight - 1) return
      // The sticky is already resting at the bottom of the stage, exactly where it sits in
      // the collapsed stage, so keeping the next section in place makes the swap invisible.
      const next = stage.nextElementSibling as HTMLElement | null
      const before = next?.getBoundingClientRect().top ?? 0
      stage.classList.add('stack--done')
      collapsed = true
      const after = next?.getBoundingClientRect().top ?? 0
      if (after !== before) window.scrollBy({ top: after - before, behavior: 'instant' })
      lastY = window.scrollY
    }

    const updateLatch = () => {
      const r = stage.getBoundingClientRect()
      if (!latched && progress() >= 1 && r.bottom < window.innerHeight - 1) {
        // Finished and moving on: freeze on the final frame
        latched = true
        current = 1
        velocity = 0
        apply(1)
      } else if (latched && r.top >= window.innerHeight) {
        // Out of view below: re-arm. Height changes below the viewport move nothing on screen.
        latched = false
        collapsed = false
        stage.classList.remove('stack--done')
        current = 0
        velocity = 0
        apply(0)
      }
      window.clearTimeout(collapseTimer)
      if (latched && !collapsed) collapseTimer = window.setTimeout(collapse, 180)
    }

    let current = progress()
    /**
     * The scene chases the scroll with a critically damped spring instead of a plain lerp:
     * after a jump (a reading stop, a fast flick) it starts gently, speeds up and settles
     * slowly, in about a second, rather than snapping at full speed.
     */
    const SPRING = 7
    /**
     * Speed limits for the chase, in vh of scroll per second. Through an entrance the scene
     * never runs faster than ENTRANCE_SPEED, so even after a jump the title takes its time
     * to fly in; through holds, where nothing moves, it can catch up quickly.
     */
    const ENTRANCE_SPEED = 25
    const FREE_SPEED = 160
    let velocity = 0
    let lastFrame = 0
    let raf = 0
    let inView = false

    const tick = (now: number) => {
      raf = 0
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60
      lastFrame = now
      const target = latched ? 1 : progress()
      velocity += (SPRING * SPRING * (target - current) - 2 * SPRING * velocity) * dt
      const maxSpeed = (inEntrance(current) ? ENTRANCE_SPEED : FREE_SPEED) / (STACK_VH - 100)
      velocity = clamp(velocity, -maxSpeed, maxSpeed)
      current = clamp(current + velocity * dt)
      if (Math.abs(target - current) < 0.0002 && Math.abs(velocity) < 0.001) {
        current = target
        velocity = 0
      }
      tilt.x += (tilt.tx - tilt.x) * 0.06
      tilt.z += (tilt.tz - tilt.z) * 0.06
      const tiltSettled = Math.abs(tilt.tx - tilt.x) < 0.01 && Math.abs(tilt.tz - tilt.z) < 0.01
      if (tiltSettled) {
        tilt.x = tilt.tx
        tilt.z = tilt.tz
      }
      apply(current)
      if (current !== target || !tiltSettled) raf = requestAnimationFrame(tick)
      else lastFrame = 0
    }
    const request = () => {
      if (inView && !raf) raf = requestAnimationFrame(tick)
    }
    /**
     * Reading stops for wheel and trackpad. CSS snapping alone lets a fast flick fly past
     * several cards, so when a scroll crosses a card's stop the page is held there: further
     * wheel input (including trackpad momentum) is swallowed for at least STOP_MIN ms, until
     * the gesture goes quiet or STOP_MAX ms have passed. Reversing direction releases at once.
     * Touch scrolling has no wheel events and keeps the CSS snap points only.
     */
    const STOP_MIN = 400
    const STOP_QUIET = 160
    const STOP_MAX = 900
    let stopStarted = 0
    let stopDir = 0
    let lastWheel = 0
    let lastY = window.scrollY

    const stopAt = (y: number, dir: number) => {
      window.scrollTo({ top: y, behavior: 'instant' })
      lastY = y
      stopStarted = performance.now()
      stopDir = dir
    }

    /** The first stop between scroll positions a and b, in the direction of travel. */
    const stopBetween = (a: number, b: number) => {
      if (latched || a === b) return null
      const top = stage.getBoundingClientRect().top + window.scrollY
      const total = stage.offsetHeight - window.innerHeight
      const ys = SNAP_POINTS.map((point) => top + point * total)
      if (b < a) ys.reverse()
      return ys.find((y) => (b > a ? a < y - 1 && b >= y : a > y + 1 && b <= y)) ?? null
    }

    const onWheel = (e: WheelEvent) => {
      if (latched || !inView || e.ctrlKey) return
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY
      if (!dy) return
      const now = performance.now()
      const dir = Math.sign(dy)
      const quiet = now - lastWheel
      lastWheel = now
      if (stopStarted) {
        const held = now - stopStarted
        const release = dir !== stopDir || (held > STOP_MIN && quiet > STOP_QUIET) || held > STOP_MAX
        if (!release) {
          e.preventDefault()
          return
        }
        stopStarted = 0
      }
      const y = window.scrollY
      const stop = stopBetween(y, y + dy)
      if (stop !== null) {
        e.preventDefault()
        stopAt(stop, dir)
      }
    }

    const onScroll = () => {
      // Smooth wheel scrolling can land past a stop between two wheel events: pull it back
      const y = window.scrollY
      if (!stopStarted && performance.now() - lastWheel < 120) {
        const stop = stopBetween(lastY, y)
        if (stop !== null) stopAt(stop, Math.sign(y - lastY))
      }
      lastY = window.scrollY
      updateLatch()
      request()
    }

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tilt.tx = (0.5 - e.clientY / window.innerHeight) * 6
      tilt.tz = (e.clientX / window.innerWidth - 0.5) * 8
      request()
    }

    // Only work while the stage is on screen
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      request()
    })

    let resizeTimer = 0
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      window.clearTimeout(collapseTimer)
      resizeTimer = window.setTimeout(() => {
        build()
        apply(current)
      }, 120)
    })

    build()
    updateLatch()
    apply(current)
    group.style.visibility = 'visible'

    // Text metrics and the pixel samples depend on the web fonts: measure again once they are in
    let alive = true
    document.fonts.ready.then(() => {
      if (!alive) return
      build()
      apply(current)
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: false })
    if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true })
    io.observe(stage)
    resizeObserver.observe(sticky)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      stage.classList.remove('stack--done')
      window.removeEventListener('pointermove', onPointer)
      spotlight?.dispose()
      io.disconnect()
      resizeObserver.disconnect()
    }
  }, [reduced])

  return (
    <section
      className={`stack${reduced ? ' stack--static' : ''}`}
      ref={stageRef}
      aria-labelledby="stack-heading"
      style={{ '--stack-h': `${STACK_VH.toFixed(2)}vh` } as CSSProperties}
    >
      <div className="stack__sticky" ref={stickyRef}>
        <PodiumLight />

        <div className="stack__info">
          <p className="stack__label mono">{stack.label}</p>
          <div className="stack__panels">
            <div className="stack__panel stack__panel--intro">
              <h2 id="stack-heading" className="stack__heading">
                {stack.intro.heading}
              </h2>
              <p className="stack__text">{stack.intro.text}</p>
            </div>
            {/* Visual copy of each layer's detail: screen readers get it from the list below */}
            {stack.skills.map((skill, i) => (
              <div key={skill.name} className="stack__panel stack__panel--layer" aria-hidden="true">
                <p className="stack__count mono">
                  <span>{String(i + 1).padStart(2, '0')}</span> / {String(LAYERS).padStart(2, '0')}
                </p>
                <p className="stack__name">{skill.name}</p>
                <p className="stack__text">{skill.detail}</p>
              </div>
            ))}
            <div className="stack__panel stack__panel--outro">
              <p className="stack__heading">{stack.outro.heading}</p>
              <p className="stack__text">{stack.outro.text}</p>
            </div>
          </div>
        </div>

        <div className="stack__scene" ref={sceneRef}>
          <div className="stack__group" ref={groupRef}>
            <div className="stack__shadow" aria-hidden="true" />
            <ol className="stack__layers">
              {stack.skills.map((skill, i) => (
                <li key={skill.name} className="plate">
                  <div className="plate__face">
                    <div className="plate__head">
                      <span className="plate__n mono">{String(i + 1).padStart(2, '0')}</span>
                      <span className="plate__name">{skill.name}</span>
                      {skill.note && <span className="plate__note mono">{skill.note}</span>}
                    </div>
                    <p className="plate__detail">{skill.detail}</p>
                    <div className="plate__body">
                      <LayerArt index={i} />
                    </div>
                    <div className="plate__shade" />
                  </div>
                  <div className="plate__edge plate__edge--front" />
                  <div className="plate__edge plate__edge--side" />
                  {i < LAYERS - 1 &&
                    ['tl', 'tr', 'bl', 'br'].map((corner) => (
                      <span key={corner} className={`plate__pillar plate__pillar--${corner}`} />
                    ))}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Pixels of the text that crumbles away */}
        <canvas className="stack__fx" ref={fxRef} aria-hidden="true" />

        <PhaseIndicator ref={phaseRef} label={STACK_PHASES[0][1]} />
      </div>

      {/* Magnetic stops: one per readable card, plus the finished stack */}
      <div className="stack__snaps" aria-hidden="true">
        {SNAP_POINTS.map((point) => (
          <span key={point} className="stack__snap" style={{ '--at': point } as CSSProperties} />
        ))}
      </div>
    </section>
  )
}
