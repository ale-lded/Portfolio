/**
 * Crockford's base32: 32 symbols, no I, L, O or U, so a code survives being read aloud,
 * retyped or mangled by a chat app. Decoding is forgiving the same way: case, spaces,
 * dashes and the look-alikes (I/L → 1, O → 0) are all accepted.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const LOOKUP = new Map<string, number>([...ALPHABET].map((c, i) => [c, i]))
LOOKUP.set('I', 1).set('L', 1).set('O', 0)

export function encodeBase32(bytes: Uint8Array): string {
  let out = ''
  let buffer = 0
  let bits = 0
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      out += ALPHABET[(buffer >>> bits) & 31]
    }
  }
  // Leftover bits, padded with zeros on the right
  if (bits > 0) out += ALPHABET[(buffer << (5 - bits)) & 31]
  return out
}

/** Returns null when the text holds a symbol that is not base32. */
export function decodeBase32(text: string): Uint8Array | null {
  const clean = text.toUpperCase().replace(/[\s-]/g, '')
  const out: number[] = []
  let buffer = 0
  let bits = 0
  for (const c of clean) {
    const value = LOOKUP.get(c)
    if (value === undefined) return null
    buffer = ((buffer << 5) | value) & 0xffff
    bits += 5
    if (bits >= 8) {
      bits -= 8
      out.push((buffer >>> bits) & 255)
    }
  }
  return Uint8Array.from(out)
}
