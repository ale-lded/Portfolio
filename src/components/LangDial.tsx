import { useEffect, useState, type KeyboardEvent } from 'react'
import { dial } from '../content'
import { goToLang, LANG_SWITCH, LANGS, pageLang } from '../lib/lang'
import './LangDial.css'

/** Degrees between two engravings on the drum: nine of them go all the way round */
const STEP = 40
const SLOTS = 360 / STEP
/** Knurled ridges round the drum, top and bottom edge */
const RIDGES = 30
/** How long the drum turns before the page changes: the notch lands first */
const TURN_MS = 420

const mod = (n: number, m: number) => ((n % m) + m) % m

/**
 * The language switch: a knurled drum like the ISO dial on an old film camera,
 * with EN · IT · FR engraved round it. A click turns it one notch, then opens the page
 * in that language; the arrow keys turn it either way.
 */
export function LangDial({ className = '' }: { className?: string }) {
  const index = LANGS.findIndex((l) => l.code === pageLang)
  const [turn, setTurn] = useState(index)
  const [leaving, setLeaving] = useState(false)

  // Back from the other language with the browser's back button: the page comes out of
  // the cache as it was left, mid-turn, so set the dial back on this page's language
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      setLeaving(false)
      setTurn((t) => t - mod(t - index, LANGS.length))
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [index])

  const go = (delta: number) => {
    // Italian only for now: the dial stays on show but does not turn (see LANG_SWITCH)
    if (leaving || !LANG_SWITCH) return
    const next = turn + delta
    setTurn(next)
    setLeaving(true)
    const lang = LANGS[mod(next, LANGS.length)].code
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => goToLang(lang), reduced ? 0 : TURN_MS)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1)
    else return
    e.preventDefault()
  }

  const current = LANGS[mod(turn, LANGS.length)]
  const next = LANGS[mod(turn + 1, LANGS.length)]

  return (
    <button
      type="button"
      className={`dial ${className}`}
      onClick={() => go(1)}
      onKeyDown={onKeyDown}
      aria-label={`${dial.label}: ${current.name}. ${dial.switchTo} ${next.name}`}
    >
      <span className="dial__window" aria-hidden="true">
        <span className="dial__drum" style={{ transform: `rotateY(${-turn * STEP}deg)` }}>
          {Array.from({ length: RIDGES }, (_, i) => (
            <i key={i} className="dial__ridge" style={{ transform: `rotateY(${(i * 360) / RIDGES}deg) translateZ(var(--r))` }} />
          ))}
          {Array.from({ length: SLOTS }, (_, j) => (
            <span
              key={j}
              className={`dial__mark mono${mod(j, SLOTS) === mod(turn, SLOTS) ? ' is-on' : ''}`}
              style={{ transform: `rotateY(${j * STEP}deg) translateZ(var(--r))` }}
            >
              {LANGS[mod(j, LANGS.length)].short}
            </span>
          ))}
        </span>
      </span>
      <span className="dial__name mono" aria-hidden="true">
        {current.name}
      </span>
    </button>
  )
}
