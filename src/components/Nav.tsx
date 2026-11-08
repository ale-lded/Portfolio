import { nav } from '../content'
import { LangDial } from './LangDial'
import './Nav.css'

/** Top bar: the language dial on the left, the section links on the right. */
export function Nav() {
  return (
    <nav className="nav" aria-label={nav.label}>
      <LangDial />
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
