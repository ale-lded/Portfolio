import { useRef } from 'react'
import { PodiumLight } from '../PodiumLight'
import { Hero } from './Hero'
import './Stage.css'

/**
 * The 300vh scroll stage. Its first child is sticky and fills the viewport;
 * scroll progress through the stage (0 → 1) drives the whole sequence.
 */
export function Stage() {
  const stageRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)

  return (
    <section className="stage" ref={stageRef} aria-label="Introduzione e progetti">
      <span id="progetti" className="stage__anchor" aria-hidden="true" />
      <div className="stage__sticky">
        <PodiumLight />
        <Hero ref={heroRef} nameRef={nameRef} />
      </div>
    </section>
  )
}
