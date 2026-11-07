import { forwardRef, type Ref } from 'react'
import { hero, person } from '../../content'

type HeroProps = {
  /** The service line: the particle engine samples its pixels and transmutes it. */
  titleRef: Ref<HTMLHeadingElement>
}

export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero({ titleRef }, ref) {
  return (
    <header className="hero" ref={ref}>
      <h1 className="hero__title" ref={titleRef}>
        {person.tagline}
      </h1>
      <div className="hero__fade">
        <p className="hero__name">{person.name}</p>
        <p className="hero__role">{person.role}</p>
        <p className="hero__lead">{person.lead}</p>
      </div>
      <div className="hero__meta hero__fade mono">
        <span>{hero.meta}</span>
        <span className="hero__hint" aria-hidden="true">
          {hero.hint} <span className="hero__arrow">↓</span>
        </span>
        <span>{person.initials}</span>
      </div>
    </header>
  )
})
