// La page servie pour /retrouvez-vous (scripts/page-retrouvez-vous.mjs, après le build) porte
// le titre, la description, les aperçus de lien, le texte d'accueil et les données structurées
// du bilan, jamais ceux du Test (audit du 03/11/2026, FRONT-02 ; SEO, décision de Cyrille).
import { readFileSync } from 'node:fs'
import { pageRv } from '../scripts/page-retrouvez-vous.mjs'
import { TEXTES_RV } from '../src/rv/textes'

const html = pageRv(readFileSync('index.html', 'utf8'))
const doc = new DOMParser().parseFromString(html, 'text/html')
const attr = (sel: string, a = 'content') => doc.querySelector(sel)?.getAttribute(a)

test('titre, description, canonical, robots et aperçus de lien du bilan', () => {
  expect(doc.title).toBe(TEXTES_RV.meta.titre)
  expect(attr('meta[name="description"]')).toBe(TEXTES_RV.meta.description)
  expect(attr('meta[name="robots"]')).toBe('index,follow')
  expect(attr('link[rel="canonical"]', 'href')).toBe('https://test.souverainauquotidien.com/retrouvez-vous')
  expect(attr('meta[property="og:url"]')).toBe('https://test.souverainauquotidien.com/retrouvez-vous')
  expect(attr('meta[property="og:title"]')).toBe(TEXTES_RV.meta.titre)
  expect(attr('meta[property="og:description"]')).toBe(TEXTES_RV.meta.description)
  expect(attr('meta[name="twitter:title"]')).toBe(TEXTES_RV.meta.titre)
  expect(doc.querySelector('meta[property^="og:image"], meta[name="twitter:image"]')).toBeNull()
  expect(html).toContain('H3C-TRACKING:BEGIN')
  expect(html).not.toMatch(/masque|Test de dépendance|Survie Affective/)
})

test('données structurées : la page du bilan, son auteur et son livre, ni Quiz ni Service', () => {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')]
  expect(scripts).toHaveLength(1)
  const graphe = JSON.parse(scripts[0].textContent ?? '')['@graph']
  expect(graphe.map((n: { '@type': string }) => n['@type'])).toEqual(['WebPage', 'Person', 'Book'])
  expect(graphe[0]).toMatchObject({ url: 'https://test.souverainauquotidien.com/retrouvez-vous',
    name: TEXTES_RV.meta.titre, author: { '@id': graphe[1]['@id'] } })
})

test('le texte de l’accueil est lisible sans JavaScript (robots)', () => {
  const brut = html.slice(html.indexOf('<noscript>'), html.indexOf('</noscript>'))
  const texte = new DOMParser().parseFromString(brut, 'text/html').body.textContent ?? ''
  expect(texte).toContain(TEXTES_RV.accueil.titre)
  for (const s of [...TEXTES_RV.accueil.corps, ...TEXTES_RV.accueil.dimensions, TEXTES_RV.accueil.apres])
    expect(texte).toContain(s)
})

test('une balise du Test introuvable arrête le build', () => {
  expect(() => pageRv(readFileSync('index.html', 'utf8').replace('<title>', '<title data-x>'))).toThrow(/<title>/)
})
