import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ApercuResultat from './preview-result.tsx'

const apercu = new URLSearchParams(window.location.search).get('apercu') === 'resultat'
if (apercu) {
  document.title = 'Page de résultats — aperçu · Cyrille Novou'
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (!robots) {
    robots = document.createElement('meta')
    robots.name = 'robots'
    document.head.append(robots)
  }
  robots.content = 'noindex, nofollow'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {apercu ? <ApercuResultat /> : <App />}
  </StrictMode>,
)
