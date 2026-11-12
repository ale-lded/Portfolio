import { bezier, clamp, easeInOutCubic, lerp, sstep } from '../lib/math'
import { hash2, mulberry32 } from '../lib/random'
import { CODE_LINES, tokenizeLine, type TokenKind } from './code'
import { sampleGlyph, sampleRoundedRect, sampleText, type Rect, type TextSpec } from './sample'
import { lineBinary, lineStart, T } from './timeline'

export const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const PALETTE = [
  // 0–2 hero name, lit from above
  '#FFF4E6', '#E6DDD0', '#A0978B',
  // 3–7 syntax: punct, keyword, field, string, text
  '#6E6860', '#FFB547', '#E3C9A0', '#F28B54', '#EDE6DC',
  // 8–11 amber phosphor
  '#FFB547', '#FF9A2E', '#FFD08A', '#E07818',
  // 12 card title · 13 card outline · 14 flash
  '#F2EEE8', '#C98F4E', '#FFF1D6',
  // 15 hero accent words (Stage.css .hero__accent)
  '#CBB594',
  // 16–18 more syntax: class names, methods, true/false/this
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
const SYNTAX: Record<TokenKind, number> = { punct: 3, tag: 4, attr: 5, str: 6, text: 7, type: 16, fn: 17, lit: 18 }
const AMBER = [8, 9, 10, 11]
const CARD_TITLE = 12
const CARD_OUTLINE = 13
const FLASH = 14
/** The hero's accent words (Stage.css .hero__accent): light, warm sand */
const HERO_ACCENT = 15
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
 * The pixel sequence. Every particle is one "pixel" with four homes:
 * A on the hero service line, B inside a code glyph, C inside a binary glyph, D on a
 * project card. `render(p)` is a pure function of scroll progress, so the
 * sequence plays identically backwards.
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
  private cx = new Float32Array(0)
  private cy = new Float32Array(0)
  private dx = new Float32Array(0)
  private dy = new Float32Array(0)
  // Sizes per home
  private sA = 2
  private sB = 1.5
  private sD = new Float32Array(0)
  // Colors
  private colA = new Uint8Array(0)
  private colB = new Uint8Array(0)
  private colC = new Uint8Array(0)
  private colD = new Uint8Array(0)
  // Timing
  private td = new Float32Array(0) // detach from the name
  private ta = new Float32Array(0) // start flying to the code
  private tb = new Float32Array(0) // turn binary
  private tr = new Float32Array(0) // start raining
  private tc = new Float32Array(0) // converge on the cards
  private line = new Uint8Array(0)
  // Motion character
  private wind = new Float32Array(0)
  private lift = new Float32Array(0)
  private bend = new Float32Array(0)
  /** Height where falling digits settle, on the podium */
  private floor = 0

  // Per-line state of the code
  private lineDone = new Float32Array(CODE_LINES.length)
  private lineTb = new Float32Array(CODE_LINES.length)
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
    this.floor = H * 0.84
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

    type Char = { line: number; col: number; bit: string; tb: number; tr: number }
    const chars: Char[] = []
    const bX: number[] = []
    const bY: number[] = []
    const bChar: number[] = []
    const bK: number[] = []
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
        chars.push({
          line: li,
          col: ci,
          bit: rnd() < 0.5 ? '0' : '1',
          tb: lineBinary(li) + rnd() * 0.02,
          tr: T.rainStart + ((hash2(ci, 3) % 100) / 100) * 0.03 + li * 0.002,
        })
        for (let k = 0; k < g.length / 2; k++) {
          bX.push(code.originX + ci * code.cellW + g[k * 2])
          bY.push(code.originY + li * code.lineH + g[k * 2 + 1])
          bChar.push(charIndex)
          bK.push(k)
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
    this.lineTb.fill(1)

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

      const g = glyph(ch.bit)
      const k = bK[bi] % (g.length / 2)
      this.cx[i] = code.originX + ch.col * code.cellW + g[k * 2]
      this.cy[i] = code.originY + ch.line * code.lineH + g[k * 2 + 1]
      this.colC[i] = AMBER[(rnd() * AMBER.length) | 0]

      // The first words crumble first and become the first lines of code
      const u = Math.floor((i * nA) / N) / Math.max(1, nA)
      this.td[i] = T.crumbleStart + u * T.crumbleSpread + rnd() * 0.015
      this.ta[i] = Math.max(lineStart(ch.line) + (ch.col / maxCols) * 0.02 + rnd() * 0.01, this.td[i] + 0.03)
      this.tb[i] = ch.tb
      this.tr[i] = ch.tr

      this.wind[i] = rnd() * 1.2 - 0.3
      this.lift[i] = rnd()
      this.bend[i] = rnd() - 0.5

      const done = this.ta[i] + T.fly
      if (done > this.lineDone[ch.line]) this.lineDone[ch.line] = done
      if (ch.tb < this.lineTb[ch.line]) this.lineTb[ch.line] = ch.tb
    }

    // Cards: sort particles by their binary x so each card pulls from the part of the code above it
    const byX = Array.from({ length: N }, (_, i) => i).sort((i, j) => this.cx[i] - this.cx[j])
    for (let r = 0; r < N; r++) {
      const i = byX[r]
      if (nD) {
        const di = dOrder[Math.floor((r * nD) / N)]
        this.dx[i] = dX[di]
        this.dy[i] = dY[di]
        this.sD[i] = dSize[di]
        this.colD[i] = dCol[di]
      } else {
        this.dx[i] = this.cx[i]
        this.dy[i] = this.cy[i]
        this.sD[i] = this.sB
        this.colD[i] = this.colC[i]
      }
      this.tc[i] = T.convergeStart + (r / N) * 0.03 + rnd() * 0.03
    }
  }

  private allocate(N: number) {
    const f = () => new Float32Array(N)
    const u = () => new Uint8Array(N)
    this.ax = f(); this.ay = f(); this.bx = f(); this.by = f()
    this.cx = f(); this.cy = f(); this.dx = f(); this.dy = f()
    this.sD = f()
    this.colA = u(); this.colB = u(); this.colC = u(); this.colD = u()
    this.td = f(); this.ta = f(); this.tb = f(); this.tr = f(); this.tc = f()
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

    // Crisp code text: shown once a line has fully assembled, until it starts turning binary
    const crisp = this.lineDone.map((done, li) => {
      const tb = this.lineTb[li]
      return sstep(done - 0.006, done + 0.006, p) * (1 - sstep(tb - 0.006, tb - 0.001, p))
    })

    if (winA > 0.001) this.drawCodeChrome(p, winA, crisp)
    this.drawAmbientRain(p, winA)
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
    if (p < this.lineTb[0]) {
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

  /** Thin columns of amber digits behind everything while the code turns binary. */
  private drawAmbientRain(p: number, winA: number) {
    const [in0, in1, out0, out1] = T.ambientRain
    const rainA = sstep(in0, in1, p) * (1 - sstep(out0, out1, p))
    if (rainA <= 0.002) return
    const { ctx, w: W, h: H } = this
    const code = this.code!
    ctx.font = code.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const lh = code.lineH
    const step = Math.round(code.cellW * 1.6)
    const cols = Math.ceil(W / step)
    const flicker = Math.floor(p * 60)
    for (let col = 0; col < cols; col++) {
      if (hash2(col, 99) % 100 < 62) continue
      const speed = 0.7 + ((hash2(col, 7) % 100) / 100) * 0.9
      const offset = (hash2(col, 13) % 100) / 100
      const trail = 8 + (hash2(col, 21) % 12)
      const headY = (offset - 0.35 + (p - in0) * 4 * speed) * (H + trail * lh)
      const headRow = Math.floor(headY / lh)
      const x = col * step + step / 2
      const inWinX = x > code.x && x < code.x + code.w
      for (let t = 0; t <= trail; t++) {
        const row = headRow - t
        const y = row * lh + lh / 2
        if (y < -lh || y > H + lh) continue
        let a = rainA * (t === 0 ? 0.42 : (1 - t / trail) * 0.2)
        if (inWinX && y > code.y && y < code.y + code.h) a *= 1 - winA * 0.95
        if (a < 0.008) continue
        ctx.globalAlpha = a
        ctx.fillStyle = t === 0 ? '#FFE2B0' : PALETTE[AMBER[hash2(col, row) % AMBER.length]]
        ctx.fillText(hash2(col * 131 + row, flicker) & 1 ? '1' : '0', x, y)
      }
    }
  }

  /** Binary digits fall like rain and pile up on the podium. */
  private fall(i: number, dt: number) {
    const settle = this.floor + this.bend[i] * 28
    return Math.min(this.cy[i] + dt * dt * 34000, settle)
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
      const tb = this.tb[i]
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
      } else if (p < tb) {
        // Part of the code: hidden while the crisp line is shown
        x = this.bx[i]
        y = this.by[i]
        a = 1 - crisp[this.line[i]]
        size = this.sB
        color = this.colB[i]
      } else if (p < tb + T.morph) {
        // The glyph's pixels rearrange into a 0 or a 1
        const t = easeInOutCubic((p - tb) / T.morph)
        x = lerp(this.bx[i], this.cx[i], t)
        y = lerp(this.by[i], this.cy[i], t) - Math.sin(t * Math.PI) * 3
        size = this.sB
        color = t < 0.4 ? this.colB[i] : FLASH
      } else if (p < tc) {
        // Binary, then a rain that dims as it falls
        x = this.cx[i]
        y = this.cy[i]
        size = this.sB
        color = p < tb + T.morph + 0.012 ? FLASH : this.colC[i]
        const dt = p - this.tr[i]
        if (dt > 0) {
          y = this.fall(i, dt)
          a = 1 - 0.72 * sstep(0, 0.07, dt)
        }
      } else if (p < tc + T.converge) {
        // Gathered back up into the project cards
        const t = easeInOutCubic((p - tc) / T.converge)
        const dt = Math.max(0, tc - this.tr[i])
        const sx = this.cx[i]
        const sy = dt > 0 ? this.fall(i, dt) : this.cy[i]
        const a0 = 1 - 0.72 * sstep(0, 0.07, dt)
        const dx = this.dx[i]
        const dy = this.dy[i]
        x = bezier(sx, (sx + dx) / 2 + this.bend[i] * 260, dx, t)
        y = bezier(sy, (sy + dy) / 2 + this.bend[i] * 140, dy, t)
        a = lerp(a0, 1, t)
        size = lerp(this.sB, this.sD[i], t)
        color = t < 0.6 ? this.colC[i] : this.colD[i]
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
