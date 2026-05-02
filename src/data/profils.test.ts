import { describe, expect, it } from 'vitest'
import { ctaParStatut, profils } from './profils'
import type { ProfilId, StatutLivre } from '../domain/types'

const PROFIL_IDS: ProfilId[] = ['mendiant', 'sauveur', 'controleur', 'fantome']
const STATUTS: StatutLivre[] = ['pas_lu', 'lu_partiel', 'lu_complet']

describe('Données profils — structure et invariants', () => {
  it('Exactement 4 profils, IDs uniques, couvre les 4 ProfilId', () => {
    expect(profils).toHaveLength(4)
    const ids = profils.map((p) => p.id).sort()
    expect(ids).toEqual([...PROFIL_IDS].sort())
  })

  it('Chaque profil a tous les champs renseignés et non vides', () => {
    for (const p of profils) {
      expect(p.nom, `${p.id}.nom`).toBeTruthy()
      expect(p.icone, `${p.id}.icone`).toBeTruthy()
      expect(p.ambassadeur, `${p.id}.ambassadeur`).toBeTruthy()
      expect(p.descriptionBase.length, `${p.id}.descriptionBase`).toBeGreaterThan(100)
    }
  })

  it('Chaque profil a exactement 7 symptômes non vides', () => {
    for (const p of profils) {
      expect(p.septSymptomes, `${p.id}.septSymptomes`).toHaveLength(7)
      for (const [i, s] of p.septSymptomes.entries()) {
        expect(s.length, `${p.id}.septSymptomes[${i}]`).toBeGreaterThan(20)
      }
    }
  })

  it('Chaque profil a 3 modulateurs (surface, modere, profond) tous non vides', () => {
    for (const p of profils) {
      const m = p.modulateursIntensite
      expect(m.surface.length, `${p.id}.modulateurs.surface`).toBeGreaterThan(50)
      expect(m.modere.length, `${p.id}.modulateurs.modere`).toBeGreaterThan(50)
      expect(m.profond.length, `${p.id}.modulateurs.profond`).toBeGreaterThan(50)
    }
  })

  it('Ambassadeurs canon : Fabrice (mendiant), Jérémy (sauveur), Nathan (controleur), Caroline (fantome)', () => {
    const map = Object.fromEntries(profils.map((p) => [p.id, p.ambassadeur]))
    expect(map.mendiant).toMatch(/Fabrice/)
    expect(map.sauveur).toMatch(/Jérémy/)
    expect(map.controleur).toMatch(/Nathan/)
    expect(map.fantome).toMatch(/Caroline/)
  })
})

describe('CTA par statut livre', () => {
  it('Les 3 statuts (pas_lu, lu_partiel, lu_complet) sont tous présents', () => {
    for (const statut of STATUTS) {
      expect(ctaParStatut[statut], `cta[${statut}]`).toBeDefined()
    }
  })

  it('Chaque CTA a amorce + ctaPrincipal + ctaSecondaire', () => {
    for (const statut of STATUTS) {
      const c = ctaParStatut[statut]
      expect(c.amorce.length, `${statut}.amorce`).toBeGreaterThan(50)
      expect(c.ctaPrincipal.texte, `${statut}.ctaPrincipal.texte`).toBeTruthy()
      expect(c.ctaPrincipal.url, `${statut}.ctaPrincipal.url`).toMatch(/^https?:\/\//)
      expect(c.ctaSecondaire.texte, `${statut}.ctaSecondaire.texte`).toBeTruthy()
      expect(c.ctaSecondaire.url, `${statut}.ctaSecondaire.url`).toMatch(/^https?:\/\//)
    }
  })

  it("URLs : pas_lu pointe vers le livre, lu_complet pointe vers l'appel", () => {
    expect(ctaParStatut.pas_lu.ctaPrincipal.url).toMatch(/livre/i)
    expect(ctaParStatut.lu_complet.ctaPrincipal.url).toMatch(/appel/i)
  })
})
