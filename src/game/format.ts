/** Race time in seconds → "1:08.123" */
export function formatTime(t: number) {
  const ms = Math.round(t * 1000)
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`
}
