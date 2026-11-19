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
 * and hreflang alternates on each page, plus absolute share images (public/og/). These need the site's
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
      // Only the three language pages are translations of each other
      if (!own) return html
      const tags = [
        `<link rel="canonical" href="${site}${own.path}" />`,
        ...Object.entries(pages).map(([lang, p]) => `<link rel="alternate" hreflang="${lang}" href="${site}${p.path}" />`),
        `<link rel="alternate" hreflang="x-default" href="${site}/" />`,
      ]
        .filter(Boolean)
        .join('\n    ')
      return html
        .replace('</head>', `    ${tags}\n  </head>`)
        // Share previews need the image's full address (og:image, twitter:image)
        .replace(/(<meta (?:property="og:image"|name="twitter:image") content=")\//g, `$1${site}/`)
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
      if (hidden) {
        this.emitFile({ type: 'asset', fileName: '_headers', source: '/*\n  X-Robots-Tag: noindex, nofollow\n' })
      }
    },
  }
}

/**
 * robots.txt, and for the real site a sitemap.xml: the three language pages, each with its
 * translations, dated with the build. It needs the site's address (SITE_URL), and a hidden
 * preview gets none, so it never points crawlers at pages that ask not to be indexed.
 * The mentions légales stay out of it: required by law, of no use to a search.
 */
function crawlerFiles(): Plugin {
  const site = process.env.SITE_URL?.replace(/\/$/, '')
  const listed = !!site && !process.env.HIDDEN
  return {
    name: 'crawler-files',
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(listed ? ['', `Sitemap: ${site}/sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
      if (!listed) return
      const today = new Date().toISOString().slice(0, 10)
      const alternates = [
        ...Object.entries(pages).map(([lang, p]) => [lang, p.path]),
        ['x-default', pages.en.path],
      ]
        .map(([lang, path]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${site}${path}" />`)
        .join('\n')
      const urls = Object.values(pages)
        .map((p) => `  <url>\n    <loc>${site}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`)
        .join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), languageLinks(), hiddenPreview(), crawlerFiles()],
  build: {
    rollupOptions: {
      input: {
        ...Object.fromEntries(Object.entries(pages).map(([lang, p]) => [lang, resolve(__dirname, p.html)])),
        // French only: the version French law asks for, linked from every page's footer
        legal: resolve(__dirname, 'mentions-legales/index.html'),
      },
    },
  },
})
