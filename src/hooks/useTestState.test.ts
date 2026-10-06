import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTestState } from './useTestState'

describe('useTestState — Phase 7', () => {
  it("commence sur l'écran 'welcome' avec aucun index courant", () => {
    const { result } = renderHook(() => useTestState())
    expect(result.current.etape).toBe('welcome')
    expect(result.current.indexCourant).toBe(0)
  })

  it("commencer() passe en 'questions' et indexCourant = 0", () => {
    const { result } = renderHook(() => useTestState())
    act(() => result.current.commencer())
    expect(result.current.etape).toBe('questions')
    expect(result.current.indexCourant).toBe(0)
    expect(result.current.questionCourante.id).toBe(1)
  })

  it('repondreTypage avance à la question suivante', () => {
    const { result } = renderHook(() => useTestState())
    act(() => result.current.commencer())
    act(() => result.current.repondreTypage('A'))
    expect(result.current.indexCourant).toBe(1)
    expect(result.current.questionCourante.id).toBe(2)
    expect(result.current.reponses.typage[1]).toBe('A')
  })

  it('repondreIntensite + repondreContexte avancent aussi', () => {
    const { result } = renderHook(() => useTestState())
    act(() => result.current.commencer())
    // saute aux questions d'intensité
    for (let i = 0; i < 20; i++) act(() => result.current.repondreTypage('A'))
    expect(result.current.questionCourante.id).toBe(21)
    act(() => result.current.repondreIntensite(3))
    expect(result.current.questionCourante.id).toBe(22)
    expect(result.current.reponses.intensite[21]).toBe(3)

    // avance jusqu'à la question contexte 27
    for (let i = 0; i < 5; i++) act(() => result.current.repondreIntensite(3))
    expect(result.current.questionCourante.id).toBe(27)
    act(() => result.current.repondreContexte('lu_complet'))
    expect(result.current.reponses.contexte.statutLivre).toBe('lu_complet')
  })

  it('livraison 2 : l’écran de l’email arrive après la 3e réponse, pas avant (le reste : tests/e2e.test.tsx)', () => {
    const { result } = renderHook(() => useTestState())
    act(() => result.current.commencer())
    act(() => result.current.repondreTypage('A'))
    act(() => result.current.repondreTypage('A'))
    expect(result.current.etape).toBe('questions')
    act(() => result.current.repondreTypage('A'))
    expect(result.current.etape).toBe('capture')
    expect(result.current.indexCourant).toBe(3)
    expect(result.current.resultat).toBeNull()
  })

  it("retour() revient à la question précédente", () => {
    const { result } = renderHook(() => useTestState())
    act(() => result.current.commencer())
    act(() => result.current.repondreTypage('A'))
    act(() => result.current.repondreTypage('B'))
    expect(result.current.indexCourant).toBe(2)
    act(() => result.current.retour())
    expect(result.current.indexCourant).toBe(1)
    // La réponse à Q2 reste en mémoire (modifiable)
    expect(result.current.reponses.typage[2]).toBe('B')
  })

  it('retour() sur la 1ère question est un no-op (reste à 0)', () => {
    const { result } = renderHook(() => useTestState())
    act(() => result.current.commencer())
    act(() => result.current.retour())
    expect(result.current.indexCourant).toBe(0)
  })

  it("recommencer() reset tout", () => {
    const { result } = renderHook(() => useTestState())
    act(() => result.current.commencer())
    act(() => result.current.repondreTypage('A'))
    act(() => result.current.recommencer())
    expect(result.current.etape).toBe('welcome')
    expect(result.current.indexCourant).toBe(0)
    expect(Object.keys(result.current.reponses.typage)).toHaveLength(0)
  })
})
