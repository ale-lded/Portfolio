import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource-variable/space-grotesk'
import './index.css'
import App from './App.tsx'
import { restoreScroll, settleLang } from './lib/lang'

// A first visit may belong on another language's page: go there before drawing anything
if (settleLang()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  restoreScroll()
}
