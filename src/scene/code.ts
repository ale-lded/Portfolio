/** The HTML the name crumbles into. It describes the hero itself. */
export const CODE_LINES = [
  '<section id="hero" class="intro">',
  '  <h1 class="name">Alessio Mura</h1>',
  '  <p class="role">',
  '    Designer e sviluppatore full stack',
  '  </p>',
  '  <p class="lead" data-tone="calmo">',
  '    Progetto interfacce chiare e le',
  '    costruisco, dal pixel al database.',
  '  </p>',
  '  <nav aria-label="principale">',
  '    <a href="#progetti">Progetti</a>',
  '    <a href="#chi-sono">Chi sono</a>',
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
