import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { work } from '../../content'
import { pageLang } from '../../lib/lang'

/** The four pages, in the order the scroll brings them: two example sites, Folio, this site */
const PICKS = ['bistro', 'carpenter', 'folio', 'site'] as const
type Pick = (typeof PICKS)[number]
export const PAGE_COUNT = PICKS.length

/** The stage tells the window which page the scroll has brought into view */
export type WorkHandle = { setIndex(i: number): void }

/** Fired on .work when a visitor picks a page: the stage scrolls to where it shows */
export const PICK_EVENT = 'work:pick'

const copyOf = (pick: Pick) =>
  pick === 'bistro' ? work.demo : pick === 'carpenter' ? work.carpenter : pick === 'folio' ? work.folio : work.site

/**
 * The work, in one browser window, with a paper card per page beside it. The pages sit
 * side by side on a rail that the scroll slides along (Stage.tsx): the code writes the
 * first one, line by line, into the elements marked data-line (ParticleScene), then the
 * scroll brings in the others. A card is a shortcut: it scrolls to its page.
 */
export const Work = forwardRef<WorkHandle>(function Work(_, ref) {
  const [index, setIndex] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const picker = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => ({ setIndex }), [])

  const active = PICKS[index]

  // Phones: the cards are a carousel, which follows the open one as the scroll moves on.
  // Only the carousel scrolls, never the page
  useEffect(() => {
    const list = picker.current
    const card = tabs.current[index]?.parentElement
    if (!list || !card || list.scrollWidth <= list.clientWidth) return
    list.scrollTo({ left: card.offsetLeft - list.offsetLeft - 20, behavior: 'smooth' })
  }, [index])

  const { folio, site, demo } = work

  // The card lights up at once; the stage then scrolls to the page (without the stage,
  // with reduced motion, the window simply shows it)
  const choose = (i: number) => {
    setIndex(i)
    root.current?.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: i }))
  }

  // Arrow keys move between the cards, as in any row of tabs
  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + PICKS.length) % PICKS.length
    choose(next)
    tabs.current[next]?.focus()
  }

  const action = (href: string, label: string, external = false) => (
    <a
      className="picker__action picker__action--primary mono"
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {label} <span aria-hidden="true">{external ? '↗' : '→'}</span>
    </a>
  )

  /** What each card says once it is open: a line about the page, and where it leads */
  const more: Record<Pick, ReactNode> = {
    bistro: (
      <>
        <p className="picker__desc">{demo.description}</p>
        {action(demo.cta.href, demo.cta.label)}
      </>
    ),
    carpenter: (
      <>
        <p className="picker__desc">{work.carpenter.description}</p>
        {action(demo.cta.href, demo.cta.label)}
      </>
    ),
    folio: (
      <>
        <p className="picker__desc">{folio.description}</p>
        <p className="picker__desc picker__story">{folio.story}</p>
        {action(folio.href, folio.cta, true)}
      </>
    ),
    site: <p className="picker__desc">{site.description}</p>,
  }

  const status = active === 'bistro' ? demo.status : active === 'carpenter' ? work.carpenter.status : null
  const pages = [<DemoPage key="d" />, <CarpenterPage key="c" />, <FolioPage key="f" />, <SitePage key="s" />]

  return (
    <div className="work" ref={root} data-index={index}>
      <div className="work__head mono">
        <span>{work.heading}</span>
        <span>({String(PICKS.length).padStart(2, '0')})</span>
      </div>

      <div className="browser">
        <div className="browser__bar">
          <span className="browser__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="browser__url mono">
            <span aria-hidden="true">●</span> {copyOf(active).url}
          </span>
          {status && <span className="browser__badge mono">{status}</span>}
        </div>

        <div className="browser__view">
          <div id="work-pages" role="tabpanel" aria-labelledby={`tab-${active}`} className="browser__pages">
            {/* The rail: Stage.tsx slides it with the scroll (data-index does it without motion) */}
            <div className="rail">
              {pages.map((page, i) => (
                <div key={PICKS[i]} className={`rail__page rail__page--${PICKS[i]}`} inert={index !== i}>
                  {page}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards of paper, like the "About" print: the whole card answers the click (the tab's
          ::after stretches over it), the link inside stays a link of its own */}
      <div className="picker" ref={picker} role="tablist" aria-label={work.tabsLabel}>
        {PICKS.map((pick, i) => (
          <div key={pick} role="presentation" className={`picker__item${index === i ? ' is-active' : ''}`}>
            <button
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`tab-${pick}`}
              aria-controls="work-pages"
              aria-selected={index === i}
              tabIndex={index === i ? 0 : -1}
              className="picker__tab"
              onClick={() => choose(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="picker__index mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="picker__title">{copyOf(pick).tab}</span>
              <span className="picker__kind mono">{copyOf(pick).kind}</span>
            </button>
            <div className="picker__more">{more[pick]}</div>
          </div>
        ))}
      </div>
    </div>
  )
})

/**
 * An example site for a local business: a made-up bistro, with room for the client's
 * photos. data-line="i" is where line i of the code lands (with data-box, its outline
 * draws itself too); data-draw marks what comes up after the code has landed.
 */
function DemoPage() {
  const { page } = work.demo
  return (
    <div className="demo">
      <div className="demo__nav">
        <span className="demo__brand" data-line="0">
          {page.brand}
        </span>
        <span className="demo__links" data-draw="">
          {page.links.map((link) => (
            <span key={link}>{link}</span>
          ))}
        </span>
        <span className="demo__label mono" data-draw="">
          {page.label}
        </span>
      </div>
      <div className="demo__hero">
        <div className="demo__copy">
          <p className="demo__kicker mono" data-draw="">
            {page.kicker}
          </p>
          <p className="demo__title">
            <span data-line="1">{page.title[0]}</span>
            <br />
            <span data-line="2">{page.title[1]}</span>
          </p>
          <p className="demo__lead">
            <span data-line="3">{page.lead[0]}</span>
            <br />
            <span data-line="4">{page.lead[1]}</span>
          </p>
          <div className="demo__buttons" aria-hidden="true">
            <span className="demo__button demo__button--primary" data-line="5" data-box="">
              {page.book}
            </span>
            <span className="demo__button" data-draw="">
              {page.menu}
            </span>
          </div>
        </div>
        <div className="demo__photo" data-line="6" data-box="">
          <img src="/examples/bistro.jpg" width={1000} height={666} alt={page.alt} decoding="async" />
        </div>
      </div>
      <ul className="demo__info" data-draw="">
        {page.info.map((item) => (
          <li key={item.label}>
            <span className="mono">{item.label}</span> {item.value}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A second example site, for a craftsman: a made-up carpenter, the work in photos */
function CarpenterPage() {
  const { page } = work.carpenter
  const [main, ...thumbs] = page.photos
  return (
    <div className="carp">
      <div className="carp__nav">
        <span className="carp__brand">{page.brand}</span>
        <span className="carp__links">
          {page.links.map((link) => (
            <span key={link}>{link}</span>
          ))}
        </span>
        <span className="carp__label mono">{page.label}</span>
      </div>
      <div className="carp__hero">
        <figure className="carp__main">
          <img src={main.src} width={1000} height={671} alt={main.alt} loading="lazy" decoding="async" />
          <figcaption className="mono">{main.caption}</figcaption>
        </figure>
        <div className="carp__copy">
          <p className="carp__kicker mono">{page.kicker}</p>
          <p className="carp__title">
            {page.title[0]}
            <br />
            {page.title[1]}
          </p>
          <p className="carp__lead">{page.lead}</p>
          <div className="carp__buttons" aria-hidden="true">
            <span className="carp__button carp__button--primary">{page.quote}</span>
            <span className="carp__button">{page.works}</span>
          </div>
          <div className="carp__thumbs">
            {thumbs.map((photo) => (
              <figure key={photo.src}>
                <img src={photo.src} width={560} height={560} alt={photo.alt} loading="lazy" decoding="async" />
                <figcaption className="mono">{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Folio's home page, rebuilt in its own light colours */
function FolioPage() {
  const { href, page, cta } = work.folio
  return (
    <div className="folio">
      {/* Always in view over the page: Folio is free to use, today */}
      <a className="folio__try mono" href={href} target="_blank" rel="noreferrer">
        {cta} <span aria-hidden="true">↗</span>
      </a>
      <div className="folio__nav">
        <span className="folio__logo" aria-hidden="true" />
        <span className="folio__brand">Folio</span>
      </div>
      <div className="folio__hero">
        <div className="folio__copy">
          <p className="folio__badge">{page.badge}</p>
          <p className="folio__title">
            {page.title[0]}
            <br />
            {page.title[1]}
          </p>
          <p className="folio__lead">
            {page.lead[0]}
            <br />
            {page.lead[1]}
          </p>
          <p className="folio__drop">{page.drop}</p>
          <a className="folio__button" href={href} target="_blank" rel="noreferrer">
            <span aria-hidden="true">↑</span> {page.button}
          </a>
        </div>
        <div className="folio__shot">
          <img src="/projects/folio-shelf.jpg" width={980} height={670} alt={page.alt} loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  )
}

/** This site: its first screen, and the two surprises it hides */
function SitePage() {
  const { site } = work
  return (
    <div className="sitepage">
      <img
        className="sitepage__shot"
        src={`/og/og-${pageLang}.jpg`}
        width={1200}
        height={630}
        alt={site.alt}
        loading="lazy"
        decoding="async"
      />
      <div className="sitepage__panel">
        <p className="sitepage__heading">
          {site.heading} <span className="sitepage__note mono">{site.note}</span>
        </p>
        <ol className="sitepage__items">
          {site.items.map((item, i) => (
            <li key={item.name}>
              <p className="sitepage__name">
                <span className="mono">{String(i + 1).padStart(2, '0')}</span> {item.name}
              </p>
              <p className="sitepage__text">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
