import { renderToString } from 'react-dom/server'
import App from './App'

/**
 * The page as React first draws it, as HTML: scripts/prerender.mjs writes it into each
 * language's index.html at build time, so the text is there for search engines and
 * assistants that don't run JavaScript. In the browser, main.tsx draws the app again over it.
 */
export function render() {
  return renderToString(<App />)
}
