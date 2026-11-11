import { contact, person, terminal } from '../content'
import { scrollToTop } from '../lib/scroll'
import { openTerminal } from '../lib/terminal'
import { Bug } from './backstage/Bug'
import './sections.css'

/** The email that opens from the button, already addressed and with a short form to fill in */
const mailto = `mailto:${contact.email}?${new URLSearchParams({ subject: contact.subject, body: contact.body })
  .toString()
  .replace(/\+/g, '%20')}`

export function Contact() {
  return (
    <>
      <section id="contact" className="section contact">
        <p className="section__label mono">{contact.label}</p>
        <h2 className="contact__heading">{contact.heading}</h2>
        <div className="contact__actions">
          <a className="contact__cta" href={mailto}>
            {contact.cta} <span aria-hidden="true">→</span>
          </a>
          {contact.links
            .filter((link) => link.href)
            .map((link) => (
              <a key={link.label} className="contact__link mono" href={link.href} target="_blank" rel="noreferrer">
                {link.label} ↗
              </a>
            ))}
        </div>
        <p className="contact__reply">{contact.reply}</p>
      </section>
      <footer className="footer mono">
        <span>
          © 2026 {person.name}
          <Bug className="bug--footer" label={terminal.trigger} onClick={openTerminal} />
        </span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToTop()
          }}
        >
          {contact.backToTop} ↑
        </a>
      </footer>
    </>
  )
}
