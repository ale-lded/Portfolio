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
}

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
 * Like textSpecFromElement, but for text that wraps: returns one spec per
 * visual line, read character by character from the browser's own layout.
 */
export function textLinesFromElement(el: HTMLElement, origin: DOMRect): TextSpec[] {
  const node = el.firstChild
  if (!(node instanceof Text)) return [textSpecFromElement(el, origin)]
  const cs = getComputedStyle(el)
  const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing
  const ctx = scratchCtx()
  ctx.font = font
  const m = ctx.measureText(node.data)
  const ascent = m.fontBoundingBoxAscent
  const descent = m.fontBoundingBoxDescent

  type Line = { start: number; end: number; left: number; right: number; top: number; height: number }
  const lines: Line[] = []
  const range = document.createRange()
  for (let i = 0; i < node.data.length; i++) {
    if (/\s/.test(node.data[i])) continue
    range.setStart(node, i)
    range.setEnd(node, i + 1)
    const r = range.getClientRects()[0]
    if (!r) continue
    const line = lines[lines.length - 1]
    if (line && Math.abs(r.top - line.top) < r.height / 2) {
      line.end = i
      line.right = r.right
    } else {
      lines.push({ start: i, end: i, left: r.left, right: r.right, top: r.top, height: r.height })
    }
  }

  return lines.map((line) => {
    const top = line.top + (line.height - (ascent + descent)) / 2
    return {
      text: node.data.slice(line.start, line.end + 1),
      font,
      letterSpacing,
      x: line.left - origin.left,
      baseline: top - origin.top + ascent,
      width: line.right - line.left,
      ascent,
      descent,
    }
  })
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
  g.letterSpacing = spec.letterSpacing
  g.textBaseline = 'alphabetic'
  g.fillStyle = '#fff'
  g.fillText(spec.text, pad, pad + spec.ascent)
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
