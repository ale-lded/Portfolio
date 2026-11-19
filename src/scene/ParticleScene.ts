import { bezier, clamp, easeInOutCubic, lerp, sstep } from '../lib/math'
import { hash2, mulberry32 } from '../lib/random'
import { CODE_LINES, tokenizeLine, type TokenKind } from './code'
import { sampleGlyph, sampleRoundedRect, sampleText, type Rect, type TextSpec } from './sample'
import { lineStart, T } from './timeline'

export const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const PALETTE = [
  // 0–2 hero name, lit from above
  '#FFF4E6', '#E6DDD0', '#A0978B',
  // 3–7 syntax: punct, keyword, field, string, text
  '#6E6860', '#FFB547', '#E3C9A0', '#F28B54', '#EDE6DC',
  // 8 card title · 9 card outline
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
const CARD_TITLE = 8
const CARD_OUTLINE = 9
/** The hero's accent words (Stage.css .hero__accent): light, warm sand */
const HERO_ACCENT = 10
const ALPHA_LEVELS = 12
const BUCKETS = PALETTE.length * ALPHA_LEVELS

const BAR = 44
const PAD_X = 24
const PAD_Y = 22

export type CardSpec = { rect: Rect; title: TextSpec; radius: number }

export type SceneInput = {
  width: number
  height: number
  dpr: number
  /** The service line, one spec per wrapped line */
  hero: TextSpec[]
  /** Top and bottom of the title element: the span of its CSS gradient */
  heroBox: { top: number; bottom: number }
  heroFontSize: number
  cards: CardSpec[]
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

/**
 * The pixel sequence. Every particle is one "pixel" with three homes:
 * A on the hero service line, B inside a code glyph, D on a project card: the title
 * crumbles into the code, and the code lifts off into the cards.
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
  private dx = new Float32Array(0)
  private dy = new Float32Array(0)
  // Sizes per home
  private sA = 2
  private sB = 1.5
  private sD = new Float32Array(0)
  // Colors
  private colA = new Uint8Array(0)
  private colB = new Uint8Array(0)
  private colD = new Uint8Array(0)
  // Timing
  private td = new Float32Array(0) // detach from the name
  private ta = new Float32Array(0) // start flying to the code
  private tc = new Float32Array(0) // lift off the code, toward the cards
  private line = new Uint8Array(0)
  // Motion character
  private wind = new Float32Array(0)
  private lift = new Float32Array(0)
  private bend = new Float32Array(0)

  // Per-line state of the code: when it is fully assembled, and when its pixels start leaving
  private lineDone = new Float32Array(CODE_LINES.length)
  private lineLift = new Float32Array(CODE_LINES.length)
  private runs: Run[][] = []

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

    const code = (this.code = this.layoutCode(W, H))
    const rnd = mulberry32(20261106)
    const maxCols = Math.max(...CODE_LINES.map((l) => l.length))

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
    this.runs = CODE_LINES.map((text, li) => {
      const kinds = tokenizeLine(text)
      const runs: Run[] = []
      ;[...text].forEach((c, ci) => {
        const color = PALETTE[SYNTAX[kinds[ci]]]
        const last = runs[runs.length - 1]
        if (last && last.color === color && last.col + last.text.length === ci) last.text += c
        else runs.push({ text: c, col: ci, color })
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
      return runs
    })
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

    // ---- D: card titles and outlines, ordered left → right ----
    const dX: number[] = []
    const dY: number[] = []
    const dSize: number[] = []
    const dCol: number[] = []
    for (const card of input.cards) {
      const t = sampleText(card.title, 1.6)
      for (let k = 0; k < t.length; k += 2) {
        dX.push(t[k])
        dY.push(t[k + 1])
        dSize.push(1.5)
        dCol.push(CARD_TITLE)
      }
      const o = sampleRoundedRect(card.rect, card.radius, 2.2)
      for (let k = 0; k < o.length; k += 2) {
        dX.push(o[k])
        dY.push(o[k + 1])
        dSize.push(1.3)
        dCol.push(CARD_OUTLINE)
      }
    }
    const nD = dX.length
    const dOrder = Array.from({ length: nD }, (_, i) => i).sort((i, j) => dX[i] - dX[j])

    // ---- Particles: enough to cover every pixel of the name and of the code ----
    const N = (this.n = Math.max(nA, nB, 1))
    this.allocate(N)
    this.lineDone.fill(0)
    this.lineLift.fill(1)

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

    // Cards: sort particles by their x in the code, so each card pulls from the part of the
    // window above it and the code empties left to right
    const byX = Array.from({ length: N }, (_, i) => i).sort((i, j) => this.bx[i] - this.bx[j])
    for (let r = 0; r < N; r++) {
      const i = byX[r]
      if (nD) {
        const di = dOrder[Math.floor((r * nD) / N)]
        this.dx[i] = dX[di]
        this.dy[i] = dY[di]
        this.sD[i] = dSize[di]
        this.colD[i] = dCol[di]
      } else {
        this.dx[i] = this.bx[i]
        this.dy[i] = this.by[i]
        this.sD[i] = this.sB
        this.colD[i] = this.colB[i]
      }
      this.tc[i] = T.liftStart + (r / N) * T.liftSpread + rnd() * T.liftJitter
      // A line's crisp text gives way to its pixels just before the first of them leaves
      if (this.tc[i] < this.lineLift[this.line[i]]) this.lineLift[this.line[i]] = this.tc[i]
    }
  }

  private allocate(N: number) {
    const f = () => new Float32Array(N)
    const u = () => new Uint8Array(N)
    this.ax = f(); this.ay = f(); this.bx = f(); this.by = f()
    this.dx = f(); this.dy = f()
    this.sD = f()
    this.colA = u(); this.colB = u(); this.colD = u()
    this.td = f(); this.ta = f(); this.tc = f()
    this.line = u()
    this.wind = f(); this.lift = f(); this.bend = f()
    this.px = f(); this.py = f(); this.ps = f()
    this.pb = new Uint16Array(N); this.visible = u()
    this.sorted = new Uint32Array(N)
  }

  private layoutCode(W: number, H: number): CodeLayout {
    const ctx = this.ctx
    const maxCols = Math.max(...CODE_LINES.map((l) => l.length))
    // Phones: start from the largest size and shrink only until it fits, with tighter
    // padding and line numbers, so the code fills the screen width and stays readable
    const narrow = W < 600
    const padX = narrow ? 14 : PAD_X
    const margin = narrow ? 24 : 40
    let fontSize = narrow ? 18 : Math.max(8, Math.min(18, Math.round(W / 85)))
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
      if (w <= W - margin) break
    }
    const h = BAR + PAD_Y * 2 + CODE_LINES.length * lineH
    const x = Math.round((W - w) / 2)
    const y = Math.round(H * 0.48 - h / 2)
    return { x, y, w, h, fontSize, font, cellW, lineH, originX: x + padX + gutter, originY: y + BAR + PAD_Y }
  }

  /** Draws the scene for scroll progress p (0 → 1). */
  render(p: number) {
    const { ctx, dpr, w: W, h: H } = this
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const code = this.code
    if (!code || p < T.swap[0] || p > T.particlesOut[1]) return

    const winA = sstep(T.codeWindowIn[0], T.codeWindowIn[1], p) * (1 - sstep(T.codeWindowOut[0], T.codeWindowOut[1], p))

    // Crisp code text: shown once a line has fully assembled, until its pixels start leaving
    const crisp = this.lineDone.map((done, li) => {
      const lift = this.lineLift[li]
      return sstep(done - 0.006, done + 0.006, p) * (1 - sstep(lift - 0.006, lift - 0.001, p))
    })

    if (winA > 0.001) this.drawCodeChrome(p, winA, crisp)
    this.drawParticles(p, crisp)
    ctx.globalAlpha = 1
  }

  private drawCodeChrome(p: number, winA: number, crisp: Float32Array) {
    const { ctx } = this
    const code = this.code!
    ctx.font = code.font
    ctx.textBaseline = 'middle'

    // Line numbers
    ctx.textAlign = 'right'
    ctx.fillStyle = '#4A453F'
    for (let li = 0; li < CODE_LINES.length; li++) {
      const a = sstep(this.lineDone[li] - 0.03, this.lineDone[li], p) * winA
      if (a <= 0.001) continue
      ctx.globalAlpha = a
      ctx.fillText(String(li + 1), code.originX - code.cellW * 1.8, code.originY + li * code.lineH + code.lineH / 2)
    }

    // Highlighted code
    ctx.textAlign = 'left'
    this.runs.forEach((runs, li) => {
      const a = crisp[li]
      if (a <= 0.001) return
      ctx.globalAlpha = a
      const y = code.originY + li * code.lineH + code.lineH / 2
      for (const run of runs) {
        ctx.fillStyle = run.color
        ctx.fillText(run.text, code.originX + run.col * code.cellW, y)
      }
    })

    // Caret after the last assembled line
    if (p < this.lineLift[0]) {
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

  private drawParticles(p: number, crisp: Float32Array) {
    const { ctx, n: N } = this
    const swapA = sstep(T.swap[0], T.swap[1], p)
    const outA = 1 - sstep(T.particlesOut[0], T.particlesOut[1], p)
    const tremble = Math.floor(p * 900)
    const counts = this.counts
    counts.fill(0)

    for (let i = 0; i < N; i++) {
      const td = this.td[i]
      const ta = this.ta[i]
      const tc = this.tc[i]
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
      } else if (p < tc) {
        // Part of the code: hidden while the crisp line is shown
        x = this.bx[i]
        y = this.by[i]
        a = 1 - crisp[this.line[i]]
        size = this.sB
        color = this.colB[i]
      } else if (p < tc + T.converge) {
        // Lifts off the code in a soft arc and lands on its project card
        const t = easeInOutCubic((p - tc) / T.converge)
        const sx = this.bx[i]
        const sy = this.by[i]
        const dx = this.dx[i]
        const dy = this.dy[i]
        x = bezier(sx, (sx + dx) / 2 + this.bend[i] * 220, dx, t)
        y = bezier(sy, Math.min(sy, dy) - 40 - Math.abs(this.bend[i]) * 140, dy, t)
        size = lerp(this.sB, this.sD[i], t)
        color = t < 0.6 ? this.colB[i] : this.colD[i]
      } else {
        x = this.dx[i]
        y = this.dy[i]
        size = this.sD[i]
        color = this.colD[i]
      }

      a *= outA
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
