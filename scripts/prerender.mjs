/**
 * Runs after `vite build` (see the build script in package.json): writes the page's real
 * content into dist/index.html, dist/it/index.html and dist/fr/index.html, so search
 * engines and AI assistants that don't run JavaScript read the whole site, not an empty
 * <div id="root">. Visitors see no difference: the app draws itself again over it.
 * With SITE_URL set it also adds the page's structured data (src/lib/structuredData.ts).
 *
 * It builds src/entry-server.tsx for Node, then loads it once per language: the page's
 * language comes from globalThis.__PRERENDER_LANG__ (src/lib/lang.ts), and a different
 * query string on the import makes Node evaluate the bundle afresh each time.
 */
import react from '@vitejs/plugin-react'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'dist-ssr')
const pages = [
  { lang: 'en', html: 'dist/index.html' },
  { lang: 'it', html: 'dist/it/index.html' },
  { lang: 'fr', html: 'dist/fr/index.html' },
]
const EMPTY = '<div id="root"></div>'
const site = process.env.SITE_URL?.replace(/\/$/, '')

/** The page's meta description, as plain text: the business description in its language */
function metaDescription(page, html) {
  const match = page.match(/<meta\s+name="description"\s+content="([^"]*)"/)
  if (!match) throw new Error(`${html}: no meta description`)
  return match[1]
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

await build({
  root,
  configFile: false,
  logLevel: 'warn',
  plugins: [react()],
  build: { ssr: 'src/entry-server.tsx', outDir: out, emptyOutDir: true },
})

const entry = pathToFileURL(resolve(out, 'entry-server.js')).href
try {
  for (const { lang, html } of pages) {
    globalThis.__PRERENDER_LANG__ = lang
    const { render, structuredData } = await import(`${entry}?lang=${lang}`)
    const file = resolve(root, html)
    let page = await readFile(file, 'utf8')
    if (!page.includes(EMPTY)) throw new Error(`${html}: no empty ${EMPTY} to fill`)
    page = page.replace(EMPTY, `<div id="root">${render()}</div>`)
    // Structured data needs the site's full address, like the canonical links (vite.config.ts)
    if (site) {
      const json = JSON.stringify(structuredData(site, metaDescription(page, html))).replace(/</g, '\\u003c')
      page = page.replace('</head>', `  <script type="application/ld+json">${json}</script>\n  </head>`)
    }
    await writeFile(file, page)
    console.log(`prerendered ${html}${site ? ' + structured data' : ''}`)
  }
} finally {
  delete globalThis.__PRERENDER_LANG__
  await rm(out, { recursive: true, force: true })
}
