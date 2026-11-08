import { services } from '../content'
import './sections.css'

/** What a client can hire me for: three offers, side by side. */
export function Services() {
  return (
    <section id="services" className="section services">
      <p className="section__label mono">{services.label}</p>
      <h2 className="services__heading">{services.heading}</h2>
      <ul className="services__list">
        {services.items.map((item, i) => (
          <li key={item.name} className="service">
            <span className="service__index mono">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="service__name">{item.name}</h3>
            <p className="service__text">{item.text}</p>
            {item.note && <p className="service__note">{item.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
