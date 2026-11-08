import { useRef } from 'react'
import { about } from '../content'
import './sections.css'

/** The method lives in the stack sequence further down (StackStage). */
export function About() {
  const dialog = useRef<HTMLDialogElement>(null)
  const { photo } = about

  return (
    <section id="about" className="section about">
      <p className="section__label mono">{about.label}</p>
      <div className="about__grid">
        <div>
          <h2 className="about__heading">{about.heading}</h2>
          <figure className="photo">
            <button type="button" className="photo__open" onClick={() => dialog.current?.showModal()}>
              <img
                className="photo__img"
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />
              <span className="sr-only">{photo.open}</span>
            </button>
            <figcaption className="photo__caption mono">
              <span>{photo.caption}</span>
              <span>{photo.film}</span>
            </figcaption>
          </figure>
        </div>
        <div>
          {about.bio.map((paragraph) => (
            <p key={paragraph} className="about__bio">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* The photo, larger: closes with Esc, the button, or a click outside the print */}
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={photo.caption}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close()
        }}
      >
        <figure className="lightbox__print">
          <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} />
          <figcaption className="lightbox__caption">
            <p>{photo.story}</p>
            <p className="mono">
              {photo.caption} · {photo.film}
            </p>
          </figcaption>
        </figure>
        <button type="button" className="lightbox__close mono" onClick={() => dialog.current?.close()}>
          {photo.close} ✕
        </button>
      </dialog>
    </section>
  )
}
