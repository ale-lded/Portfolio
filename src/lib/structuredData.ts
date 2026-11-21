import { contact, person, services } from '../content'
import { BUSINESS } from './business'
import { LANGS, pageLang } from './lang'

/**
 * Structured data (schema.org JSON-LD) for this language's page: who the business is,
 * where it is based, what it offers and where. Search engines read it to understand the
 * page, which counts for local searches. scripts/prerender.mjs writes it into each page's
 * <head> at build time, from the same copy as the page, so the two never drift apart.
 */
export function structuredData(site: string, description: string) {
  const path = LANGS.find((l) => l.code === pageLang)!.path
  const ids = { business: `${site}/#business`, person: `${site}/#person`, website: `${site}/#website` }
  const area = {
    region: { '@type': 'AdministrativeArea', name: BUSINESS.areas.region },
    country: { '@type': 'Country', name: BUSINESS.areas.country },
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': ids.business,
        name: person.name,
        description,
        url: `${site}${path}`,
        image: `${site}/photos/fuji.webp`,
        email: contact.email,
        telephone: BUSINESS.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: BUSINESS.address.locality,
          postalCode: BUSINESS.address.postalCode,
          addressRegion: BUSINESS.address.region,
          addressCountry: BUSINESS.address.country,
        },
        areaServed: [area.region, area.country],
        knowsLanguage: LANGS.map((l) => l.code),
        founder: { '@id': ids.person },
        sameAs: [BUSINESS.github],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: services.heading,
          itemListElement: services.items.map((item) => ({
            '@type': 'Offer',
            // The "from" price on the card, as a figure: "À partir de 900 €" → 900
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: Number(item.price.replace(/\D/g, '')),
              priceCurrency: 'EUR',
            },
            itemOffered: {
              '@type': 'Service',
              name: item.name,
              description: item.text,
              areaServed: area[item.area],
              provider: { '@id': ids.business },
            },
          })),
        },
      },
      {
        '@type': 'Person',
        '@id': ids.person,
        name: person.name,
        jobTitle: person.role,
        url: `${site}${path}`,
        worksFor: { '@id': ids.business },
        sameAs: [BUSINESS.github],
      },
      {
        '@type': 'WebSite',
        '@id': ids.website,
        url: `${site}/`,
        name: person.name,
        inLanguage: LANGS.map((l) => l.code),
        publisher: { '@id': ids.business },
      },
    ],
  }
}
