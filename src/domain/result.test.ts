import { describe, expect, it } from 'vitest'
import { composerResultat, getProfil, getRoadmap } from './result'
import type { ProfilId, QuestionTypage, Reponses } from './types'

// MOCK questions de typage (idem scoring.test.ts) : 20 questions, A=mendiant
// B=sauveur, C=controleur, D=fantome.
const mockQuestionsTypage: QuestionTypage[] = Array.from({ length: 20 }, (_, idx) => ({
  id: idx + 1,
  type: 'typage' as const,
  enonce: `Question ${idx + 1}`,
  options: [
    { id: 'A', texte: 'A', profil: 'mendiant' as ProfilId },
    { id: 'B', texte: 'B', profil: 'sauveur' as ProfilId },
    { id: 'C', texte: 'C', profil: 'controleur' as ProfilId },
    { id: 'D', texte: 'D', profil: 'fantome' as ProfilId },
  ],
}))

const profilOption: Record<ProfilId, string> = {
  mendiant: 'A',
  sauveur: 'B',
  controleur: 'C',
  fantome: 'D',
}

const reponsesTypageDe = (parProfil: Partial<Record<ProfilId, number>>): Record<number, string> => {
  const res: Record<number, string> = {}
  let id = 1
  const profils: ProfilId[] = ['mendiant', 'sauveur', 'controleur', 'fantome']
  for (const p of profils) {
    for (let i = 0; i < (parProfil[p] ?? 0); i++) res[id++] = profilOption[p]
  }
  return res
}

const baseReponses = (): Reponses => ({
  typage: {},
  intensite: { 21: 3, 22: 3, 23: 3, 24: 3, 25: 3, 26: 3 }, // score 18 → modere
  contexte: {
    statutLivre: 'pas_lu',
    situation: 'celibat_long',
    etatEmotionnel: 'fonctionnel',
    pretAAgir: 'incertain',
  },
})

describe('composerResultat — agrégat domain complet', () => {
  it('Cas nominal : 20 fantome + intensite 18 + contexte par défaut → Resultat complet cohérent', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypageDe({ fantome: 20 }),
    }
    const r = composerResultat(reponses, mockQuestionsTypage)
    expect(r.profilDominant).toBe('fantome')
    expect(r.profilSecondaire).toBeNull()
    expect(r.scoreProfils).toEqual({ mendiant: 0, sauveur: 0, controleur: 0, fantome: 60 })
    expect(r.intensite).toBe('modere')
    expect(r.scoreIntensite).toBe(18)
    expect(r.statutLivre).toBe('pas_lu')
    expect(r.situation).toBe('celibat_long')
    expect(r.etatEmotionnel).toBe('fonctionnel')
    expect(r.pretAAgir).toBe('incertain')
  })

  it('Profil secondaire propagé quand écart < 4 (sauveur 30 / mendiant 27)', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypageDe({ sauveur: 10, mendiant: 9, fantome: 1 }),
    }
    const r = composerResultat(reponses, mockQuestionsTypage)
    expect(r.profilDominant).toBe('sauveur')
    expect(r.profilSecondaire).toBe('mendiant')
  })

  it('Intensité surface (score 6 — toutes réponses à 1)', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypageDe({ controleur: 20 }),
      intensite: { 21: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1 },
    }
    const r = composerResultat(reponses, mockQuestionsTypage)
    expect(r.intensite).toBe('surface')
    expect(r.scoreIntensite).toBe(6)
    expect(r.profilDominant).toBe('controleur')
  })

  it('Intensité profond (score 30 — toutes réponses à 5)', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypageDe({ mendiant: 20 }),
      intensite: { 21: 5, 22: 5, 23: 5, 24: 5, 25: 5, 26: 5 },
    }
    const r = composerResultat(reponses, mockQuestionsTypage)
    expect(r.intensite).toBe('profond')
    expect(r.scoreIntensite).toBe(30)
    expect(r.profilDominant).toBe('mendiant')
  })

  it('Tous les champs de contexte sont propagés tels quels', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypageDe({ fantome: 20 }),
      contexte: {
        statutLivre: 'lu_complet',
        situation: 'couple_difficile',
        etatEmotionnel: 'crise',
        pretAAgir: 'maintenant',
      },
    }
    const r = composerResultat(reponses, mockQuestionsTypage)
    expect(r.statutLivre).toBe('lu_complet')
    expect(r.situation).toBe('couple_difficile')
    expect(r.etatEmotionnel).toBe('crise')
    expect(r.pretAAgir).toBe('maintenant')
  })

  it('Pure : mêmes entrées → mêmes sorties, pas de mutation', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypageDe({ sauveur: 5, mendiant: 5, controleur: 5, fantome: 5 }),
    }
    const a = composerResultat(reponses, mockQuestionsTypage)
    const b = composerResultat(reponses, mockQuestionsTypage)
    expect(a).toEqual(b)
    expect(Object.keys(reponses.typage)).toHaveLength(20)
  })

  it("Erreur propagée si typage incomplet", () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypageDe({ fantome: 19 }),
    }
    expect(() => composerResultat(reponses, mockQuestionsTypage)).toThrow(/incompl/i)
  })
})

describe('Helpers de sélection (pont domain ↔ data)', () => {
  it('getProfil retourne le bon profil avec ses 7 symptômes', () => {
    const p = getProfil('fantome')
    expect(p.id).toBe('fantome')
    expect(p.septSymptomes).toHaveLength(7)
    expect(p.ambassadeur).toMatch(/Caroline/)
  })

  it('getRoadmap retourne la roadmap du couple (profilId, intensite)', () => {
    const r = getRoadmap('mendiant', 'profond')
    expect(r.profilId).toBe('mendiant')
    expect(r.intensite).toBe('profond')
    expect(r.pasNumeroUn.length).toBeGreaterThan(50)
    expect(r.chapitresLivreCibles.length).toBeGreaterThan(0)
  })

  it('Tous les couples (profilId, intensite) sont résolubles via getRoadmap', () => {
    const profils: ProfilId[] = ['mendiant', 'sauveur', 'controleur', 'fantome']
    const intensites = ['surface', 'modere', 'profond'] as const
    for (const p of profils) {
      for (const i of intensites) {
        const r = getRoadmap(p, i)
        expect(r.profilId).toBe(p)
        expect(r.intensite).toBe(i)
      }
    }
  })
})

describe("Smoke test : composerResultat avec les vraies questions de typage", () => {
  it("résout un parcours complet sans erreur (réponse 'A' partout)", async () => {
    const { questionsTypage } = await import('../data/questions')
    const reponses: Reponses = {
      ...baseReponses(),
      typage: Object.fromEntries(questionsTypage.map((q) => [q.id, 'A'])),
    }
    const r = composerResultat(reponses, questionsTypage)
    // 'A' est mappé à différents profils selon les questions, on vérifie
    // simplement que le résultat est bien structuré.
    expect(r.scoreProfils.mendiant + r.scoreProfils.sauveur + r.scoreProfils.controleur + r.scoreProfils.fantome).toBe(60)
    expect(['mendiant', 'sauveur', 'controleur', 'fantome']).toContain(r.profilDominant)
    expect(r.intensite).toBe('modere')
  })
})
