import { describe, expect, it } from 'vitest'
import { calculerIntensite, calculerScoreIntensite } from './intensity'
import type { Reponses } from './types'

const baseReponses = (): Reponses => ({
  typage: {},
  intensite: { 21: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1 },
  contexte: {
    statutLivre: 'pas_lu',
    situation: 'celibat_long',
    etatEmotionnel: 'fonctionnel',
    pretAAgir: 'incertain',
  },
})

describe('calculerScoreIntensite — Phase 2 TDD intensité', () => {
  it('Score min : 6 réponses à 1 → score 6', () => {
    const reponses = baseReponses()
    expect(calculerScoreIntensite(reponses)).toBe(6)
  })

  it('Score max : 6 réponses à 5 → score 30', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      intensite: { 21: 5, 22: 5, 23: 5, 24: 5, 25: 5, 26: 5 },
    }
    expect(calculerScoreIntensite(reponses)).toBe(30)
  })

  it('Score 18 : 1+2+3+4+4+4 → 18', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      intensite: { 21: 1, 22: 2, 23: 3, 24: 4, 25: 4, 26: 4 },
    }
    expect(calculerScoreIntensite(reponses)).toBe(18)
  })

  it('Réponses incomplètes (5 sur 6) → erreur', () => {
    const reponses: Reponses = {
      ...baseReponses(),
      intensite: { 21: 3, 22: 3, 23: 3, 24: 3, 25: 3 } as Reponses['intensite'],
    }
    expect(() => calculerScoreIntensite(reponses)).toThrow(/incompl/i)
  })
})

describe('calculerIntensite — bornes des paliers', () => {
  it('Score 6 → surface (borne basse)', () => {
    expect(calculerIntensite(6)).toBe('surface')
  })
  it('Score 13 → surface (borne haute)', () => {
    expect(calculerIntensite(13)).toBe('surface')
  })
  it('Score 14 → modere (borne basse)', () => {
    expect(calculerIntensite(14)).toBe('modere')
  })
  it('Score 22 → modere (borne haute)', () => {
    expect(calculerIntensite(22)).toBe('modere')
  })
  it('Score 23 → profond (borne basse)', () => {
    expect(calculerIntensite(23)).toBe('profond')
  })
  it('Score 30 → profond (borne haute)', () => {
    expect(calculerIntensite(30)).toBe('profond')
  })

  it('Score < 6 ou > 30 → erreur', () => {
    expect(() => calculerIntensite(5)).toThrow(/intervalle/i)
    expect(() => calculerIntensite(31)).toThrow(/intervalle/i)
  })
})
