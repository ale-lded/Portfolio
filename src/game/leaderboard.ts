import type { SetupId, TyreId } from './car'

/**
 * The podium: the three best times. It starts with the house record on top; the
 * player's times are saved in this browser only (localStorage) and merged with it,
 * so beating the record pushes it down the podium, and off it in the end.
 * Swap stored() and the write in add() for calls to a server to share the board.
 */
export type Entry = {
  /** Three letters, arcade style */
  name: string
  /** Race time, seconds */
  time: number
  best: number
  tyre: TyreId
  setup: SetupId
  /** When it was set, ms since epoch: breaks ties and marks the new entry (0 for the house) */
  at: number
}

/** One lap since v2: the 3-lap times under the old key are not comparable */
const KEY = 'backstage-gp:1-lap:top3'
const OLD_KEY = 'backstage-gp:top3'
/** The player's initials: asked once, then every podium time goes under them */
const NAME_KEY = 'backstage-gp:name'
export const SIZE = 3

/**
 * The house record, on top of the podium from the start. Measured with a robot driver
 * on the ideal racing line, the limit of the car is about 20.3 s (speed setup); this
 * leaves about a second for a person on a keyboard. Hard, not impossible.
 */
export const HOUSE: Entry = { name: 'ALE', time: 21.184, best: 21.184, tyre: 'medium', setup: 'speed', at: 0 }

/** The podium as it stands: the house record and the player's best times. */
export function load(): Entry[] {
  return [HOUSE, ...stored()].sort(order).slice(0, SIZE)
}

/** Would this time make the podium? */
export function qualifies(time: number, board = load()) {
  return board.length < SIZE || time < board[board.length - 1].time
}

/** Adds one of the player's times and returns the new podium. */
export function add(entry: Entry): Entry[] {
  // To the millisecond, as shown
  const ms = (t: number) => Math.round(t * 1000) / 1000
  const mine = [...stored(), { ...entry, time: ms(entry.time), best: ms(entry.best) }].sort(order).slice(0, SIZE)
  try {
    localStorage.setItem(KEY, JSON.stringify(mine))
  } catch {
    // Storage blocked (private mode): the podium still shows for this visit
  }
  return [HOUSE, ...mine].sort(order).slice(0, SIZE)
}

/** The player's initials, or '' if they haven't made the podium yet. */
export function loadName() {
  try {
    return cleanName(localStorage.getItem(NAME_KEY) ?? '')
  } catch {
    return ''
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, cleanName(name))
  } catch {
    // Not remembered: they'll be asked again next time
  }
}

/** Up to three letters and digits, upper case. */
export const cleanName = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)

/** The player's own times, best first. */
function stored(): Entry[] {
  try {
    localStorage.removeItem(OLD_KEY)
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as Entry[]) : []
    return Array.isArray(list) ? list.filter(valid).sort(order).slice(0, SIZE) : []
  } catch {
    return []
  }
}

const order = (a: Entry, b: Entry) => a.time - b.time || a.at - b.at

function valid(e: Entry) {
  return e && typeof e.name === 'string' && Number.isFinite(e.time) && e.time > 0 && typeof e.tyre === 'string' && e.at > 0
}
