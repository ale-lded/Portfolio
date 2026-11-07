import { useEffect, useRef } from 'react'
import { person } from '../../content'
import { isBackstageUrl, leaveBackstage } from '../../lib/backstage'
import { useReducedMotion } from '../../lib/useReducedMotion'
import './Backstage.css'

/** Walking forward across the stage: the set grows, blurs and slides under you. */
const WALK: Keyframe[] = [
  { transform: 'none', filter: 'none', opacity: 1 },
  { transform: 'translateY(5vh) scale(1.9)', filter: 'blur(10px)', opacity: 0.55 },
]

/** The view behind the page. Placeholder for now: the minigame will live here. */
export function Backstage() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const washRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const root = rootRef.current!
    const scene = sceneRef.current!
    const wash = washRef.current!
    const html = document.documentElement
    const stage = () => document.querySelector<HTMLElement>('.stage__sticky')

    /** The page under the backstage: no scrolling, no focus, no clicks while it is covered. */
    const coverPage = (covered: boolean) => {
      for (const el of document.querySelectorAll<HTMLElement>('main, .nav')) el.inert = covered
    }

    const finishOpen = () => {
      root.dataset.state = 'open'
      scene.style.opacity = '1'
      wash.style.opacity = '0'
      coverPage(true)
      backRef.current?.focus({ preventScroll: true })
    }

    const finishClosed = () => {
      root.dataset.state = 'closed'
      root.hidden = true
      html.classList.remove('is-backstage')
      coverPage(false)
    }

    const enter = async (animate: boolean) => {
      root.hidden = false
      html.classList.add('is-backstage')
      if (!animate) return finishOpen()
      root.dataset.state = 'entering'

      if (reduced) {
        scene.style.opacity = '1'
        await scene.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' }).finished
        return finishOpen()
      }

      // 1. Walk toward the light, which floods the view as you reach it
      scene.style.opacity = '0'
      const walk = stage()?.animate(WALK, { duration: 1150, easing: 'cubic-bezier(0.55, 0, 0.8, 0.25)', fill: 'forwards' })
      const flood = wash.animate([{ opacity: 0 }, { opacity: 1 }], { delay: 450, duration: 700, easing: 'ease-in', fill: 'forwards' })
      await flood.finished

      // 2. Through the beam: behind it, the backstage, still coming toward you
      scene.style.opacity = '1'
      walk?.cancel()
      const settle = scene.animate([{ transform: 'scale(0.88)' }, { transform: 'none' }], {
        duration: 1000,
        easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      })
      const clear = wash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 850, easing: 'ease-out', fill: 'forwards' })
      flood.cancel()
      await Promise.all([settle.finished, clear.finished])
      clear.cancel()
      finishOpen()
    }

    const leave = async (animate: boolean) => {
      if (!animate) return finishClosed()
      root.dataset.state = 'leaving'
      coverPage(false)

      if (reduced) {
        await scene.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: 'ease-in', fill: 'forwards' }).finished
        scene.style.opacity = '0'
        return finishClosed()
      }

      // 1. Back through the light
      const away = scene.animate([{ transform: 'none' }, { transform: 'scale(0.88)' }], {
        duration: 550,
        easing: 'ease-in',
        fill: 'forwards',
      })
      const flood = wash.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 550, easing: 'ease-in', fill: 'forwards' })
      await flood.finished

      // 2. Out on the stage again, stepping back to where you were
      scene.style.opacity = '0'
      away.cancel()
      const walk = stage()?.animate([...WALK].reverse(), { duration: 1150, easing: 'cubic-bezier(0.2, 0.75, 0.45, 1)' })
      const clear = wash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 750, easing: 'ease-out', fill: 'forwards' })
      flood.cancel()
      await Promise.all([walk?.finished, clear.finished])
      clear.cancel()
      wash.style.opacity = '0'
      finishClosed()
    }

    // Transitions run one after another: Back pressed mid-way plays once the first one is over
    let open = false
    let queue = Promise.resolve()
    const sync = (animate: boolean) => {
      const want = isBackstageUrl()
      if (want === open) return
      open = want
      queue = queue.then(() => (want ? enter(animate) : leave(animate)))
    }

    const onPop = () => sync(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) leaveBackstage()
    }

    sync(false)
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
      window.removeEventListener('keydown', onKey)
      html.classList.remove('is-backstage')
      coverPage(false)
    }
  }, [reduced])

  return (
    <div className="backstage" ref={rootRef} data-state="closed" hidden>
      <div className="backstage__scene" ref={sceneRef} role="dialog" aria-modal="true" aria-label="Dietro le quinte">
        {/* The back of the set: the hero title, seen from behind */}
        <p className="backstage__set" aria-hidden="true">
          {person.tagline}
        </p>

        {/* The follow-spot from behind: the lamp in silhouette, its beam going away from you */}
        <div className="backstage__light" aria-hidden="true">
          <div className="backstage__beam" />
          <div className="backstage__pool" />
          <div className="backstage__lamp" />
        </div>

        <div className="backstage__note">
          <span className="backstage__bug" aria-hidden="true" />
          <p className="backstage__label mono">// dietro le quinte</p>
          <p className="backstage__title">In allestimento.</p>
        </div>

        <button type="button" className="backstage__back mono" ref={backRef} onClick={leaveBackstage}>
          <span aria-hidden="true">←</span> Torna sul palco <kbd>esc</kbd>
        </button>
      </div>
      <div className="backstage__wash" ref={washRef} aria-hidden="true" />
    </div>
  )
}
