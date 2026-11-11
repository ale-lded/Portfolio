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
 * SITE_URL=https://alessiomura.fr npm run build
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

/**
 * A preview build for friends, before the launch: HIDDEN=1 npm run build asks search
 * engines to stay away, with a noindex tag on every page and an X-Robots-Tag header
 * (a _headers file, read by Netlify and Cloudflare Pages). robots.txt still lets crawlers
 * in: a page they may not fetch is a page whose noindex they never see.
 * Anyone with the link still sees the site. Leave HIDDEN out for the real launch.
 */
function hiddenPreview(): Plugin {
  const hidden = !!process.env.HIDDEN
  return {
    name: 'hidden-preview',
    transformIndexHtml(html) {
      if (!hidden) return html
      return html.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>')
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: 'User-agent: *\nAllow: /\n' })
      if (hidden) {
        this.emitFile({ type: 'asset', fileName: '_headers', source: '/*\n  X-Robots-Tag: noindex, nofollow\n' })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), languageLinks(), hiddenPreview()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([lang, p]) => [lang, resolve(__dirname, p.html)])),
    },
  },
})
