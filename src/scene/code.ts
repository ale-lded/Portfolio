import { nav, person } from '../content'

/** Wraps text into lines of at most `width` characters, breaking between words. */
function wrap(text: string, width: number) {
  const lines: string[] = []
  for (const word of text.split(' ')) {
    const last = lines.length - 1
    if (last >= 0 && lines[last].length + 1 + word.length <= width) lines[last] += ` ${word}`
    else lines.push(word)
  }
  return lines
}

/** The intro line without its quotation marks */
const lead = person.lead.replace(/^[“"]|[”"]$/g, '')
/** Work and About, in the order the hero mentions them */
const links = [nav.links[1], nav.links[0]]

/** The HTML the name crumbles into. It describes the hero itself, built from the site's copy. */
export const CODE_LINES = [
  '<section id="hero" class="intro">',
  `  <h1 class="name">${person.name}</h1>`,
  '  <p class="role">',
  `    ${person.role}`,
  '  </p>',
  '  <p class="lead" data-tone="calm">',
  ...wrap(lead, 36).map((line) => `    ${line}`),
  '  </p>',
  `  <nav aria-label="${nav.label.toLowerCase()}">`,
  ...links.map((link) => `    <a href="${link.href}">${link.label}</a>`),
  '  </nav>',
  '</section>',
]

export type TokenKind = 'punct' | 'tag' | 'attr' | 'str' | 'text'

/** Minimal HTML highlighter: one token kind per character. */
export function tokenizeLine(line: string): TokenKind[] {
  const out: TokenKind[] = []
  let inTag = false
  let inName = false
  let inString = false
  for (const c of line) {
    let kind: TokenKind
    if (inString) {
      kind = 'str'
      if (c === '"') inString = false
    } else if (inTag) {
      if (c === '>') {
        kind = 'punct'
        inTag = false
        inName = false
      } else if (c === '"') {
        kind = 'str'
        inString = true
      } else if (c === '/' || c === '=') {
        kind = 'punct'
      } else if (inName && /[a-z0-9]/i.test(c)) {
        kind = 'tag'
      } else {
        inName = false
        kind = 'attr'
      }
    } else if (c === '<') {
      kind = 'punct'
      inTag = true
      inName = true
    } else {
      kind = 'text'
    }
    out.push(kind)
  }
  return out
}
