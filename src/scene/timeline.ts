import { hero } from '../content'
import { CODE_LINES } from './code'

/**
 * Every moment of the sequence, as a fraction of the stage scroll (0 → 1).
 * Phases: 0–0.13 hero · 0.13–0.57 crumble into code · 0.57–0.64 the code, readable
 * · 0.64–0.87 its pixels fly into the project cards · 0.87–1 still.
 */
export const T = {
  hintOut: [0.003, 0.028],
  heroCopyOut: [0.043, 0.128],
  /** DOM name hands over to its pixel copy */
  swap: [0.12, 0.142],
  crumbleStart: 0.135,
  crumbleSpread: 0.156,
  firstLine: 0.2125,
  lineSpread: 0.241,
  fly: 0.078,
  /** Small spreads that keep a line's characters from landing all at once */
  flyByColumn: 0.028,
  flyJitter: 0.014,
  codeWindowIn: [0.184, 0.283],
  codeWindowOut: [0.64, 0.72],
  /** The code's pixels lift off the window, left to right, and arc into the cards */
  liftStart: 0.64,
  liftSpread: 0.04,
  liftJitter: 0.03,
  converge: 0.16,
  cardsIn: [0.84, 0.92],
  particlesOut: [0.86, 0.93],
  decode: [0.86, 0.97],
} as const

const LAST_LINE = CODE_LINES.length - 1

/** When the characters of a code line start flying into the window. */
export const lineStart = (line: number) => T.firstLine + (line / LAST_LINE) * T.lineSpread

export const PHASES: [end: number, label: string][] = [
  [0.28, hero.phases[0]],
  [0.64, hero.phases[1]],
  [1.01, hero.phases[2]],
]
