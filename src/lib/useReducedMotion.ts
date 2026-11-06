import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** True when the visitor asked the OS for less motion. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
