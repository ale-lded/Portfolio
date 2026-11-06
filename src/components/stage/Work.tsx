import { projects } from '../../content'

/** The three project cards the binary recomposes into. */
export function Work() {
  return (
    <div className="work">
      <div className="work__head mono">
        <span>Progetti selezionati</span>
        <span>({String(projects.length).padStart(2, '0')})</span>
      </div>
      <ul className="work__cards">
        {projects.map((project, i) => (
          <li key={project.title} className="card">
            <div className="card__top mono">
              <span className="card__index">{String(i + 1).padStart(2, '0')}</span>
              <span className="card__arrow" aria-hidden="true">
                ↗
              </span>
            </div>
            <h3 className="card__title">{project.title}</h3>
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
          </li>
        ))}
      </ul>
    </div>
  )
}
