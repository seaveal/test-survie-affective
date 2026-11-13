import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ApercuResultat from './preview-result.tsx'
import AppRV from './rv/AppRV.tsx'
import { TEXTES_RV } from './rv/textes.ts'
import { veillerAccordContact } from './api/client.ts'

veillerAccordContact()

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

// Bilan RETROUVEZ-VOUS : même application, aiguillée sur le chemin (SPEC §3).
const rv = !apercu && /^\/retrouvez-vous\/?$/.test(window.location.pathname)
if (rv) {
  document.title = TEXTES_RV.meta.titre
  const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]') ?? document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'description' }))
  meta.content = TEXTES_RV.meta.description
}

// Reprise après rechargement : la question s'affiche en haut. Le navigateur ne
// rend pas le défilement de la page précédente (WebKit, navigateur Instagram,
// le rendrait parfois après l'effet de retour en haut d'App.tsx).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {apercu ? <ApercuResultat /> : rv ? <AppRV /> : <App />}
  </StrictMode>,
)
