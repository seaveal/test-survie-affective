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

// Reprise après rechargement : la question s'affiche en haut. Le navigateur ne
// rend pas le défilement de la page précédente (WebKit, navigateur Instagram,
// le rendrait parfois après l'effet de retour en haut d'App.tsx).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {apercu ? <ApercuResultat /> : <App />}
  </StrictMode>,
)
