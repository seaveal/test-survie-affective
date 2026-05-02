import { describe, expect, it } from 'vitest'
import {
  questions,
  questionsContexte,
  questionsIntensite,
  questionsTypage,
} from './questions'
import type { ProfilId } from '../domain/types'

describe('Données questions — structure et invariants', () => {
  it('30 questions au total (20 typage + 6 intensité + 4 contexte)', () => {
    expect(questions).toHaveLength(30)
    expect(questionsTypage).toHaveLength(20)
    expect(questionsIntensite).toHaveLength(6)
    expect(questionsContexte).toHaveLength(4)
  })

  it('IDs strictement séquentiels 1..30 sans doublon', () => {
    const ids = questions.map((q) => q.id)
    expect(ids).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
    expect(new Set(ids).size).toBe(30)
  })

  it('IDs typage = 1..20, intensité = 21..26, contexte = 27..30', () => {
    expect(questionsTypage.map((q) => q.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ])
    expect(questionsIntensite.map((q) => q.id)).toEqual([21, 22, 23, 24, 25, 26])
    expect(questionsContexte.map((q) => q.id)).toEqual([27, 28, 29, 30])
  })

  it('Énoncés non vides sur les 30 questions', () => {
    for (const q of questions) {
      expect(q.enonce, `Q${q.id}`).toBeTruthy()
      expect(q.enonce.length, `Q${q.id} énoncé trop court`).toBeGreaterThan(10)
    }
  })
})

describe('Questions de typage (1..20)', () => {
  it('Chaque question a exactement 4 options', () => {
    for (const q of questionsTypage) {
      expect(q.options, `Q${q.id}`).toHaveLength(4)
    }
  })

  it('IDs des options ∈ {A, B, C, D}, sans doublon par question', () => {
    for (const q of questionsTypage) {
      const ids = q.options.map((o) => o.id).sort()
      expect(ids, `Q${q.id}`).toEqual(['A', 'B', 'C', 'D'])
    }
  })

  it('Chaque question couvre les 4 profils sans doublon', () => {
    for (const q of questionsTypage) {
      const profils = q.options.map((o) => o.profil).sort()
      expect(profils, `Q${q.id}`).toEqual(
        ['controleur', 'fantome', 'mendiant', 'sauveur'],
      )
    }
  })

  it('Distribution globale : exactement 20 occurrences par profil', () => {
    const compteur: Record<ProfilId, number> = {
      mendiant: 0,
      sauveur: 0,
      controleur: 0,
      fantome: 0,
    }
    for (const q of questionsTypage) {
      for (const o of q.options) compteur[o.profil]++
    }
    expect(compteur).toEqual({ mendiant: 20, sauveur: 20, controleur: 20, fantome: 20 })
  })

  it('Textes des options non vides sur les 20 questions', () => {
    for (const q of questionsTypage) {
      for (const o of q.options) {
        expect(o.texte, `Q${q.id} option ${o.id}`).toBeTruthy()
        expect(o.texte.length, `Q${q.id} option ${o.id} trop courte`).toBeGreaterThan(5)
      }
    }
  })
})

describe("Questions d'intensité (21..26)", () => {
  it('Chaque question a exactement 5 options Likert', () => {
    for (const q of questionsIntensite) {
      expect(q.options, `Q${q.id}`).toHaveLength(5)
    }
  })

  it('Valeurs Likert = 1..5, sans doublon par question', () => {
    for (const q of questionsIntensite) {
      const valeurs = q.options.map((o) => o.valeur).sort()
      expect(valeurs, `Q${q.id}`).toEqual([1, 2, 3, 4, 5])
    }
  })

  it('Textes des options non vides', () => {
    for (const q of questionsIntensite) {
      for (const o of q.options) {
        expect(o.texte, `Q${q.id} valeur ${o.valeur}`).toBeTruthy()
      }
    }
  })
})

describe('Questions de contexte (27..30)', () => {
  it('champCible cohérent par question', () => {
    const map = Object.fromEntries(questionsContexte.map((q) => [q.id, q.champCible]))
    expect(map).toEqual({
      27: 'statutLivre',
      28: 'situation',
      29: 'etatEmotionnel',
      30: 'pretAAgir',
    })
  })

  it('Valeurs sémantiques cohérentes avec les types du domaine', () => {
    const valeursAttendues: Record<number, string[]> = {
      27: ['lu_complet', 'lu_partiel', 'pas_lu'],
      28: ['couple_stable', 'couple_difficile', 'rupture_recente', 'celibat_long'],
      29: ['fonctionnel', 'tendu', 'crise', 'reconstruction'],
      30: ['maintenant', 'bientot', 'comprendre_dabord', 'incertain'],
    }
    for (const q of questionsContexte) {
      const valeurs = q.options.map((o) => o.valeur).sort()
      expect(valeurs, `Q${q.id}`).toEqual([...valeursAttendues[q.id]].sort())
    }
  })

  it('Textes des options et IDs uniques par question', () => {
    for (const q of questionsContexte) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, `Q${q.id} IDs uniques`).toBe(ids.length)
      for (const o of q.options) {
        expect(o.texte, `Q${q.id} option ${o.id}`).toBeTruthy()
      }
    }
  })
})

describe('Compatibilité avec le scoring (Phase 1 TDD)', () => {
  it('Les 4 questions discriminantes (1, 4, 11, 19) couvrent bien les 4 profils', () => {
    const discriminantes = [1, 4, 11, 19]
    for (const id of discriminantes) {
      const q = questionsTypage.find((q) => q.id === id)
      expect(q, `Q${id} discriminante`).toBeDefined()
      const profils = new Set(q!.options.map((o) => o.profil))
      expect(profils.size).toBe(4)
    }
  })
})
