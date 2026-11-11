import { services, type Service } from '../content'
import { useFlip } from '../lib/useFlip'
import './sections.css'

/** What a client can hire me for: three offers, side by side, each with a back to turn to. */
export function Services() {
  return (
    <section id="services" className="section services">
      <p className="section__label mono">{services.label}</p>
      <h2 className="services__heading">{services.heading}</h2>
      <ul className="services__list">
        {services.items.map((item, i) => (
          <ServiceCard key={item.name} item={item} index={i} />
        ))}
      </ul>
    </section>
  )
}

function ServiceCard({ item, index }: { item: Service; index: number }) {
  const { flipped, flip, card, openButton, backStart } = useFlip<HTMLLIElement, HTMLHeadingElement>('service__back')
  const { card: words } = services
  const number = String(index + 1).padStart(2, '0')

  return (
    <li className={`service${flipped ? ' is-flipped' : ''}`} ref={card}>
      <div className="service__front" inert={flipped}>
        <span className="service__index mono">{number}</span>
        <h3 className="service__name">{item.name}</h3>
        <p className="service__text">{item.text}</p>
        {item.note && <p className="service__note">{item.note}</p>}
        <button
          type="button"
          className="service__flip mono"
          ref={openButton}
          aria-expanded={flipped}
          onClick={() => void flip(true)}
        >
          {words.open} <span aria-hidden="true">↻</span>
        </button>
      </div>

      <div className="service__back" inert={!flipped}>
        <h3 className="service__back-name" ref={backStart} tabIndex={-1}>
          <span className="service__index mono">{number}</span> {item.name}
        </h3>
        <p className="service__label mono">{words.ideal}</p>
        <p className="service__ideal">{item.ideal}</p>
        <p className="service__label mono">{words.includes}</p>
        <ul className="service__includes">
          {item.includes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="service__back-foot">
          <button type="button" className="service__flip mono" onClick={() => void flip(false)}>
            <span aria-hidden="true">↺</span> {words.close}
          </button>
          <a className="service__cta" href={words.cta.href}>
            {words.cta.label} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </li>
  )
}
