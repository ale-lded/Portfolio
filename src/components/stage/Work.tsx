import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { projects, work, type Project } from '../../content'

/** The three project cards the binary recomposes into. */
export function Work() {
  return (
    <div className="work">
      <div className="work__head mono">
        <span>{work.heading}</span>
        <span>({String(projects.length).padStart(2, '0')})</span>
      </div>
      <ul className="work__cards">
        {projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </ul>
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [flipped, setFlipped] = useState(false)
  const card = useRef<HTMLLIElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const flipButton = useRef<HTMLButtonElement>(null)
  const backHeading = useRef<HTMLParagraphElement>(null)
  const { details, back } = project

  /** Turns the card edge-on, swaps the faces out of sight, and turns it back */
  const flip = async (to: boolean) => {
    const el = card.current
    // Keep the focus on the face that is now showing
    const focus = () => (to ? backHeading.current : flipButton.current)?.focus()
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flushSync(() => setFlipped(to))
      focus()
      return
    }
    const sign = to ? 1 : -1
    const edge = (deg: number) => `perspective(1400px) rotateY(${deg}deg)`
    await el.animate([{ transform: edge(0) }, { transform: edge(90 * sign) }], {
      duration: 280,
      easing: 'cubic-bezier(0.5, 0, 0.9, 0.5)',
    }).finished
    flushSync(() => setFlipped(to))
    focus()
    el.animate([{ transform: edge(-90 * sign) }, { transform: edge(0) }], {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.15)',
    })
  }

  return (
    <li className={`card${flipped ? ' is-flipped' : ''}`} ref={card}>
      <div className="card__front" inert={flipped}>
        <div className="card__top mono">
          <span className="card__index">{String(index + 1).padStart(2, '0')}</span>
          {project.status ? (
            <span className="card__status">{project.status}</span>
          ) : (
            project.href && (
              <span className="card__arrow" aria-hidden="true">
                ↗
              </span>
            )
          )}
        </div>
        <h3 className="card__title">
          {project.href ? (
            <a className="card__link" href={project.href} target="_blank" rel="noreferrer">
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>
        <p className="card__desc" data-decode={project.description}>
          {project.description}
        </p>
        <ul className="card__tags">
          {project.tags.map((tag) => (
            <li key={tag} className="card__tag mono" data-decode={tag}>
              {tag}
            </li>
          ))}
        </ul>
        {/* Always there, even empty, so the titles line up across the cards */}
        <div className="card__actions">
          {details && (
            <button type="button" className="card__action mono" onClick={() => dialog.current?.showModal()}>
              {details.open} <span aria-hidden="true">↗</span>
            </button>
          )}
          {back && (
            <button
              type="button"
              className="card__action mono"
              ref={flipButton}
              aria-expanded={flipped}
              onClick={() => void flip(true)}
            >
              {back.open} <span aria-hidden="true">↻</span>
            </button>
          )}
        </div>
      </div>

      {back && (
        <div className="card__back" inert={!flipped}>
          <p className="card__back-heading" ref={backHeading} tabIndex={-1}>
            {back.heading}
          </p>
          <ol className="card__secrets">
            {back.items.map((item, i) => (
              <li key={item.name}>
                <p className="card__secret-name">
                  <span className="card__index mono">{String(i + 1).padStart(2, '0')}</span> {item.name}
                </p>
                <p className="card__secret-text">{item.text}</p>
              </li>
            ))}
          </ol>
          <button type="button" className="card__action mono" onClick={() => void flip(false)}>
            <span aria-hidden="true">↺</span> {back.close}
          </button>
        </div>
      )}

      {details && (
        <dialog
          ref={dialog}
          className="project"
          aria-label={project.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) e.currentTarget.close()
          }}
        >
          <div className="project__panel">
            <img
              className="project__shot"
              src={details.image.src}
              width={details.image.width}
              height={details.image.height}
              alt={details.image.alt}
              loading="lazy"
              decoding="async"
            />
            <div className="project__body">
              <div>
                <p className="project__title">{project.title}</p>
                {project.status && <span className="card__status mono">{project.status}</span>}
              </div>
              <div className="project__story">
                {details.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="project__progress mono">{details.progress}</p>
                <div className="project__actions">
                  {details.href ? (
                    <a className="project__cta" href={details.href} target="_blank" rel="noreferrer">
                      {details.cta} <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <>
                      <span className="project__cta project__cta--soon" aria-disabled="true">
                        {details.cta} <span aria-hidden="true">→</span>
                      </span>
                      <span className="project__soon mono">{details.soon}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button type="button" className="lightbox__close mono" onClick={() => dialog.current?.close()}>
            {details.close} ✕
          </button>
        </dialog>
      )}
    </li>
  )
}
