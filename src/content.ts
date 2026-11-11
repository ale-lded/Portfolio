/**
 * Every piece of copy on the site, in the language of the page.
 * Each language is its own page (/, /it/, /fr/: see lib/lang.ts), so the copy is chosen
 * once, when the page loads, and every component keeps importing plain constants.
 * The texts themselves live in content/en.ts, content/it.ts and content/fr.ts.
 */
import * as en from './content/en'
import { fr } from './content/fr'
import { it } from './content/it'
import { pageLang, type Lang } from './lib/lang'

/** The shape every language must fill: the English file, field for field */
export type Content = Omit<typeof en, 'default'>

const copy: Record<Lang, Content> = { en, it, fr }

export const { person, nav, hero, code, work, projects, about, services, stack, contact, backstage, race, terminal, dial } =
  copy[pageLang]

export type { Project, Service, Step } from './content/en'
