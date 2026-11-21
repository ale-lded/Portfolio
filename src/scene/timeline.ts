import { hero } from '../content'
import { CODE_LINES } from './code'

/**
 * The stage's scroll (Stage.css): 120vh build the first example site, then 130vh slide
 * the window along to the other three pages, with a pause on each. BUILD is the build's
 * share of the whole sequence; the build's moments below are written on its own 0 → 1 and
 * scaled into place, so lengthening the slides never changes how the build plays.
 */
export const SEQUENCE_VH = 250
export const BUILD = 120 / SEQUENCE_VH

/**
 * Every moment of the build, as a fraction of the build's scroll (0 → 1).
 * Phases: 0–0.13 hero · 0.13–0.57 crumble into code · 0.57–0.64 the code, readable
 * · 0.64–0.90 the site draws itself and each line moves into it · 0.90–1 still.
 */
const BUILD_T = {
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
  /** The editor stays until its last line has left, then goes */
  codeWindowOut: [0.8, 0.86],

  /** The browser window's outline draws itself around the editor… */
  frameDraw: [0.62, 0.7],
  /** …the page fills in behind it (the real window, its moving parts still hidden)… */
  pageBg: [0.66, 0.74],
  /** …and the drawn outline gives way to the window's own border */
  frameOut: [0.74, 0.78],
  /** Meanwhile the editor shrinks into the photo's place, out of the way of the words */
  dock: [0.62, 0.7],
  /** Each line leaves the editor in turn and moves into its place on the page */
  moveStart: 0.7,
  moveStagger: 0.017,
  move: 0.1,
  /** Once landed, a line hands over to the real text on the page */
  land: 0.012,
  /** The rest of the page (links, label, opening hours) comes up last */
  pageRest: [0.84, 0.9],
  heading: [0.8, 0.88],
  pickerIn: [0.87, 0.94],
} as const

type Scaled<V> = V extends number ? number : V extends readonly number[] ? { [K in keyof V]: number } : V
const scale = <O extends Record<string, number | readonly number[]>>(o: O, k: number) =>
  Object.fromEntries(
    Object.entries(o).map(([key, v]) => [key, typeof v === 'number' ? v * k : v.map((n) => n * k)]),
  ) as { [K in keyof O]: Scaled<O[K]> }

/** Every moment of the sequence, as a fraction of the stage scroll (0 → 1) */
export const T = {
  ...scale(BUILD_T, BUILD),
  /** Once the first page is built, the window slides on to each of the others in turn;
   *  between two slides the page holds still long enough to be read */
  slides: [
    [0.54, 0.64],
    [0.7, 0.8],
    [0.86, 0.96],
  ] as [number, number][],
}

/** Where the rail is at p: 0 on the first page, 1 on the second, and so on */
export const railAt = (p: number) =>
  T.slides.reduce((at, [a, b]) => {
    const t = Math.min(1, Math.max(0, (p - a) / (b - a)))
    return at + t * t * (3 - 2 * t)
  }, 0)

/** Where the scroll shows page i at rest: in the pause after the slide that brings it in */
export const pageAt = (i: number) => (i === 0 ? (T.pickerIn[1] + T.slides[0][0]) / 2 : T.slides[i - 1][1] + 0.025)

const LAST_LINE = CODE_LINES.length - 1

/** When the characters of a code line start flying into the window. */
export const lineStart = (line: number) => T.firstLine + (line / LAST_LINE) * T.lineSpread

/** When a line of code leaves the editor, and when it has landed on the page. */
export const lineMove = (line: number) => T.moveStart + line * T.moveStagger
export const lineLanded = (line: number) => lineMove(line) + T.move

export const PHASES: [end: number, label: string][] = [
  [0.28 * BUILD, hero.phases[0]],
  [0.64 * BUILD, hero.phases[1]],
  [1.01, hero.phases[2]],
]
