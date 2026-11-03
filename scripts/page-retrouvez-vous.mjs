// Après le build : écrit dist/retrouvez-vous.html (et dist/retrouvez-vous/index.html),
// copie de dist/index.html avec le titre, la description, les aperçus de lien et le
// canonical du bilan RETROUVEZ-VOUS (audit du 03/11/2026, FRONT-02). Sans ce fichier,
// un lien partagé (WhatsApp, Facebook, YouTube) annonçait le Test de Survie Affective :
// les aperçus n'exécutent pas JavaScript. Caddy sert {path}.html en premier.
// Textes lus dans src/rv/textes.ts (source unique). Une balise attendue introuvable
// arrête le build : jamais de page du bilan aux couleurs du Test.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const URL_RV = 'https://test.souverainauquotidien.com/retrouvez-vous'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function textesRv(ts) {
  const bloc = (re, nom) => {
    const m = ts.match(re)
    if (!m) throw new Error(`textes.ts : bloc ${nom} introuvable`)
    return m[1]
  }
  const prendre = (b, cle) => {
    const m = b.match(new RegExp(String.raw`\b${cle}:\s*(?:"([^"]*)"|'((?:[^'\\]|\\.)*)')`))
    if (!m) throw new Error(`textes.ts : ${cle} introuvable`)
    return (m[1] ?? m[2]).replace(/\\'/g, "'")
  }
  const meta = bloc(/\bmeta:\s*\{([\s\S]*?)\}/, 'meta')
  const accueil = bloc(/\baccueil:\s*\{([\s\S]*?)\bcorps:/, 'accueil')
  return {
    titre: prendre(meta, 'titre'),
    description: prendre(meta, 'description'),
    surtitre: prendre(accueil, 'surtitre'),
    h1: prendre(accueil, 'titre'),
  }
}

/** Remplace exactement une occurrence de `re` ; sinon erreur (balise du Test changée). */
function une(html, re, rempl, nom) {
  const n = (html.match(new RegExp(re.source, 'g')) || []).length
  if (n !== 1) throw new Error(`index.html : ${nom} trouvé ${n} fois (attendu 1)`)
  return html.replace(re, rempl)
}

export function pageRv(html, t) {
  const T = esc(t.titre), D = esc(t.description)
  html = une(html, /<title>[^<]*<\/title>/, `<title>${T}</title>`, '<title>')
  html = une(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${D}" />`, 'meta description')
  html = une(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${URL_RV}" />`, 'canonical')
  html = une(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${URL_RV}" />`, 'og:url')
  html = une(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${T}" />`, 'og:title')
  html = une(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${D}" />`, 'og:description')
  html = une(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${T}" />`, 'twitter:title')
  html = une(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${D}" />`, 'twitter:description')
  // L'image du Test (« Test de dépendance affective ») ne représente pas le bilan :
  // aperçu sans image tant qu'aucune image propre au bilan n'existe.
  html = html.replace(/\s*<meta property="og:image[^>]*\/>/g, '')
  html = une(html, /<meta name="twitter:image" content="[^"]*" \/>/, '', 'twitter:image')
  html = une(html, /<meta name="twitter:card" content="summary_large_image" \/>/, '<meta name="twitter:card" content="summary" />', 'twitter:card')
  // Données structurées du Test (Quiz, Service…) : elles décriraient une autre page.
  html = une(html, /\s*<!-- Données structurées JSON-LD[^>]*-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '', 'JSON-LD')
  html = une(html, /<noscript>\s*<header>[\s\S]*?<\/noscript>/, `<noscript>
      <header>
        <p style="text-transform:uppercase;font-size:0.875rem;letter-spacing:0.14em;color:#A8432B;">${esc(t.surtitre)}</p>
        <h1>${esc(t.h1)}</h1>
        <p>${D}</p>
        <p>Ce bilan se fait dans le navigateur et nécessite JavaScript. Activez JavaScript, puis rechargez cette page.</p>
      </header>
      <footer>
        <p><a href="/mentions-legales/">Mentions légales</a> · <a href="/cgv/">CGV</a> · <a href="/privacy/">Politique de confidentialité</a></p>
      </footer>
    </noscript>`, 'noscript')
  for (const reste of ['og-image.png', 'application/ld+json', 'Découvrez votre masque', 'Test de dépendance affective gratuit']) {
    if (html.includes(reste)) throw new Error(`page du bilan : « ${reste} » encore présent`)
  }
  return html
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const racine = fileURLToPath(new URL('..', import.meta.url))
  const t = textesRv(readFileSync(`${racine}src/rv/textes.ts`, 'utf8'))
  const html = pageRv(readFileSync(`${racine}dist/index.html`, 'utf8'), t)
  writeFileSync(`${racine}dist/retrouvez-vous.html`, html)
  mkdirSync(`${racine}dist/retrouvez-vous`, { recursive: true })
  writeFileSync(`${racine}dist/retrouvez-vous/index.html`, html)
  console.log('page-retrouvez-vous : dist/retrouvez-vous.html et dist/retrouvez-vous/index.html écrits')
}
