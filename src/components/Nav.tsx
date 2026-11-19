import { useEffect, useRef } from 'react'
import { nav } from '../content'
import { LangDial } from './LangDial'
import './Nav.css'

/** Top bar: the language dial on the left, the section links on the right. */
export function Nav() {
  const ref = useRef<HTMLElement>(null)

  // Over the ivory "Chi sono" sheet the bar turns light: watch a thin band at the top
  // of the viewport, where the bar sits, and switch while the sheet is under it
  useEffect(() => {
    const bar = ref.current
    const sheet = document.getElementById('about')
    if (!bar || !sheet) return
    const observer = new IntersectionObserver(
      ([entry]) => bar.classList.toggle('nav--light', entry.isIntersecting),
      { rootMargin: '0px 0px -94% 0px' },
    )
    observer.observe(sheet)
    return () => observer.disconnect()
  }, [])

  return (
    <nav ref={ref} className="nav" aria-label={nav.label}>
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
