import { useEffect, useRef } from 'react'
import { about } from '../content'
import { Decoder } from '../lib/decoder'
import { clamp } from '../lib/math'
import { useReducedMotion } from '../lib/useReducedMotion'
import { Emphasis } from './Emphasis'
import './sections.css'

/** Where the film's leader sits, as a fraction of the viewport height: the film unrolls up to here */
const PEN = 0.62
/** Seconds each number takes to decode, and the delay between one and the next */
const DECODE_S = 0.9
const STAGGER_S = 0.15

/**
 * A 35mm film canister seen from the front, lying on its side: metal body, amber label,
 * the spool's end on the right and the felt lip at the bottom the film comes out of.
 * Centered on x = 26 so it sits squarely over the strip.
 */
function FilmCanister() {
  return (
    <svg className="route__can" viewBox="0 0 52 34" width="52" height="34">
      <defs>
        <linearGradient id="can-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="0.28" stopColor="#6a6a72" />
          <stop offset="0.62" stopColor="#2a2a2f" />
          <stop offset="1" stopColor="#141417" />
        </linearGradient>
        <linearGradient id="can-label" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd88f" />
          <stop offset="0.3" stopColor="#ffb547" />
          <stop offset="0.7" stopColor="#b8701c" />
          <stop offset="1" stopColor="#5e340a" />
        </linearGradient>
      </defs>
      {/* The spool's end, poking out on the right */}
      <rect x="46" y="12" width="5" height="10" rx="1.5" fill="url(#can-metal)" />
      {/* End caps, slightly wider than the body */}
      <rect x="5" y="2" width="6" height="30" rx="2" fill="url(#can-metal)" />
      <rect x="41" y="2" width="6" height="30" rx="2" fill="url(#can-metal)" />
      <rect x="10" y="4" width="32" height="26" fill="url(#can-metal)" />
      <rect x="14" y="4" width="24" height="26" fill="url(#can-label)" />
      <text x="26" y="20" textAnchor="middle" fontFamily="var(--mono)" fontSize="7" fontWeight="700" fill="#1a1006">
        35
      </text>
      {/* The felt lip */}
      <rect x="9" y="28" width="34" height="4" rx="1" fill="#0b0b0d" />
    </svg>
  )
}

/**
 * Who I am: the heading, the ride in numbers, then the bio as three stops on a 35mm
 * film the scroll pulls out of its canister, beside the film photo.
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

  // The route: the film unrolls with the scroll from the first stop to the last,
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
      // The film runs from the first stop's frame (top of the list) to the last one's
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
            <FilmCanister />
            <span className="route__film" />
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
