import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initServiceWorkerAutoReload } from './lib/swAutoReload'
import { initTheme } from './lib/theme'
import { initViewportHeightFix } from './lib/viewportHeight'

initTheme()
initViewportHeightFix()
initServiceWorkerAutoReload()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
