import { contact, person } from '../content'
import './sections.css'

export function Contact() {
  return (
    <>
      <section id="contatti" className="section contact">
        <p className="section__label mono">03 — Contatti</p>
        <h2 className="contact__heading">{contact.heading}</h2>
        <div className="contact__actions">
          <a className="contact__cta" href={`mailto:${contact.email}`}>
            Scrivimi <span aria-hidden="true">→</span>
          </a>
          {contact.links.map((link) => (
            <a key={link.label} className="contact__link mono" href={link.href}>
              {link.label} ↗
            </a>
          ))}
        </div>
      </section>
      <footer className="footer mono">
        <span>© 2026 {person.name}</span>
        <a href="#top">Torna su ↑</a>
      </footer>
    </>
  )
}
