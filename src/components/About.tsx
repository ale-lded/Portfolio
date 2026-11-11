import { useEffect, useRef } from 'react'
import { about } from '../content'
import { Decoder } from '../lib/decoder'
import { clamp } from '../lib/math'
import { useReducedMotion } from '../lib/useReducedMotion'
import { Emphasis } from './Emphasis'
import './sections.css'

/** Where the route's pen sits, as a fraction of the viewport height: the line is drawn up to here */
const PEN = 0.62
/** Seconds each number takes to decode, and the delay between one and the next */
const DECODE_S = 0.9
const STAGGER_S = 0.15

/**
 * Who I am: the heading, the ride in numbers, then the bio as three stops on a route
 * that draws itself as you scroll, beside the film photo.
 * The method lives in the stack sequence further down (StackStage).
 */
export function About() {
  const dialog = useRef<HTMLDialogElement>(null)
  const statsRef = useRef<HTMLUListElement>(null)
  const routeRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { photo } = about

  // The numbers come out of binary digits the first time the strip is on screen
  useEffect(() => {
    const list = statsRef.current
    if (!list) return
    const decoders = [...list.querySelectorAll<HTMLElement>('[data-decode]')].map((el, i) => new Decoder(el, 40 + i))
    if (reduced) {
      decoders.forEach((d) => d.finish())
      return
    }
    let raf = 0
    const play = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = (now - start) / 1000
        let done = true
        decoders.forEach((d, i) => {
          const k = clamp((t - i * STAGGER_S) / DECODE_S)
          d.update(k, t * 0.25)
          if (k < 1) done = false
        })
        raf = done ? 0 : requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer.disconnect()
        play()
      },
      { threshold: 0.6 },
    )
    observer.observe(list)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  // The route: the amber line follows the scroll from the first stop to the last,
  // and lights each stop as it gets there
  useEffect(() => {
    const route = routeRef.current
    if (!route) return
    const stops = [...route.querySelectorAll<HTMLElement>('.chapter')]
    const last = stops[stops.length - 1]
    if (!last) return

    let raf = 0
    const update = () => {
      raf = 0
      // The line runs from the first stop's dot (top of the list) to the last one's
      const length = last.offsetTop
      route.style.setProperty('--route-length', `${length}px`)
      const top = route.getBoundingClientRect().top
      const p = reduced ? 1 : clamp((window.innerHeight * PEN - top) / Math.max(1, length))
      route.style.setProperty('--route', p.toFixed(4))
      stops.forEach((stop) => stop.classList.toggle('is-reached', stop.offsetTop <= p * length + 1))
    }
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    route.classList.add('route--live')
    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      route.classList.remove('route--live')
    }
  }, [reduced])

  return (
    <section id="about" className="section about">
      <p className="section__label mono">{about.label}</p>
      <h2 className="about__heading">{about.heading}</h2>

      <ul ref={statsRef} className="stats">
        {about.stats.map((stat) => (
          <li key={stat.label} className="stat">
            <span className="stat__value" data-decode={stat.value} />
            <span className="stat__label mono">{stat.label}</span>
          </li>
        ))}
      </ul>

      <div className="about__grid">
        <aside className="about__aside">
          <figure className="photo">
            <button type="button" className="photo__open" onClick={() => dialog.current?.showModal()}>
              <img
                className="photo__img"
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />
              <span className="sr-only">{photo.open}</span>
            </button>
            <figcaption className="photo__caption mono">
              <span>{photo.caption}</span>
              <span>{photo.film}</span>
            </figcaption>
          </figure>
        </aside>

        <div ref={routeRef} className="route">
          <span className="route__line" aria-hidden="true">
            <span className="route__fill" />
            <span className="route__pen" />
          </span>
          <ol className="route__stops">
          {about.chapters.map((chapter, i) => (
            <li key={chapter.label} className="chapter">
              <span className="chapter__stop" aria-hidden="true" />
              <p className="chapter__meta mono">
                <span>
                  {String(i + 1).padStart(2, '0')} · {chapter.label}
                </span>
                <span className="chapter__place">{chapter.place}</span>
              </p>
              <h3 className="chapter__title">{chapter.title}</h3>
              <p className="chapter__text">
                <Emphasis text={chapter.text} />
              </p>
            </li>
          ))}
          </ol>
        </div>
      </div>

      {/* The photo, larger: closes with Esc, the button, or a click outside the print */}
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={photo.caption}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close()
        }}
      >
        <figure className="lightbox__print">
          <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} />
          <figcaption className="lightbox__caption">
            <p>{photo.story}</p>
            <p className="mono">
              {photo.caption} · {photo.film}
            </p>
          </figcaption>
        </figure>
        <button type="button" className="lightbox__close mono" onClick={() => dialog.current?.close()}>
          {photo.close} ✕
        </button>
      </dialog>
    </section>
  )
}
