import { mulberry32 } from '../lib/random'
import { decodeBase32, encodeBase32 } from './base32'

/**
 * The backstage cipher: a toy stream cipher, fun to pass around, NOT real security.
 *
 * How a message is sealed:
 *   1. The text becomes UTF-8 bytes (so emoji and accents survive).
 *   2. A 16-bit checksum of those bytes goes in front: on the way back it tells a wrong
 *      key apart from the right one, so we can say ACCESS DENIED instead of printing junk.
 *   3. Two random "salt" bytes are picked, so the same message never looks the same twice.
 *   4. The key and the salt seed a pseudo-random generator; every byte is XORed with the
 *      next number it gives (a one-time pad, if the pad were truly random: it isn't).
 *   5. Salt + scrambled bytes are written in base32, in spy-style groups of five.
 *
 *   AM: 7KQ2X 9FJ3M ...
 *   ^^^ prefix, so a code is recognisable at a glance (and auto-detected when pasted)
 */
export const PREFIX = 'AM:'
/** Used when no key is given: anyone with the portfolio can open those messages. */
export const HOUSE_KEY = 'backstage'

const SALT_BYTES = 2
const CHECK_BYTES = 2
const GROUP = 5

export type DecryptResult =
  | { ok: true; text: string }
  /** format: not one of our codes (or damaged). key: a code, but this key does not open it. */
  | { ok: false; reason: 'format' | 'key' }

export function encrypt(text: string, key: string): string {
  const message = new TextEncoder().encode(text)
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const check = fnv1a(message) & 0xffff

  const body = new Uint8Array(CHECK_BYTES + message.length)
  body.set([check >>> 8, check & 255])
  body.set(message, CHECK_BYTES)

  const sealed = new Uint8Array(SALT_BYTES + body.length)
  sealed.set(salt)
  sealed.set(xorStream(body, key, salt), SALT_BYTES)
  return `${PREFIX} ${group(encodeBase32(sealed))}`
}

export function decrypt(code: string, key: string): DecryptResult {
  const trimmed = code.trim()
  if (!looksEncrypted(trimmed)) return { ok: false, reason: 'format' }
  const sealed = decodeBase32(trimmed.slice(PREFIX.length))
  if (!sealed || sealed.length < SALT_BYTES + CHECK_BYTES) return { ok: false, reason: 'format' }

  const salt = sealed.subarray(0, SALT_BYTES)
  const body = xorStream(sealed.subarray(SALT_BYTES), key, salt)
  const check = (body[0] << 8) | body[1]
  const message = body.subarray(CHECK_BYTES)
  if ((fnv1a(message) & 0xffff) !== check) return { ok: false, reason: 'key' }

  // fatal: a checksum collision with a wrong key could still leave invalid UTF-8
  try {
    return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(message) }
  } catch {
    return { ok: false, reason: 'key' }
  }
}

/** True for text that starts with our prefix: used to switch to Decrypt on paste. */
export function looksEncrypted(text: string) {
  return text.trimStart().toUpperCase().startsWith(PREFIX)
}

/** XOR every byte with the key's pseudo-random stream. Applying it twice gives the input back. */
function xorStream(bytes: Uint8Array, key: string, salt: Uint8Array) {
  const seed = fnv1a(new TextEncoder().encode(key || HOUSE_KEY), fnv1a(salt))
  const next = mulberry32(seed)
  return bytes.map((b) => b ^ Math.floor(next() * 256))
}

/** FNV-1a: a tiny, well-known 32-bit hash. Good for seeds and checksums, not for secrets. */
function fnv1a(bytes: Uint8Array, seed = 0x811c9dc5) {
  let h = seed
  for (const b of bytes) h = Math.imul(h ^ b, 0x01000193)
  return h >>> 0
}

function group(text: string) {
  return text.match(new RegExp(`.{1,${GROUP}}`, 'g'))?.join(' ') ?? ''
}
