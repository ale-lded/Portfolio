import { about } from '../content'
import './sections.css'

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
          <ul className="skills">
            {about.skills.map((skill, i) => (
              <li key={skill.name} className="skills__item">
                <span className="skills__n mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="skills__name">{skill.name}</span>
                {skill.note && <span className="skills__note mono">{skill.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
