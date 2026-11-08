import { useEffect, useState, type KeyboardEvent } from 'react'
import { LANGS, useLang } from '../lib/lang'
import './LangDial.css'

/** Degrees between two engravings on the drum: nine of them go all the way round */
const STEP = 40
const SLOTS = 360 / STEP
/** Knurled ridges round the drum, top and bottom edge */
const RIDGES = 30

const mod = (n: number, m: number) => ((n % m) + m) % m

/**
 * The language switch: a knurled drum like the ISO dial on an old film camera,
 * with EN · IT · FR engraved round it. A click turns it one notch; the arrow keys
 * turn it either way. The drum only ever counts notches, so it never spins back
 * the long way round.
 */
export function LangDial({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang()
  const index = LANGS.findIndex((l) => l.code === lang)
  const [turn, setTurn] = useState(index)

  // Another dial on the page changed the language: catch up, forwards
  useEffect(() => {
    setTurn((t) => t + mod(index - mod(t, LANGS.length), LANGS.length))
  }, [index])

  const go = (delta: number) => {
    const next = turn + delta
    setTurn(next)
    setLang(LANGS[mod(next, LANGS.length)].code)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1)
    else return
    e.preventDefault()
  }

  const current = LANGS[index]
  const next = LANGS[mod(index + 1, LANGS.length)]

  return (
    <button
      type="button"
      className={`dial ${className}`}
      onClick={() => go(1)}
      onKeyDown={onKeyDown}
      aria-label={`Language: ${current.name}. Switch to ${next.name}`}
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
