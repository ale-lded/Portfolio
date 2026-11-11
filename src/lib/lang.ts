/**
 * The site's languages, in the order they sit on the dial. Each one is its own page,
 * with its own address, title and description (index.html, it/index.html, fr/index.html):
 * that is what lets search engines list the French site for a search in French.
 */
export const LANGS = [
  { code: 'en', short: 'EN', name: 'English', path: '/' },
  { code: 'it', short: 'IT', name: 'Italiano', path: '/it/' },
  { code: 'fr', short: 'FR', name: 'Français', path: '/fr/' },
] as const

export type Lang = (typeof LANGS)[number]['code']

const KEY = 'lang'
/** Where the visitor was on the page they left, so the new language opens at the same spot */
const SCROLL_KEY = 'lang-scroll'

const isLang = (value: string | null | undefined): value is Lang => LANGS.some((l) => l.code === value)
const byCode = (code: Lang) => LANGS.find((l) => l.code === code)!

/** The language of this page, as its HTML declares it */
export const pageLang: Lang = isLang(document.documentElement.lang) ? document.documentElement.lang : 'en'

function saved(): Lang | null {
  try {
    const value = localStorage.getItem(KEY)
    return isLang(value) ? value : null
  } catch {
    return null
  }
}

/** Opens the page in another language, at the same point of the scroll, and remembers the choice. */
export function goToLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang)
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
  } catch {
    // Not remembered, but the switch still works
  }
  window.location.assign(byCode(lang).path + window.location.hash)
}

/**
 * Runs before the app renders. On the English home page, a first-time visitor whose
 * browser speaks Italian or French is sent to their page; a saved choice wins over the
 * browser, and a ?lang= link wins over both. The /it/ and /fr/ pages are never redirected:
 * someone who opens one asked for it. Returns false when the page is about to change.
 */
export function settleLang(): boolean {
  const params = new URLSearchParams(window.location.search)
  const asked = params.get('lang')
  let target: Lang | null = isLang(asked) ? asked : null

  if (!target && pageLang === 'en') {
    target = saved()
    if (!target) {
      for (const tag of navigator.languages ?? [navigator.language]) {
        const code = tag.slice(0, 2).toLowerCase()
        if (isLang(code)) {
          target = code
          break
        }
      }
    }
  }

  if (target && target !== pageLang) {
    window.location.replace(byCode(target).path + window.location.hash)
    return false
  }
  return true
}

/** Back at the spot the visitor left, after a switch of language */
export function restoreScroll() {
  let y: string | null = null
  try {
    y = sessionStorage.getItem(SCROLL_KEY)
    sessionStorage.removeItem(SCROLL_KEY)
  } catch {
    return
  }
  if (y === null || window.location.hash) return
  const top = Number(y)
  if (!Number.isFinite(top)) return
  window.history.scrollRestoration = 'manual'

  // The page reaches its full height only once React, the web fonts and the scroll stages
  // have laid it out, and the browser may still put it back at the top while it loads:
  // keep placing it until it has stayed there a moment (or give up after 2 s). A timer, not
  // animation frames, so it also works in a tab that is not being painted yet.
  const until = performance.now() + 2000
  let steady = 0
  const place = () => {
    if (Math.abs(window.scrollY - top) < 2) steady++
    else {
      steady = 0
      window.scrollTo({ top, behavior: 'instant' })
    }
    if (steady < 5 && performance.now() < until) window.setTimeout(place, 40)
  }
  document.fonts.ready.then(place)
}
