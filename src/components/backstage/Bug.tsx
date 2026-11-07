import { backstage } from '../../content'
import { enterBackstage } from '../../lib/backstage'
import './Bug.css'

/**
 * The easter egg: four stray pixels lying on the stage floor, the same colour as the
 * dust in the beam but perfectly still. They glitch green under the mouse and lead
 * backstage. Desktop only (see Bug.css) and left out of the tab order on purpose.
 */
export function Bug() {
  return (
    <button type="button" className="bug" tabIndex={-1} aria-label={backstage.bug} onClick={enterBackstage}>
      <span className="bug__px" />
    </button>
  )
}
