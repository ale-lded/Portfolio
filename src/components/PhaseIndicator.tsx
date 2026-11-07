import { forwardRef } from 'react'
import './PhaseIndicator.css'

type PhaseIndicatorProps = {
  /** Label shown before the sequence starts */
  label: string
}

/**
 * Bottom-left caption of a scroll sequence: the current phase and a progress bar.
 * The owning stage drives it every frame (opacity, .phase__label text, .phase__fill scale).
 */
export const PhaseIndicator = forwardRef<HTMLDivElement, PhaseIndicatorProps>(function PhaseIndicator({ label }, ref) {
  return (
    <div className="phase mono" ref={ref} aria-hidden="true">
      <span className="phase__label">{label}</span>
      <span className="phase__bar">
        <span className="phase__fill" />
      </span>
    </div>
  )
})
