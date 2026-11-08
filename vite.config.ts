import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

/** One page per language: index.html is English, it/ and fr/ the translations (src/lib/lang.ts) */
const pages = {
  en: { html: 'index.html', path: '/' },
  it: { html: 'it/index.html', path: '/it/' },
  fr: { html: 'fr/index.html', path: '/fr/' },
}

/**
 * Tells search engines the three pages are one site in three languages: a canonical link
 * and hreflang alternates on each page, plus an absolute share image. These need the site's
 * full address, so they are only written when SITE_URL is set at build time, e.g.
 * SITE_URL=https://alessiomura.com npm run build
 */
function languageLinks(): Plugin {
  const site = process.env.SITE_URL?.replace(/\/$/, '')
  return {
    name: 'language-links',
    transformIndexHtml(html, ctx) {
      if (!site) return html
      const own = Object.values(pages).find((p) => resolve(ctx.filename) === resolve(__dirname, p.html))
      const tags = [
        own && `<link rel="canonical" href="${site}${own.path}" />`,
        ...Object.entries(pages).map(([lang, p]) => `<link rel="alternate" hreflang="${lang}" href="${site}${p.path}" />`),
        `<link rel="alternate" hreflang="x-default" href="${site}/" />`,
      ]
        .filter(Boolean)
        .join('\n    ')
      return html
        .replace('</head>', `    ${tags}\n  </head>`)
        .replace('content="/photos/fuji.webp"', `content="${site}/photos/fuji.webp"`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), languageLinks()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([lang, p]) => [lang, resolve(__dirname, p.html)])),
    },
  },
})
