import { code } from '../content'

/**
 * The code the title crumbles into: the client's website as a TypeScript object,
 * built from the site's copy (content.code), so it reads in the language of the page.
 */
export const CODE_LINES = [
  `const ${code.name} = {`,
  ...code.fields.map(([key, value]) => `  ${key}: ${value},`),
  `  // ${code.comment}`,
  '}',
  `export default ${code.name}`,
]

/** The colour family of each character (ParticleScene maps them onto the palette) */
export type TokenKind = 'punct' | 'tag' | 'attr' | 'str' | 'text'

const KEYWORDS = new Set(['const', 'let', 'export', 'default', 'true', 'false', 'null'])

/**
 * Minimal TypeScript highlighter, one token kind per character:
 * keywords in amber (tag), object keys (attr), strings (str), comments and punctuation dim (punct).
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
    } else if (/\p{L}|[$_]/u.test(chars[i])) {
      const word = rest.match(/^[\p{L}\p{N}$_]+/u)![0]
      const length = [...word].length
      const isKey = /^\s*:/.test(chars.slice(i + length).join(''))
      fill(length, KEYWORDS.has(word) ? 'tag' : isKey ? 'attr' : 'text')
    } else if (/\s/.test(chars[i])) {
      fill(1, 'text')
    } else {
      fill(1, 'punct')
    }
  }
  return out
}
