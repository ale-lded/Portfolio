import { lazy, Suspense, useEffect, useState } from 'react'
import { onOpenTerminal } from '../../lib/terminal'

/** The terminal (and its cipher) is only downloaded by those who find the cursor. */
const Terminal = lazy(() => import('./Terminal').then((m) => ({ default: m.Terminal })))

/** Always mounted, tiny: waits for the footer cursor, then loads and opens the terminal. */
export function TerminalHost() {
  const [open, setOpen] = useState(false)
  /** Opened at least once: the terminal stays mounted after that, so its text survives a close */
  const [visited, setVisited] = useState(false)

  useEffect(
    () =>
      onOpenTerminal(() => {
        setVisited(true)
        setOpen(true)
      }),
    [],
  )

  if (!visited) return null
  return (
    <Suspense fallback={null}>
      <Terminal open={open} onClose={() => setOpen(false)} />
    </Suspense>
  )
}
