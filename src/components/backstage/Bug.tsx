import './Bug.css'

type BugProps = {
  /** Accessible name: the only description a screen reader gets */
  label: string
  onClick: () => void
  /** Placement modifier (bug--stage, bug--footer): each egg sits somewhere else */
  className: string
}

/**
 * An easter-egg trigger: four stray pixels, still and barely visible. They glitch green
 * under the mouse and open something hidden. Left out of the tab order on purpose.
 */
export function Bug({ label, onClick, className }: BugProps) {
  return (
    <button type="button" className={`bug ${className}`} tabIndex={-1} aria-label={label} onClick={onClick}>
      <span className="bug__px" />
    </button>
  )
}
