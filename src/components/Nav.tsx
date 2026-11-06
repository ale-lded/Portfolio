import { nav, person } from '../content'
import './Nav.css'

export function Nav() {
  return (
    <nav className="nav" aria-label="Principale">
      <a className="nav__logo" href="#top" aria-label={`${person.name}, torna all'inizio`}>
        {person.initials}
      </a>
      <ul className="nav__links">
        {nav.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
