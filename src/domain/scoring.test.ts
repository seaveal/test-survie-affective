import { describe, expect, it } from 'vitest'
import {
  calculerScoreProfils,
  calculerProfilDominant,
  calculerProfilSecondaire,
} from './scoring'
import type { ProfilId, QuestionTypage, Reponses, ScoreProfils } from './types'

// MOCK questions de typage : 20 questions, chacune avec 4 options A/B/C/D
// mappées respectivement aux 4 profils dans le même ordre. Pour les tests on
// peut donc choisir 'A' = mendiant, 'B' = sauveur, 'C' = controleur, 'D' = fantome.
const mockQuestionsTypage: QuestionTypage[] = Array.from({ length: 20 }, (_, idx) => {
  const id = idx + 1
  return {
    id,
    type: 'typage' as const,
    enonce: `Question ${id}`,
    options: [
      { id: 'A', texte: 'A', profil: 'mendiant' as ProfilId },
      { id: 'B', texte: 'B', profil: 'sauveur' as ProfilId },
      { id: 'C', texte: 'C', profil: 'controleur' as ProfilId },
      { id: 'D', texte: 'D', profil: 'fantome' as ProfilId },
    ],
  }
})

const profilOption: Record<ProfilId, string> = {
  mendiant: 'A',
  sauveur: 'B',
  controleur: 'C',
  fantome: 'D',
}

// Génère un Record<questionId, optionId> avec n réponses par profil.
const reponsesTypage = (parProfil: Partial<Record<ProfilId, number>>): Record<number, string> => {
  const res: Record<number, string> = {}
  let id = 1
  const profils: ProfilId[] = ['mendiant', 'sauveur', 'controleur', 'fantome']
  for (const profil of profils) {
    const n = parProfil[profil] ?? 0
    for (let i = 0; i < n; i++) {
      res[id++] = profilOption[profil]
    }
  }
  return res
}

const baseReponses = (): Reponses => ({
  typage: {},
  intensite: { 21: 3, 22: 3, 23: 3, 24: 3, 25: 3, 26: 3 },
  contexte: {
    statutLivre: 'pas_lu',
    situation: 'celibat_long',
    etatEmotionnel: 'fonctionnel',
    pretAAgir: 'incertain',
  },
})

describe('calculerScoreProfils — Phase 1 TDD scoring', () => {
  it('Test 1.1 : 20 réponses Mendiant → score.mendiant = 60, autres = 0', () => {
    const reponses: Reponses = { ...baseReponses(), typage: reponsesTypage({ mendiant: 20 }) }
    const score = calculerScoreProfils(reponses, mockQuestionsTypage)
    expect(score).toEqual<ScoreProfils>({
      mendiant: 60,
      sauveur: 0,
      controleur: 0,
      fantome: 0,
    })
  })

  it('Test 1.2 : 20 réponses Fantôme → score.fantome = 60', () => {
    const reponses: Reponses = { ...baseReponses(), typage: reponsesTypage({ fantome: 20 }) }
    const score = calculerScoreProfils(reponses, mockQuestionsTypage)
    expect(score).toEqual<ScoreProfils>({
      mendiant: 0,
      sauveur: 0,
      controleur: 0,
      fantome: 60,
    })
  })

  it('Test 1.3 : 11 Sauveur + 9 Mendiant → S=33, M=27', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypage({ sauveur: 11, mendiant: 9 }),
    }
    const score = calculerScoreProfils(reponses, mockQuestionsTypage)
    expect(score).toEqual<ScoreProfils>({
      mendiant: 27,
      sauveur: 33,
      controleur: 0,
      fantome: 0,
    })
  })

  it('Test 1.7 : reponses.typage incomplet (< 20) → erreur', () => {
    const reponses: Reponses = { ...baseReponses(), typage: reponsesTypage({ mendiant: 19 }) }
    expect(() => calculerScoreProfils(reponses, mockQuestionsTypage)).toThrow(/incompl/i)
  })

  it('Test 1.8 : option inexistante → erreur', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: { ...reponsesTypage({ mendiant: 19 }), 20: 'X-INEXISTANT' },
    }
    expect(() => calculerScoreProfils(reponses, mockQuestionsTypage)).toThrow(/option/i)
  })

  it('Test 1.9 : pure (mêmes entrées → mêmes sorties, pas de mutation)', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypage({ mendiant: 5, sauveur: 5, controleur: 5, fantome: 5 }),
    }
    const a = calculerScoreProfils(reponses, mockQuestionsTypage)
    const b = calculerScoreProfils(reponses, mockQuestionsTypage)
    expect(a).toEqual(b)
    expect(Object.keys(reponses.typage)).toHaveLength(20)
  })
})

describe('calculerProfilDominant — tie-breaking', () => {
  it('Test 1.4 : égalité Fantôme/Contrôleur 10/10 → dominant = fantome (priorité prédéfinie)', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypage({ fantome: 10, controleur: 10 }),
    }
    expect(calculerProfilDominant(reponses, mockQuestionsTypage)).toBe('fantome')
  })

  it('Tie-break ordre Fantôme > Contrôleur > Sauveur > Mendiant : Mendiant 10 vs Sauveur 10 → sauveur', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypage({ sauveur: 10, mendiant: 10 }),
    }
    expect(calculerProfilDominant(reponses, mockQuestionsTypage)).toBe('sauveur')
  })

  it("Test 1.10 : tie-breaker via questions discriminantes (1, 4, 11, 19) tranche avant l'ordre prédéfini", () => {
    // 10 fantome / 10 controleur, mais sur Q discriminantes 3 controleur / 1 fantome → controleur gagne
    const typage: Record<number, string> = {
      1: profilOption.controleur,
      4: profilOption.controleur,
      11: profilOption.controleur,
      19: profilOption.fantome,
    }
    let id = 2
    let fantomeRest = 9
    let controleurRest = 7
    while (fantomeRest > 0 || controleurRest > 0) {
      if (id === 4 || id === 11 || id === 19) {
        id++
        continue
      }
      if (fantomeRest > 0) {
        typage[id] = profilOption.fantome
        fantomeRest--
      } else {
        typage[id] = profilOption.controleur
        controleurRest--
      }
      id++
    }
    expect(Object.keys(typage)).toHaveLength(20)
    const reponses: Reponses = { ...baseReponses(), typage }
    expect(calculerProfilDominant(reponses, mockQuestionsTypage)).toBe('controleur')
  })
})

describe('calculerProfilSecondaire', () => {
  it('Test 1.5 : dominant 30, second 27 (écart 3) → secondaire = second profil', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypage({ sauveur: 10, mendiant: 9, fantome: 1 }),
    }
    expect(calculerProfilSecondaire(reponses, mockQuestionsTypage)).toBe('mendiant')
  })

  it('Test 1.6 : dominant 30, second 24 (écart 6) → secondaire = null', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      typage: reponsesTypage({ sauveur: 10, mendiant: 8, fantome: 2 }),
    }
    expect(calculerProfilSecondaire(reponses, mockQuestionsTypage)).toBeNull()
  })
})
