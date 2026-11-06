import { forwardRef, type Ref } from 'react'
import { person } from '../../content'

type HeroProps = {
  /** Called with the h1 element: the particle engine samples its pixels. */
  nameRef: Ref<HTMLHeadingElement>
}

export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero({ nameRef }, ref) {
  return (
    <header className="hero" ref={ref}>
      <h1 className="hero__name" ref={nameRef}>
        {person.name}
      </h1>
      <div className="hero__fade">
        <p className="hero__role">{person.role}</p>
        <p className="hero__lead">{person.lead}</p>
      </div>
      <div className="hero__meta hero__fade mono">
        <span>Portfolio — 2026</span>
        <span className="hero__hint" aria-hidden="true">
          scorri <span className="hero__arrow">↓</span>
        </span>
        <span>{person.initials}</span>
      </div>
    </header>
  )
})
