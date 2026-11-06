import type { CSSProperties } from 'react'
import { mulberry32 } from '../lib/random'
import './PodiumLight.css'

/** Dust motes drifting inside the beam. Positions are seeded so they are stable between renders. */
const MOTES = (() => {
  const rnd = mulberry32(42)
  return Array.from({ length: 26 }, () => ({
    x: (rnd() - 0.5) * 2, // -1..1 across the beam
    y: rnd(),
    size: 1 + rnd() * 2,
    duration: 9 + rnd() * 10,
    delay: -rnd() * 20,
    drift: (rnd() - 0.5) * 40,
  }))
})()

/**
 * A spotlight hanging above the stage: a soft amber cone, a hot spot on the
 * "podium" floor and dust floating in the light. Intensity and sway are driven
 * from outside through the CSS variables --light and --sway on an ancestor.
 */
export function PodiumLight() {
  return (
    <div className="podium" aria-hidden="true">
      <div className="podium__beam">
        <div className="podium__cone" />
        <div className="podium__core" />
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="podium__mote"
            style={
              {
                '--x': m.x,
                '--y': m.y,
                '--s': `${m.size}px`,
                '--d': `${m.duration}s`,
                '--delay': `${m.delay}s`,
                '--drift': `${m.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="podium__lamp" />
      <div className="podium__floor" />
      <div className="podium__ring" />
    </div>
  )
}
