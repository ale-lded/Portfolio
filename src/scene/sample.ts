/** A run of text as laid out on screen, in coordinates relative to the stage. */
export type TextSpec = {
  text: string
  font: string
  letterSpacing: string
  /** Left edge of the text box */
  x: number
  /** Alphabetic baseline */
  baseline: number
  width: number
  ascent: number
  descent: number
  /**
   * Where the browser placed each character, relative to x. When present the text is
   * drawn glyph by glyph at these positions, so letter-spacing and kerning match the
   * DOM exactly even where canvas ignores letterSpacing (Safari).
   */
  glyphs?: Glyph[]
  /** Set on the part of a title written in the accent (the light words of the hero title) */
  accent?: boolean
}

export type Glyph = { char: string; x: number }

export type Rect = { x: number; y: number; w: number; h: number }

let scratch: CanvasRenderingContext2D | null = null
const scratchCtx = () => {
  if (!scratch) scratch = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  return scratch
}

/**
 * Reads where the browser actually drew an element's text, so the pixel copy
 * lands exactly on top of the real DOM text.
 */
export function textSpecFromElement(el: HTMLElement, origin: DOMRect): TextSpec {
  // Plain text: read it line by line, glyph positions included
  if (el.firstChild instanceof Text && el.childNodes.length === 1) {
    const lines = textLinesFromElement(el, origin)
    if (lines.length === 1) return lines[0]
  }
  const cs = getComputedStyle(el)
  const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const text = el.textContent ?? ''
  const range = document.createRange()
  range.selectNodeContents(el)
  const r = range.getBoundingClientRect()

  const ctx = scratchCtx()
  ctx.font = font
  const m = ctx.measureText(text)
  const ascent = m.fontBoundingBoxAscent
  const descent = m.fontBoundingBoxDescent
  // The text's content area is vertically centred inside the range rect
  const top = r.top + (r.height - (ascent + descent)) / 2

  return {
    text,
    font,
    letterSpacing: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
    x: r.left - origin.left,
    baseline: top - origin.top + ascent,
    width: r.width,
    ascent,
    descent,
  }
}

/**
 * Like textSpecFromElement, but for text that wraps: returns one spec per visual line,
 * read character by character from the browser's own layout. Text inside a child element
 * (an <em> in another font, say) becomes a run of its own, with that element's font and
 * the accent flag, so a line can mix fonts and still land on the real text.
 */
export function textLinesFromElement(el: HTMLElement, origin: DOMRect): TextSpec[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text)
  if (!nodes.length) return [textSpecFromElement(el, origin)]

  type Style = { font: string; letterSpacing: string; ascent: number; descent: number; accent: boolean }
  const ctx = scratchCtx()
  const styleOf = (node: Text): Style => {
    const owner = node.parentElement ?? el
    const cs = getComputedStyle(owner)
    const font = `${cs.fontStyle === 'normal' ? '' : `${cs.fontStyle} `}${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    ctx.font = font
    const m = ctx.measureText(node.data)
    return {
      font,
      letterSpacing: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
      ascent: m.fontBoundingBoxAscent,
      descent: m.fontBoundingBoxDescent,
      accent: owner !== el,
    }
  }

  type Run = { style: Style; text: string; left: number; right: number; top: number; height: number; glyphs: { char: string; left: number }[] }
  type Line = { top: number; height: number; runs: Run[] }
  const lines: Line[] = []
  const range = document.createRange()
  for (const node of nodes) {
    const style = styleOf(node)
    let run: Run | null = null
    for (let i = 0; i < node.data.length; i++) {
      const char = node.data[i]
      if (/\s/.test(char)) {
        // A space only matters inside a run, where it keeps the words of that run together
        if (run) run.text += char
        continue
      }
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const r = range.getClientRects()[0]
      if (!r) continue
      let line = lines[lines.length - 1]
      if (!line || Math.abs(r.top + r.height / 2 - (line.top + line.height / 2)) > line.height / 2) {
        line = { top: r.top, height: r.height, runs: [] }
        lines.push(line)
        run = null
      }
      if (!run || !line.runs.includes(run)) {
        run = { style, text: '', left: r.left, right: r.right, top: r.top, height: r.height, glyphs: [] }
        line.runs.push(run)
      }
      run.text += char
      run.right = r.right
      run.glyphs.push({ char, left: r.left })
    }
  }

  return lines.flatMap((line) =>
    line.runs.map((run) => {
      const { font, letterSpacing, ascent, descent, accent } = run.style
      const top = run.top + (run.height - (ascent + descent)) / 2
      return {
        text: run.text.trim(),
        font,
        letterSpacing,
        x: run.left - origin.left,
        baseline: top - origin.top + ascent,
        width: run.right - run.left,
        ascent,
        descent,
        glyphs: run.glyphs.map((g) => ({ char: g.char, x: g.left - run.left })),
        accent,
      }
    }),
  )
}

/**
 * Renders text off-screen and returns the centre of every inked cell on a
 * grid of `step` px: the "pixels" the text is made of. Flat [x, y, x, y, …].
 */
export function sampleText(spec: TextSpec, step: number, threshold = 110): number[] {
  const pad = Math.ceil(spec.ascent * 0.2) + 4
  const w = Math.ceil(spec.width + pad * 2)
  const h = Math.ceil(spec.ascent + spec.descent + pad * 2)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const g = canvas.getContext('2d', { willReadFrequently: true })!
  g.font = spec.font
  g.textBaseline = 'alphabetic'
  g.fillStyle = '#fff'
  if (spec.glyphs) {
    // Each glyph exactly where the browser put it; spacing is already in the positions
    for (const glyph of spec.glyphs) g.fillText(glyph.char, pad + glyph.x, pad + spec.ascent)
  } else {
    g.letterSpacing = spec.letterSpacing
    g.fillText(spec.text, pad, pad + spec.ascent)
  }
  const data = g.getImageData(0, 0, w, h).data

  const out: number[] = []
  const left = spec.x - pad
  const top = spec.baseline - spec.ascent - pad
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      if (data[((y | 0) * w + (x | 0)) * 4 + 3] > threshold) out.push(left + x, top + y)
    }
  }
  return out
}

/**
 * Samples a single monospace glyph inside its cell (cell width × line height),
 * text drawn with a middle baseline. Offsets are relative to the cell's top-left.
 */
export function sampleGlyph(char: string, font: string, cellW: number, lineH: number, step: number, threshold = 90) {
  const pad = 2
  const w = Math.ceil(cellW) + pad * 2
  const h = Math.ceil(lineH)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const g = canvas.getContext('2d', { willReadFrequently: true })!
  g.font = font
  g.textBaseline = 'middle'
  g.fillStyle = '#fff'
  g.fillText(char, pad, lineH / 2)
  const data = g.getImageData(0, 0, w, h).data
  const out: number[] = []
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      if (data[((y | 0) * w + (x | 0)) * 4 + 3] > threshold) out.push(x - pad, y)
    }
  }
  return out
}

/** Evenly spaced points along a rounded rectangle's outline. */
export function sampleRoundedRect(r: Rect, radius: number, spacing: number): number[] {
  const out: number[] = []
  const { x, y, w, h } = r
  const rad = Math.min(radius, w / 2, h / 2)
  const straight = (x0: number, y0: number, x1: number, y1: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0)
    const n = Math.max(1, Math.round(len / spacing))
    for (let i = 0; i < n; i++) out.push(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n)
  }
  const arc = (cx: number, cy: number, from: number) => {
    const n = Math.max(2, Math.round((Math.PI / 2) * rad / spacing))
    for (let i = 0; i < n; i++) {
      const a = from + (Math.PI / 2) * (i / n)
      out.push(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
    }
  }
  straight(x + rad, y, x + w - rad, y)
  arc(x + w - rad, y + rad, -Math.PI / 2)
  straight(x + w, y + rad, x + w, y + h - rad)
  arc(x + w - rad, y + h - rad, 0)
  straight(x + w - rad, y + h, x + rad, y + h)
  arc(x + rad, y + h - rad, Math.PI / 2)
  straight(x, y + h - rad, x, y + rad)
  arc(x + rad, y + rad, Math.PI)
  return out
}
