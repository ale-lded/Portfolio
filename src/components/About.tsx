import { about } from '../content'
import './sections.css'

/** The skills list lives in the stack sequence right below (StackStage). */
export function About() {
  return (
    <section id="chi-sono" className="section about">
      <p className="section__label mono">02 — Chi sono</p>
      <div className="about__grid">
        <h2 className="about__heading">{about.heading}</h2>
        <div>
          {about.bio.map((paragraph) => (
            <p key={paragraph} className="about__bio">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
