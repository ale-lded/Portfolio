import { work } from '../content'

const page = work.demo.page

/**
 * The code the title crumbles into: the example site's home page as HTML, written from the
 * page's own copy, so every line says exactly what the page will show. Line i lands on the
 * element marked data-line="i" in components/stage/Work.tsx.
 */
export const CODE_LINES: readonly string[] = [
  `<nav>${page.brand}</nav>`,
  `<h1>${page.title[0]}`,
  `    ${page.title[1]}</h1>`,
  `<p>${page.lead[0]}`,
  `   ${page.lead[1]}</p>`,
  `<a>${page.book}</a>`,
  `<img src="${page.photoFile}">`,
]

/** The colour family of each character (ParticleScene maps them onto the palette) */
export type TokenKind = 'punct' | 'tag' | 'attr' | 'str' | 'text' | 'type' | 'fn' | 'lit'

/**
 * Minimal HTML highlighter, one token kind per character: tag names (tag), attribute
 * names (attr), quoted values (str), the brackets and = dim (punct), the words in between (text).
 * Every line starts outside a tag, as the lines above do.
 */
export function tokenizeLine(line: string): TokenKind[] {
  const chars = [...line]
  const out: TokenKind[] = []
  let inTag = false
  let afterName = false
  let i = 0
  while (i < chars.length) {
    const c = chars[i]
    if (!inTag) {
      if (c === '<') {
        inTag = true
        afterName = false
        const close = chars[i + 1] === '/'
        out.push('punct')
        if (close) out.push('punct')
        i += close ? 2 : 1
      } else {
        out.push('text')
        i++
      }
      continue
    }
    if (c === '>' || (c === '/' && chars[i + 1] === '>')) {
      inTag = false
      out.push('punct')
      i++
    } else if (c === '"' || c === "'") {
      const end = chars.indexOf(c, i + 1)
      const n = (end === -1 ? chars.length : end + 1) - i
      for (let k = 0; k < n; k++) out.push('str')
      i += n
    } else if (/[\w-]/.test(c)) {
      const word = chars.slice(i).join('').match(/^[\w-]+/)![0]
      for (let k = 0; k < word.length; k++) out.push(afterName ? 'attr' : 'tag')
      afterName = true
      i += word.length
    } else {
      out.push(c === ' ' ? 'text' : 'punct')
      i++
    }
  }
  return out
}

/**
 * The words of a line, outside its tags: [first column, end column) of that run, trimmed.
 * Empty (start === end) for a line that is all tag, like <img>.
 */
export function contentSpan(line: string): [start: number, end: number] {
  const chars = [...line]
  let inTag = false
  let start = -1
  let end = -1
  chars.forEach((c, i) => {
    if (c === '<') inTag = true
    if (!inTag && c !== ' ') {
      if (start < 0) start = i
      end = i + 1
    }
    if (c === '>') inTag = false
  })
  return start < 0 ? [0, 0] : [start, end]
}
