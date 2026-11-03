// Après le build : écrit dist/retrouvez-vous.html (et dist/retrouvez-vous/index.html),
// copie de dist/index.html avec le titre, la description, les aperçus de lien, le canonical,
// le texte d'accueil et les données structurées du bilan RETROUVEZ-VOUS (« le bilan de
// RECONSTRUCTION AFFECTIVE »). Les aperçus de lien n'exécutent pas JavaScript, et la page doit
// se référencer pour elle-même (Cyrille, 03/11/2026 : « on veut dominer le SEO »).
// Caddy réécrit /retrouvez-vous vers ce fichier.
// Textes : TEXTES_RV, importé de src/rv/textes.ts (Node lit le TypeScript sans compilation).
// Une balise attendue introuvable arrête le build : jamais de page du bilan aux couleurs du Test.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { TEXTES_RV } from '../src/rv/textes.ts'

const URL_RV = 'https://test.souverainauquotidien.com/retrouvez-vous'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Remplace exactement une occurrence de `re` ; sinon erreur (balise du Test changée). */
function une(html, re, rempl, nom) {
  const n = (html.match(new RegExp(re.source, 'g')) || []).length
  if (n !== 1) throw new Error(`index.html : ${nom} trouvé ${n} fois (attendu 1)`)
  return html.replace(re, () => rempl)
}

/** Données structurées du bilan : la page, son auteur et son livre (repris du Test). */
function donneesStructurees(html, t) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (!m) throw new Error('index.html : JSON-LD du Test introuvable')
  const graphe = JSON.parse(m[1])['@graph'] ?? []
  const garde = graphe.filter((n) => n['@type'] === 'Person' || n['@type'] === 'Book')
  const auteur = garde.find((n) => n['@type'] === 'Person')
  if (!auteur || garde.length !== 2) throw new Error('index.html : Person et Book attendus dans le JSON-LD')
  const page = {
    '@type': 'WebPage',
    '@id': `${URL_RV}#page`,
    url: URL_RV,
    name: t.meta.titre,
    description: t.meta.description,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    author: { '@id': auteur['@id'] },
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': [page, ...garde] }, null, 2)
  return json.replace(/</g, '\\u003c')
}

export function pageRv(html, t = TEXTES_RV) {
  const T = esc(t.meta.titre), D = esc(t.meta.description), A = t.accueil
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
  // Données structurées : la page du bilan, son auteur et son livre ; ni le Quiz ni le Service du Test.
  html = une(html, /<!-- Données structurées JSON-LD[^>]*-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<!-- Données structurées JSON-LD du bilan (scripts/page-retrouvez-vous.mjs) -->\n    <script type="application/ld+json">\n${donneesStructurees(html, t)}\n    </script>`, 'JSON-LD')
  // Le texte de l'accueil en clair : les robots et les visiteurs sans JavaScript lisent la page.
  const p = (s) => `        <p>${esc(s)}</p>`
  html = une(html, /<noscript>\s*<header>[\s\S]*?<\/noscript>/, `<noscript>
      <header>
        <p style="text-transform:uppercase;font-size:0.875rem;letter-spacing:0.14em;color:#A8432B;">${esc(A.surtitre)}</p>
        <h1>${esc(A.titre)}</h1>
${p(A.sousTitre)}
${p(A.demande)}
        <p><strong>${esc(A.bouton)}</strong> : ce bilan se fait dans le navigateur et nécessite JavaScript. Activez JavaScript, puis rechargez cette page.</p>
${p(A.sousBouton)}
      </header>
      <main>
${A.corps.map(p).join('\n')}
        <ul>
${A.dimensions.map((d) => `          <li>${esc(d)}</li>`).join('\n')}
        </ul>
        <h2>${esc(A.apresTitre)}</h2>
${p(A.apres)}
${p(A.demandeBas)}
${p(A.prudence)}
      </main>
      <footer>
        <p><a href="/mentions-legales/">Mentions légales</a> · <a href="/cgv/">CGV</a> · <a href="/privacy/">Politique de confidentialité</a></p>
      </footer>
    </noscript>`, 'noscript')
  for (const reste of ['og-image.png', '"Quiz"', '"Service"', 'Découvrez votre masque', 'Test de dépendance affective gratuit']) {
    if (html.includes(reste)) throw new Error(`page du bilan : « ${reste} » encore présent`)
  }
  return html
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const racine = fileURLToPath(new URL('..', import.meta.url))
  const html = pageRv(readFileSync(`${racine}dist/index.html`, 'utf8'))
  writeFileSync(`${racine}dist/retrouvez-vous.html`, html)
  mkdirSync(`${racine}dist/retrouvez-vous`, { recursive: true })
  writeFileSync(`${racine}dist/retrouvez-vous/index.html`, html)
  console.log('page-retrouvez-vous : dist/retrouvez-vous.html et dist/retrouvez-vous/index.html écrits')
}
