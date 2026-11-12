import { code } from '../content'

/**
 * The code the title crumbles into: the client's website as a TypeScript class,
 * taken from the site's copy (content.code), so it reads in the language of the page.
 */
export const CODE_LINES: readonly string[] = code.lines

/** The colour family of each character (ParticleScene maps them onto the palette) */
export type TokenKind = 'punct' | 'tag' | 'attr' | 'str' | 'text' | 'type' | 'fn' | 'lit'

/** Keywords, in amber */
const KEYWORDS = new Set(['class', 'extends', 'new', 'return', 'const', 'let', 'export', 'default', 'import', 'from'])
/** Values that are not strings: booleans, numbers, this */
const LITERALS = new Set(['true', 'false', 'null', 'this'])

/**
 * Minimal TypeScript highlighter, one token kind per character:
 * keywords (tag), class names (type), methods (fn), fields (attr), strings (str),
 * true/false/this and numbers (lit), comments and punctuation dim (punct).
 */
export function tokenizeLine(line: string): TokenKind[] {
  const chars = [...line]
  const out: TokenKind[] = []
  let i = 0
  const fill = (n: number, kind: TokenKind) => {
    for (let k = 0; k < n; k++) out.push(kind)
    i += n
  }
  while (i < chars.length) {
    const rest = chars.slice(i).join('')
    if (rest.startsWith('//')) {
      fill(chars.length - i, 'punct')
    } else if (chars[i] === "'") {
      const end = chars.indexOf("'", i + 1)
      fill((end === -1 ? chars.length : end + 1) - i, 'str')
    } else if (/\d/.test(chars[i])) {
      fill(rest.match(/^\d+/)![0].length, 'lit')
    } else if (/\p{L}|[$_]/u.test(chars[i])) {
      const word = rest.match(/^[\p{L}\p{N}$_]+/u)![0]
      const length = [...word].length
      const after = chars.slice(i + length).join('')
      let kind: TokenKind = 'text'
      if (KEYWORDS.has(word)) kind = 'tag'
      else if (LITERALS.has(word)) kind = 'lit'
      else if (/^\p{Lu}/u.test(word)) kind = 'type'
      else if (after.startsWith('(')) kind = 'fn'
      else if (/^\s*(:|=(?!=))/.test(after)) kind = 'attr'
      fill(length, kind)
    } else if (/\s/.test(chars[i])) {
      fill(1, 'text')
    } else {
      fill(1, 'punct')
    }
  }
  return out
}
