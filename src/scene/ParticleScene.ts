import { bezier, clamp, easeInOutCubic, lerp, sstep } from '../lib/math'
import { hash2, mulberry32 } from '../lib/random'
import { CODE_LINES, contentSpan, tokenizeLine, type TokenKind } from './code'
import { sampleGlyph, sampleText, type Rect, type TextSpec } from './sample'
import { lineLanded, lineMove, lineStart, T } from './timeline'

export const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const PALETTE = [
  // 0–2 hero name, lit from above
  '#FFF4E6', '#E6DDD0', '#A0978B',
  // 3–7 syntax: punct, keyword, field, string, text
  '#6E6860', '#FFB547', '#E3C9A0', '#F28B54', '#EDE6DC',
  // 8–9 unused, kept so the indices below stay put
  '#F2EEE8', '#C98F4E',
  // 10 hero accent words (Stage.css .hero__accent)
  '#CBB594',
  // 11–13 more syntax: class names, methods, true/false/this
  '#7FD6BE', '#8FB6F2', '#C9A6F2',
]
/**
 * The hero title's CSS gradient (Stage.css .hero__title), as stops, sampled into
 * HERO_SHADES steps so the pixel copy shades continuously like the real text.
 */
const HERO_GRADIENT: [number, [number, number, number]][] = [
  [0, [0xff, 0xf7, 0xec]],
  [0.42, [0xf0, 0xe8, 0xdc]],
  [1, [0x9a, 0x91, 0x86]],
]
const HERO_SHADES = 12
const HERO_FIRST = PALETTE.length
for (let k = 0; k < HERO_SHADES; k++) {
  const t = k / (HERO_SHADES - 1)
  const j = HERO_GRADIENT.findIndex(([at]) => at >= t)
  const [a0, c0] = HERO_GRADIENT[Math.max(0, j - 1)]
  const [a1, c1] = HERO_GRADIENT[j]
  const f = a1 === a0 ? 0 : (t - a0) / (a1 - a0)
  PALETTE.push(`rgb(${c0.map((c, n) => Math.round(c + (c1[n] - c) * f)).join(',')})`)
}
const SYNTAX: Record<TokenKind, number> = { punct: 3, tag: 4, attr: 5, str: 6, text: 7, type: 11, fn: 12, lit: 13 }
/** The hero's accent words (Stage.css .hero__accent): light, warm sand */
const HERO_ACCENT = 10
const ALPHA_LEVELS = 12
const BUCKETS = PALETTE.length * ALPHA_LEVELS

const BAR = 44
/** The smallest the editor may shrink to, docked in the photo, and still be read */
const MIN_DOCK = 0.4
const PAD_X = 28
const PAD_Y = 26

/** The words of the code, before they take on the page's colours */
const CODE_TEXT: RGB = [0xed, 0xe6, 0xdc]
/** The outlines that draw themselves: the window, the button, the photo */
const OUTLINE = '#C98F4E'

type RGB = [number, number, number]

/** A rounded rectangle on the stage */
export type Box = { rect: Rect; radius: number }

/** Where the words of a line come to rest: the browser's own layout of them on the page */
export type LandingText = {
  x: number
  /** Alphabetic baseline */
  baseline: number
  size: number
  /** The font, minus its size: "italic 400" and the family */
  style: string
  family: string
  letterSpacing: number
  color: RGB
}

/** The part of the page a line of code writes: its words, an outline drawn around it, or both */
export type LineTarget = { text?: LandingText; box?: Box }

export type SceneInput = {
  width: number
  height: number
  dpr: number
  /** The service line, one spec per wrapped line */
  hero: TextSpec[]
  /** Top and bottom of the title element: the span of its CSS gradient */
  heroBox: { top: number; bottom: number }
  heroFontSize: number
  /** The browser window, whose outline draws itself around the editor */
  frame: Box | null
  /** Per line of code (CODE_LINES), the part of the page it moves into */
  lines: (LineTarget | null)[]
}

export type CodeLayout = Rect & {
  fontSize: number
  font: string
  cellW: number
  lineH: number
  originX: number
  originY: number
}

type Run = { text: string; col: number; color: string }

/** A line of code, split into what fades (its tags) and what moves (its words) */
type CodeLine = {
  tags: Run[]
  words: string
  /** Where its words start in the editor: left edge and alphabetic baseline */
  x: number
  baseline: number
  /** Centre of the whole line, where a line with no words (an <img>) starts from */
  cx: number
  cy: number
  /** Width of its words per px of font size: in the code's mono, and in the page's font */
  monoUnit: number
  pageUnit: number
  target: LineTarget | null
}

/** Where the editor is: scaled by s about its top left corner, which sits at (x, y) */
export type Dock = { s: number; x: number; y: number }

/**
 * The pixel sequence and what follows it. Every particle is one "pixel" with two homes:
 * A on the hero service line, B inside a code glyph: the title crumbles into the code.
 * Then the code becomes the page: the window's outline draws itself, and each line leaves
 * the editor, its tags fading while its words move into their place on the page.
 * `render(p)` is a pure function of scroll progress, so the sequence plays
 * identically backwards.
 */
export class ParticleScene {
  private ctx: CanvasRenderingContext2D
  private w = 0
  private h = 0
  private dpr = 1
  private n = 0
  code: CodeLayout | null = null

  // Homes
  private ax = new Float32Array(0)
  private ay = new Float32Array(0)
  private bx = new Float32Array(0)
  private by = new Float32Array(0)
  // Sizes per home
  private sA = 2
  private sB = 1.5
  // Colors
  private colA = new Uint8Array(0)
  private colB = new Uint8Array(0)
  // Timing
  private td = new Float32Array(0) // detach from the name
  private ta = new Float32Array(0) // start flying to the code
  private line = new Uint8Array(0)
  // Motion character
  private wind = new Float32Array(0)
  private lift = new Float32Array(0)
  private bend = new Float32Array(0)

  /** Per line of code: when it is fully assembled */
  private lineDone = new Float32Array(CODE_LINES.length)
  /** When the last line is assembled: from then on no particle is on screen */
  private allDone = 1
  private lines: CodeLine[] = []
  private frame: Box | null = null
  /** Where the editor goes once the code is written: the outline of the photo */
  private dockBox: Box | null = null

  // Per-frame scratch
  private px = new Float32Array(0)
  private py = new Float32Array(0)
  private ps = new Float32Array(0)
  private pb = new Uint16Array(0)
  private visible = new Uint8Array(0)
  private sorted = new Uint32Array(0)
  private counts = new Uint32Array(BUCKETS + 1)

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  get particleCount() {
    return this.n
  }

  build(input: SceneInput) {
    const { width: W, height: H, dpr } = input
    this.w = W
    this.h = H
    this.dpr = dpr
    this.canvas.width = Math.round(W * dpr)
    this.canvas.height = Math.round(H * dpr)
    this.canvas.style.width = `${W}px`
    this.canvas.style.height = `${H}px`
    this.frame = input.frame

    const code = (this.code = this.layoutCode(W, H, input.frame?.rect ?? null))
    const rnd = mulberry32(20261106)
    const maxCols = Math.max(...CODE_LINES.map((l) => l.length))

    // From the middle of a code line to the baseline its words sit on
    const ctx = this.ctx
    ctx.font = code.font
    const m = ctx.measureText('Mg')
    const baseOffset = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2

    // ---- B: pixels of every code glyph, line by line ----
    const codeStep = code.fontSize / 10
    this.sB = codeStep * 0.95
    const glyphs = new Map<string, number[]>()
    const glyph = (c: string) => {
      let g = glyphs.get(c)
      if (!g) {
        g = sampleGlyph(c, code.font, code.cellW, code.lineH, codeStep)
        glyphs.set(c, g)
      }
      return g
    }

    type Char = { line: number; col: number }
    const chars: Char[] = []
    const bX: number[] = []
    const bY: number[] = []
    const bChar: number[] = []
    const bCol: number[] = []
    this.lines = CODE_LINES.map((text, li) => {
      const kinds = tokenizeLine(text)
      const [from, to] = contentSpan(text)
      const tags: Run[] = []
      ;[...text].forEach((c, ci) => {
        // The words are drawn on their own, as one piece that can move
        if (ci < from || ci >= to) {
          const color = PALETTE[SYNTAX[kinds[ci]]]
          const last = tags[tags.length - 1]
          if (last && last.color === color && last.col + last.text.length === ci) last.text += c
          else tags.push({ text: c, col: ci, color })
        }
        if (c === ' ') return
        const g = glyph(c)
        const charIndex = chars.length
        chars.push({ line: li, col: ci })
        for (let k = 0; k < g.length / 2; k++) {
          bX.push(code.originX + ci * code.cellW + g[k * 2])
          bY.push(code.originY + li * code.lineH + g[k * 2 + 1])
          bChar.push(charIndex)
          bCol.push(SYNTAX[kinds[ci]])
        }
      })
      const mid = code.originY + li * code.lineH + code.lineH / 2
      const words = [...text].slice(from, to).join('')
      const target = input.lines[li] ?? null
      ctx.font = `400 100px ${MONO}`
      const monoUnit = ctx.measureText(words).width / 100
      let pageUnit = monoUnit
      if (target?.text) {
        ctx.font = `${target.text.style} 100px ${target.text.family}`
        pageUnit = ctx.measureText(words).width / 100 + (target.text.letterSpacing / target.text.size) * Math.max(0, [...words].length - 1)
      }
      return {
        tags,
        words,
        x: code.originX + from * code.cellW,
        baseline: mid + baseOffset,
        cx: code.originX + (text.length * code.cellW) / 2,
        cy: mid,
        monoUnit,
        pageUnit,
        target,
      }
    })
    this.dockBox = this.lines.find((l) => !l.words && l.target?.box)?.target?.box ?? null
    const nB = bX.length

    // ---- A: pixels of the service line, in reading order (line by line, left → right) ----
    const heroStep = clamp(input.heroFontSize / 28, 1.5, 3)
    this.sA = heroStep
    const hp: number[] = []
    const aOrder: number[] = []
    /** Per hero pixel: 1 when it belongs to the accent words, drawn in amber */
    const hAccent: number[] = []
    for (const spec of input.hero) {
      const pts = sampleText(spec, heroStep)
      const base = hp.length / 2
      for (let k = 0; k < pts.length / 2; k++) hAccent.push(spec.accent ? 1 : 0)
      const idx = Array.from({ length: pts.length / 2 }, (_, i) => i).sort(
        (i, j) => pts[i * 2] - pts[j * 2] || pts[i * 2 + 1] - pts[j * 2 + 1],
      )
      for (const i of idx) aOrder.push(base + i)
      hp.push(...pts)
    }
    const nA = hp.length / 2

    // ---- Particles: enough to cover every pixel of the name and of the code ----
    const N = (this.n = Math.max(nA, nB, 1))
    this.allocate(N)
    this.lineDone.fill(0)

    for (let i = 0; i < N; i++) {
      const ai = aOrder[Math.floor((i * nA) / N)]
      const bi = Math.floor((i * nB) / N)
      const ch = chars[bChar[bi]]

      this.ax[i] = hp[ai * 2]
      this.ay[i] = hp[ai * 2 + 1]
      // Same top-lit gradient as the CSS title, measured over the title's own box;
      // the accent words keep their amber
      const { top, bottom } = input.heroBox
      const shade = clamp((this.ay[i] - top) / Math.max(1, bottom - top))
      this.colA[i] = hAccent[ai] ? HERO_ACCENT : HERO_FIRST + Math.round(shade * (HERO_SHADES - 1))

      this.bx[i] = bX[bi]
      this.by[i] = bY[bi]
      this.colB[i] = bCol[bi]
      this.line[i] = ch.line

      // The first words crumble first and become the first lines of code
      const u = Math.floor((i * nA) / N) / Math.max(1, nA)
      this.td[i] = T.crumbleStart + u * T.crumbleSpread + rnd() * 0.015
      this.ta[i] = Math.max(lineStart(ch.line) + (ch.col / maxCols) * T.flyByColumn + rnd() * T.flyJitter, this.td[i] + 0.03)

      this.wind[i] = rnd() * 1.2 - 0.3
      this.lift[i] = rnd()
      this.bend[i] = rnd() - 0.5

      const done = this.ta[i] + T.fly
      if (done > this.lineDone[ch.line]) this.lineDone[ch.line] = done
    }
    this.allDone = Math.max(...this.lineDone) + 0.01
  }

  private allocate(N: number) {
    const f = () => new Float32Array(N)
    const u = () => new Uint8Array(N)
    this.ax = f(); this.ay = f(); this.bx = f(); this.by = f()
    this.colA = u(); this.colB = u()
    this.td = f(); this.ta = f()
    this.line = u()
    this.wind = f(); this.lift = f(); this.bend = f()
    this.px = f(); this.py = f(); this.ps = f()
    this.pb = new Uint16Array(N); this.visible = u()
    this.sorted = new Uint32Array(N)
  }

  /** The editor: centre stage, no wider than the browser window it will turn into */
  private layoutCode(W: number, H: number, frame: Rect | null): CodeLayout {
    const ctx = this.ctx
    const maxCols = Math.max(...CODE_LINES.map((l) => l.length))
    // Large and readable: as big as the screen allows, then shrunk only until it fits.
    // Phones get tighter padding and line numbers, so the code fills the screen width
    const narrow = W < 600
    const padX = narrow ? 14 : PAD_X
    const margin = narrow ? 24 : 40
    const room = frame && !narrow ? Math.min(W - margin, frame.w - 32) : W - margin
    let fontSize = narrow ? 18 : Math.round(clamp(Math.min(W / 50, H / 28), 12, 28))
    let cellW = 0
    let lineH = 0
    let gutter = 0
    let w = 0
    let font = ''
    for (; fontSize >= 8; fontSize--) {
      font = `400 ${fontSize}px ${MONO}`
      ctx.font = font
      cellW = ctx.measureText('M').width
      lineH = Math.round(fontSize * 1.7)
      gutter = Math.round(cellW * (narrow ? 3 : 4.5))
      w = Math.ceil(gutter + maxCols * cellW + padX * 2)
      const h = BAR + PAD_Y * 2 + CODE_LINES.length * lineH
      if (w <= room && h <= H * 0.72) break
    }
    // A little wider than its longest line, like a real editor
    if (!narrow) w = Math.min(room, Math.round(w + fontSize * 3))
    const h = BAR + PAD_Y * 2 + CODE_LINES.length * lineH
    // Centre stage: the window it turns into sits off to one side, past the cards, and
    // the editor travels there as it docks into the photo
    const x = Math.round((W - w) / 2)
    const y = Math.round(H * 0.5 - h / 2)
    return { x, y, w, h, fontSize, font, cellW, lineH, originX: x + padX + gutter, originY: y + BAR + PAD_Y }
  }

  /**
   * Where the editor is at p: in the middle of the stage, then shrinking into the photo's
   * outline so the words have the page to themselves. Stage.tsx moves the editor's chrome
   * the same way.
   */
  dock(p: number): Dock {
    const code = this.code
    const box = this.dockBox
    const k = easeInOutCubic(sstep(T.dock[0], T.dock[1], p))
    const still = { s: 1, x: code?.x ?? 0, y: code?.y ?? 0 }
    if (!code || !box || k <= 0) return still
    const { rect } = box
    const fit = Math.min(1, (rect.w * 0.94) / code.w, (rect.h * 0.94) / code.h)
    // Too small to read there (a phone's photo is a thin strip): the editor stays put and
    // only gives way from the top as its lines leave (cut)
    if (fit < MIN_DOCK) return still
    const s = lerp(1, fit, k)
    const x = lerp(code.x, rect.x + (rect.w - code.w * fit) / 2, k)
    const y = lerp(code.y, rect.y + (rect.h - code.h * fit) / 2, k)
    return { s, x, y }
  }

  /**
   * How much of the editor, from its top edge, is already gone: its bar and each line as
   * that line leaves, so the page shows through where the words are landing.
   * In the editor's own px; Stage.tsx clips the chrome to it.
   */
  cut(p: number) {
    const code = this.code
    if (!code) return 0
    let gone = 0
    for (let li = 0; li < CODE_LINES.length; li++) gone += sstep(lineMove(li), lineMove(li) + 0.025, p)
    return gone <= 0 ? 0 : (code.originY - code.y) * Math.min(1, gone) + gone * code.lineH
  }

  /** Draws the scene for scroll progress p (0 → 1). */
  render(p: number) {
    const { ctx, dpr, w: W, h: H } = this
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const code = this.code
    if (!code || p < T.swap[0]) return

    const winA = sstep(T.codeWindowIn[0], T.codeWindowIn[1], p) * (1 - sstep(T.codeWindowOut[0], T.codeWindowOut[1], p))

    // Crisp code text: shown once a line has fully assembled
    const crisp = this.lineDone.map((done) => sstep(done - 0.006, done + 0.006, p))

    const dock = this.dock(p)
    this.drawFrame(p)
    if (winA > 0.001) {
      this.toEditor(dock)
      this.drawGutter(p, winA)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    this.drawLines(p, crisp, dock)
    if (p < this.allDone) this.drawParticles(p, crisp)
    ctx.globalAlpha = 1
  }

  /** Draws in the editor's own coordinates, wherever it is docked */
  private toEditor({ s, x, y }: Dock) {
    const code = this.code!
    const d = this.dpr
    this.ctx.setTransform(d * s, 0, 0, d * s, d * (x - s * code.x), d * (y - s * code.y))
  }

  /** The browser window's outline, drawing itself around the editor */
  private drawFrame(p: number) {
    const frame = this.frame
    if (!frame) return
    const u = sstep(T.frameDraw[0], T.frameDraw[1], p)
    const a = 1 - sstep(T.frameOut[0], T.frameOut[1], p)
    if (u <= 0 || a <= 0) return
    this.strokeBox(frame, u, a, 1.5)
  }

  /** A rounded rectangle traced from its top left corner, clockwise: u of it drawn */
  private strokeBox({ rect, radius }: Box, u: number, a: number, width: number) {
    const { ctx } = this
    const { x, y, w, h } = rect
    const r = Math.min(radius, w / 2, h / 2)
    const length = 2 * (w + h) - (8 - 2 * Math.PI) * r
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = width
    ctx.setLineDash([length * u, length])
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  /** Line numbers, and the caret after the last assembled line */
  private drawGutter(p: number, winA: number) {
    const { ctx } = this
    const code = this.code!
    ctx.font = code.font
    ctx.textBaseline = 'middle'

    // Each number goes as its line leaves
    ctx.textAlign = 'right'
    ctx.fillStyle = '#4A453F'
    for (let li = 0; li < CODE_LINES.length; li++) {
      const a = sstep(this.lineDone[li] - 0.03, this.lineDone[li], p) * (1 - sstep(lineMove(li), lineMove(li) + 0.03, p)) * winA
      if (a <= 0.001) continue
      ctx.globalAlpha = a
      ctx.fillText(String(li + 1), code.originX - code.cellW * 1.8, code.originY + li * code.lineH + code.lineH / 2)
    }
    ctx.textAlign = 'left'

    if (p < lineMove(0)) {
      let li = 0
      let col = 0
      for (let i = 0; i < CODE_LINES.length; i++) {
        if (this.lineDone[i] <= p) {
          li = i
          col = CODE_LINES[i].length
        }
      }
      ctx.globalAlpha = winA * 0.9
      ctx.fillStyle = '#FFB547'
      ctx.fillRect(code.originX + col * code.cellW + 3, code.originY + li * code.lineH + code.lineH * 0.15, Math.max(2, code.cellW * 0.14), code.lineH * 0.7)
    }
  }

  /**
   * The code as text: still in the editor, then each line on its way into the page. Its tags
   * fade where they are; its words move, grow into the page's font and colour, and hand
   * over to the real text once they land. A line with no words (an <img>) shrinks into
   * the outline it draws.
   */
  private drawLines(p: number, crisp: Float32Array, dock: Dock) {
    const { ctx, dpr } = this
    const code = this.code!
    // From the editor's coordinates to the stage's
    const sx = (x: number) => dock.x + dock.s * (x - code.x)
    const sy = (y: number) => dock.y + dock.s * (y - code.y)

    this.lines.forEach((line, li) => {
      const shown = crisp[li]
      if (shown <= 0.001) return
      const raw = clamp((p - lineMove(li)) / T.move)
      const t = easeInOutCubic(raw)
      const landed = lineLanded(li)
      const handover = 1 - sstep(landed, landed + T.land, p)
      if (handover <= 0.001) return
      const target = line.target
      const text = target?.text
      const box = target?.box
      const mid = code.originY + li * code.lineH + code.lineH / 2

      // The tags: fade where they are, leaning a little toward where the line is going.
      // With no words to carry, the whole line travels into its outline and shrinks away
      const toX = text ? text.x : box ? box.rect.x + box.rect.w / 2 : sx(line.cx)
      const toY = text ? text.baseline : box ? box.rect.y + box.rect.h / 2 : sy(mid)
      const lean = line.words ? 0.12 * t : t
      const tagA = line.words ? 1 - sstep(0, 0.4, raw) : 1 - sstep(0.3, 0.9, raw)
      if (tagA > 0.001) {
        const scale = dock.s * (line.words ? 1 : lerp(1, 0.4, t))
        const cx = sx(line.cx)
        const cy = sy(mid)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.globalAlpha = shown * tagA
        ctx.font = code.font
        ctx.textBaseline = 'middle'
        ctx.translate(cx + (toX - cx) * lean, cy + (toY - cy) * lean)
        ctx.scale(scale, scale)
        for (const run of line.tags) {
          ctx.fillStyle = run.color
          ctx.fillText(run.text, code.originX + run.col * code.cellW - line.cx, 0)
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }

      // The outline it writes on the page (the button, the photo), drawn as it arrives
      if (box) {
        const u = sstep(0.35, 1, raw)
        if (u > 0) this.strokeBox(box, u, handover, 1.3)
      }

      if (!line.words) return
      ctx.textBaseline = 'alphabetic'
      const x0 = sx(line.x)
      const y0 = sy(line.baseline)
      const size0 = code.fontSize * dock.s
      if (!text) {
        // Nowhere to land (the part isn't on screen): the words fade with their tags
        ctx.globalAlpha = shown * tagA
        ctx.font = `400 ${size0.toFixed(2)}px ${MONO}`
        ctx.fillStyle = rgb(CODE_TEXT)
        ctx.fillText(line.words, x0, y0)
        return
      }
      const x = lerp(x0, text.x, t)
      const y = lerp(y0, text.baseline, t) - Math.sin(Math.PI * t) * Math.min(48, Math.abs(text.baseline - y0) * 0.3)
      const size = lerp(size0, text.size, t)
      // Both faces are stretched to one shared width, so the mono leaving and the page's
      // font arriving cover the same words and the change reads as one piece of text
      const width = lerp(line.monoUnit * size0, line.pageUnit * text.size, t)
      const into = sstep(0.2, 0.65, raw)
      const a = shown * handover
      const draw = (font: string, unit: number, alpha: number, color: string, spacing: number) => {
        if (alpha <= 0.001) return
        ctx.globalAlpha = alpha
        ctx.font = font
        ctx.fillStyle = color
        if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing.toFixed(2)}px`
        ctx.translate(x, y)
        ctx.scale(width / Math.max(1, unit * size), 1)
        ctx.fillText(line.words, 0, 0)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
      }
      // Out of the dark editor and onto the light page: the words take the page's colour early
      const color = rgb(mix(CODE_TEXT, text.color, sstep(0.02, 0.4, raw)))
      draw(`400 ${size.toFixed(2)}px ${MONO}`, line.monoUnit, a * (1 - into), color, 0)
      draw(
        `${text.style} ${size.toFixed(2)}px ${text.family}`,
        line.pageUnit,
        a * into,
        color,
        (text.letterSpacing * size) / text.size,
      )
    })
  }

  private drawParticles(p: number, crisp: Float32Array) {
    const { ctx, n: N } = this
    const swapA = sstep(T.swap[0], T.swap[1], p)
    const tremble = Math.floor(p * 900)
    const counts = this.counts
    counts.fill(0)

    for (let i = 0; i < N; i++) {
      const td = this.td[i]
      const ta = this.ta[i]
      let x: number
      let y: number
      let a = 1
      let size: number
      let color: number

      if (p < td) {
        // Still part of the letter; it shivers right before letting go
        x = this.ax[i]
        y = this.ay[i]
        a = swapA
        size = this.sA
        color = this.colA[i]
        const pre = sstep(td - 0.025, td, p)
        if (pre > 0) {
          const h = hash2(i, tremble)
          x += ((h & 7) - 3.5) * 0.22 * pre
          y += (((h >> 3) & 7) - 3.5) * 0.22 * pre
        }
      } else if (p < ta) {
        // Crumbling: falls like sand, carried slightly by the wind
        const dt = p - td
        x = this.ax[i] + this.wind[i] * dt * 1400
        y = this.ay[i] + dt * dt * 26000 - this.lift[i] * dt * 500
        size = this.sA
        color = this.colA[i]
      } else if (p < ta + T.fly) {
        // Pulled into its place inside a code glyph
        const t = easeInOutCubic((p - ta) / T.fly)
        const dt = ta - td
        const sx = this.ax[i] + this.wind[i] * dt * 1400
        const sy = this.ay[i] + dt * dt * 26000 - this.lift[i] * dt * 500
        const bx = this.bx[i]
        const by = this.by[i]
        x = bezier(sx, (sx + bx) / 2 + this.bend[i] * 180, bx, t)
        y = bezier(sy, Math.min(sy, by) - 30 - Math.abs(this.bend[i]) * 120, by, t)
        size = lerp(this.sA, this.sB, t)
        color = t < 0.55 ? this.colA[i] : this.colB[i]
      } else {
        // Part of the code: gives way to the crisp line once that has assembled
        x = this.bx[i]
        y = this.by[i]
        a = 1 - crisp[this.line[i]]
        size = this.sB
        color = this.colB[i]
      }

      if (a <= 0.02) {
        this.visible[i] = 0
        continue
      }
      const level = Math.min(ALPHA_LEVELS - 1, Math.ceil(a * ALPHA_LEVELS) - 1)
      const bucket = color * ALPHA_LEVELS + level
      this.px[i] = x
      this.py[i] = y
      this.ps[i] = size
      this.pb[i] = bucket
      this.visible[i] = 1
      counts[bucket + 1]++
    }

    // Counting sort by bucket, then one path per (color, alpha) pair
    for (let b = 1; b <= BUCKETS; b++) counts[b] += counts[b - 1]
    const starts = counts.slice()
    for (let i = 0; i < N; i++) if (this.visible[i]) this.sorted[starts[this.pb[i]]++] = i

    for (let b = 0; b < BUCKETS; b++) {
      const from = counts[b]
      const to = counts[b + 1]
      if (from === to) continue
      ctx.globalAlpha = ((b % ALPHA_LEVELS) + 1) / ALPHA_LEVELS
      ctx.fillStyle = PALETTE[Math.floor(b / ALPHA_LEVELS)]
      ctx.beginPath()
      for (let k = from; k < to; k++) {
        const i = this.sorted[k]
        const s = this.ps[i]
        ctx.rect(this.px[i] - s / 2, this.py[i] - s / 2, s, s)
      }
      ctx.fill()
    }
  }
}

const rgb = ([r, g, b]: RGB) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
