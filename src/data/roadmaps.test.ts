import { describe, expect, it } from 'vitest'
import { roadmaps } from './roadmaps'
import type { IntensiteId, ProfilId } from '../domain/types'

const PROFIL_IDS: ProfilId[] = ['mendiant', 'sauveur', 'controleur', 'fantome']
const INTENSITES: IntensiteId[] = ['surface', 'modere', 'profond']

describe('Données roadmaps — structure et couverture', () => {
  it('Exactement 12 roadmaps (4 profils × 3 intensités)', () => {
    expect(roadmaps).toHaveLength(12)
  })

  it('Chaque couple (profilId, intensite) apparaît exactement une fois', () => {
    const couples = new Set(
      roadmaps.map((r) => `${r.profilId}|${r.intensite}`),
    )
    expect(couples.size).toBe(12)
    for (const profilId of PROFIL_IDS) {
      for (const intensite of INTENSITES) {
        expect(couples.has(`${profilId}|${intensite}`), `${profilId}×${intensite}`).toBe(true)
      }
    }
  })

  it('Chaque roadmap a les 4 textes (3 pas + exercice corporel) non vides', () => {
    for (const r of roadmaps) {
      const tag = `${r.profilId}×${r.intensite}`
      expect(r.pasNumeroUn.length, `${tag}.pasUn`).toBeGreaterThan(50)
      expect(r.pasNumeroDeux.length, `${tag}.pasDeux`).toBeGreaterThan(50)
      expect(r.pasNumeroTrois.length, `${tag}.pasTrois`).toBeGreaterThan(50)
      expect(r.exerciceCorporel.length, `${tag}.exerciceCorporel`).toBeGreaterThan(50)
    }
  })

  it('chapitresLivreCibles : tableau de numéros entre 1 et 12, sans doublon', () => {
    for (const r of roadmaps) {
      const tag = `${r.profilId}×${r.intensite}`
      expect(r.chapitresLivreCibles.length, `${tag} non vide`).toBeGreaterThan(0)
      expect(new Set(r.chapitresLivreCibles).size, `${tag} sans doublon`).toBe(
        r.chapitresLivreCibles.length,
      )
      for (const c of r.chapitresLivreCibles) {
        expect(c, `${tag} chapitre ${c}`).toBeGreaterThanOrEqual(1)
        expect(c, `${tag} chapitre ${c}`).toBeLessThanOrEqual(12)
      }
    }
  })

  it('Intensité profond : chaque roadmap recommande au moins 4 chapitres (la profondeur appelle plus de matière)', () => {
    const profondes = roadmaps.filter((r) => r.intensite === 'profond')
    expect(profondes).toHaveLength(4)
    for (const r of profondes) {
      expect(r.chapitresLivreCibles.length, `${r.profilId}×profond`).toBeGreaterThanOrEqual(4)
    }
  })

  it("Intensité profond : pas numéro 1 ou pas numéro 2 mentionne 'médecin' ou 'évaluation médicale' (urgence sanitaire)", () => {
    // À ce niveau d'intensité, les pas critiques mentionnent l'évaluation médicale.
    // Cf. cahier des charges : "urgence à agir".
    const profondes = roadmaps.filter((r) => r.intensite === 'profond')
    for (const r of profondes) {
      const txt = `${r.pasNumeroUn} ${r.pasNumeroDeux}`.toLowerCase()
      expect(txt, `${r.profilId}×profond`).toMatch(/m[éée]decin|m[éée]dical|burn-out|burnout|épuisement/)
    }
  })
})
