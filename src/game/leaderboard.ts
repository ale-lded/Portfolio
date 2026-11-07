import type { SetupId, TyreId } from './car'

/**
 * The top three race times. For now they live in this browser only (localStorage):
 * swap load() and save() for calls to a server to share them between visitors.
 */
export type Entry = {
  /** Three letters, arcade style */
  name: string
  /** Total race time, seconds */
  time: number
  best: number
  tyre: TyreId
  setup: SetupId
  /** When it was set, ms since epoch: breaks ties and marks the new entry */
  at: number
}

/** One lap since v2: the 3-lap times under the old key are not comparable */
const KEY = 'backstage-gp:1-lap:top3'
const OLD_KEY = 'backstage-gp:top3'
export const SIZE = 3

/**
 * The track record, set by the house: the time to beat. Measured with a robot driver
 * on the ideal racing line, the limit of the car is about 20.3 s (speed setup); this
 * leaves about a second for a person on a keyboard. Hard, not impossible.
 */
export const TRACK_RECORD = 21.184

export function load(): Entry[] {
  try {
    localStorage.removeItem(OLD_KEY)
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as Entry[]) : []
    return Array.isArray(list) ? list.filter(valid).sort(order).slice(0, SIZE) : []
  } catch {
    return []
  }
}

/** Would this time make the board? */
export function qualifies(time: number, board = load()) {
  return board.length < SIZE || time < board[board.length - 1].time
}

/** Adds an entry and returns the new board. */
export function add(entry: Entry): Entry[] {
  // To the millisecond, as shown
  const ms = (t: number) => Math.round(t * 1000) / 1000
  const board = [...load(), { ...entry, time: ms(entry.time), best: ms(entry.best) }].sort(order).slice(0, SIZE)
  try {
    localStorage.setItem(KEY, JSON.stringify(board))
  } catch {
    // Storage blocked (private mode): the board still shows for this visit
  }
  return board
}

/** Up to three letters and digits, upper case. */
export const cleanName = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)

const order = (a: Entry, b: Entry) => a.time - b.time || a.at - b.at

function valid(e: Entry) {
  return e && typeof e.name === 'string' && Number.isFinite(e.time) && e.time > 0 && typeof e.tyre === 'string'
}
