import { forwardRef, type Ref } from 'react'
import { hero, person } from '../../content'
import { Emphasis } from '../Emphasis'

type HeroProps = {
  /** The service line: the particle engine samples its pixels and transmutes it. */
  titleRef: Ref<HTMLHeadingElement>
}

/**
 * The service line across the stage, on one line where it fits; under it the lead and the
 * call to action on the left, the name on the right, large and stacked like a signature.
 */
export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero({ titleRef }, ref) {
  const [first, ...last] = person.name.split(' ')

  return (
    <header className="hero" ref={ref}>
      <div className="hero__grid">
        <p className="hero__status mono hero__fade">
          <span className="hero__pulse" aria-hidden="true" />
          {hero.status}
        </p>

        <h1 className="hero__title" ref={titleRef}>
          <Emphasis text={person.tagline} as="em" className="hero__accent" />
        </h1>

        <div className="hero__body hero__fade">
          <p className="hero__lead">{person.lead}</p>
          <a className="button button--primary" href="#contact">
            {hero.cta}
            <span className="button__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className="hero__id hero__fade">
          <p className="hero__name">
            <span>{first}</span> <span>{last.join(' ')}</span>
          </p>
          <p className="hero__role mono">{person.role}</p>
        </div>
      </div>

      <div className="hero__meta hero__fade mono">
        <span>{hero.meta}</span>
        <span className="hero__hint" aria-hidden="true">
          {hero.hint} <span className="hero__arrow">↓</span>
        </span>
        <span className="hero__end">{person.initials}</span>
      </div>
    </header>
  )
})
