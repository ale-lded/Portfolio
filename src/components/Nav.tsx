import { nav, person } from '../content'
import './Nav.css'

export function Nav() {
  return (
    <nav className="nav" aria-label={nav.label}>
      <a className="nav__logo" href="#top" aria-label={nav.home}>
        {person.initials}
      </a>
      <ul className="nav__links">
        {nav.links.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
