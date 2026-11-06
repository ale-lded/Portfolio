import { CODE_LINES } from './code'

/**
 * Every moment of the sequence, as a fraction of the stage scroll (0 → 1).
 * Phases: 0–0.10 hero · 0.10–0.35 crumble into code · 0.35–0.60 code → binary
 * · 0.60–0.85 recompose into the projects · 0.85–1 still.
 */
export const T = {
  hintOut: [0.002, 0.02],
  heroCopyOut: [0.03, 0.09],
  /** DOM name hands over to its pixel copy */
  swap: [0.085, 0.1],
  crumbleStart: 0.095,
  crumbleSpread: 0.11,
  firstLine: 0.15,
  lineSpread: 0.17,
  fly: 0.055,
  codeWindowIn: [0.13, 0.2],
  codeWindowOut: [0.555, 0.61],
  binaryStart: 0.44,
  binarySpread: 0.05,
  morph: 0.025,
  rainStart: 0.525,
  ambientRain: [0.48, 0.53, 0.58, 0.66],
  convergeStart: 0.615,
  converge: 0.12,
  cardsIn: [0.78, 0.86],
  particlesOut: [0.8, 0.87],
  decode: [0.8, 0.93],
} as const

const LAST_LINE = CODE_LINES.length - 1

/** When the characters of a code line start flying into the window. */
export const lineStart = (line: number) => T.firstLine + (line / LAST_LINE) * T.lineSpread

/** When a code line starts turning into binary. */
export const lineBinary = (line: number) => T.binaryStart + (line / LAST_LINE) * T.binarySpread

export const PHASES: [end: number, label: string][] = [
  [0.35, '01 — Sgretolamento'],
  [0.6, '02 — Codice → binario'],
  [0.85, '03 — Ricomposizione'],
  [1.01, '04 — Progetti'],
]
