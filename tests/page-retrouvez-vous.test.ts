// La page servie pour /retrouvez-vous (scripts/page-retrouvez-vous.mjs, après le build)
// porte le titre, la description et les aperçus de lien du bilan, jamais ceux du Test
// (audit du 03/11/2026, FRONT-02).
import { readFileSync } from 'node:fs'
import { pageRv, textesRv } from '../scripts/page-retrouvez-vous.mjs'
import { TEXTES_RV } from '../src/rv/textes'

const t = textesRv(readFileSync('src/rv/textes.ts', 'utf8'))
const html = pageRv(readFileSync('index.html', 'utf8'), t)

test('les textes lus dans textes.ts sont ceux de la page', () => {
  expect(t).toEqual({
    titre: TEXTES_RV.meta.titre,
    description: TEXTES_RV.meta.description,
    surtitre: TEXTES_RV.accueil.surtitre,
    h1: TEXTES_RV.accueil.titre,
  })
})

test('titre, description, canonical et aperçus de lien du bilan', () => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const attr = (sel: string, a = 'content') => doc.querySelector(sel)?.getAttribute(a)
  expect(doc.title).toBe(TEXTES_RV.meta.titre)
  expect(attr('meta[name="description"]')).toBe(TEXTES_RV.meta.description)
  expect(attr('link[rel="canonical"]', 'href')).toBe('https://test.souverainauquotidien.com/retrouvez-vous')
  expect(attr('meta[property="og:url"]')).toBe('https://test.souverainauquotidien.com/retrouvez-vous')
  expect(attr('meta[property="og:title"]')).toBe(TEXTES_RV.meta.titre)
  expect(attr('meta[property="og:description"]')).toBe(TEXTES_RV.meta.description)
  expect(attr('meta[name="twitter:title"]')).toBe(TEXTES_RV.meta.titre)
  expect(doc.querySelector('meta[property^="og:image"], meta[name="twitter:image"]')).toBeNull()
  expect(doc.querySelector('script[type="application/ld+json"]')).toBeNull()
  expect(html).toContain('H3C-TRACKING:BEGIN')
  expect(html).not.toMatch(/masque|Test de dépendance|Survie Affective/)
})

test('une balise du Test introuvable arrête le build', () => {
  expect(() => pageRv(readFileSync('index.html', 'utf8').replace('<title>', '<title data-x>'), t)).toThrow(/<title>/)
})

test('une chaîne que la lecture rendrait fausse (concaténation, échappement) arrête le build', () => {
  const ts = readFileSync('src/rv/textes.ts', 'utf8')
  const avec = (titre: string) => ts.replace(/(meta: \{\s*titre: )"[^"]*"/, `$1${titre}`)
  expect(() => textesRv(avec(`'Le bilan' + ' de RECONSTRUCTION'`))).toThrow(/titre/)
  expect(() => textesRv(avec(`"Le \\"bilan"`))).toThrow(/titre/)
  expect(textesRv(avec(`'Le bilan d\\'essai'`)).titre).toBe("Le bilan d'essai")
})
