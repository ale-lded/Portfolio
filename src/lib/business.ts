/**
 * The business facts that are not copy: where it is based, how to reach it, where it works.
 * Used by the WhatsApp button and by the structured data search engines read
 * (structuredData.ts). Moving to Cours? Change the town and postcode here.
 *
 * The mentions légales (mentions-legales/index.html) keep the address registered for the
 * business; this is the town the work is based from today.
 */
export const BUSINESS = {
  /** International format, with the + */
  phone: '+33771931555',
  address: {
    locality: 'Messimy',
    postalCode: '69510',
    region: 'Auvergne-Rhône-Alpes',
    country: 'FR',
  },
  /** Where the offers are available: see `area` on each service in src/content/ */
  areas: {
    region: 'Rhône',
    country: 'France',
  },
  github: 'https://github.com/ale-lded',
} as const
