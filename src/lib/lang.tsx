import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * The site's languages, in the order they sit on the dial.
 * Only the switch exists for now: every language still shows the English copy,
 * until content.ts is split per language.
 */
export const LANGS = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'it', short: 'IT', name: 'Italiano' },
  { code: 'fr', short: 'FR', name: 'Français' },
] as const

export type Lang = (typeof LANGS)[number]['code']

const KEY = 'lang'
const isLang = (value: string | null | undefined): value is Lang => LANGS.some((l) => l.code === value)

/** A ?lang= link first, then the visitor's own choice, then their browser, then English. */
function detect(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (isLang(fromUrl)) return fromUrl
  try {
    const saved = localStorage.getItem(KEY)
    if (isLang(saved)) return saved
  } catch {
    // Storage blocked: fall through to the browser languages
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag.slice(0, 2).toLowerCase()
    if (isLang(code)) return code
  }
  return 'en'
}

type LangState = { lang: Lang; setLang: (lang: Lang) => void }

const LangContext = createContext<LangState>({ lang: 'en', setLang: () => undefined })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Not remembered across visits, but the switch still works
    }
  }, [])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
