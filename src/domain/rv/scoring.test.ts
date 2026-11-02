import { describe, expect, it } from 'vitest'
import { composerResultatRv, niveau, questionsDe, scoreDimension } from './scoring'
import { DIMENSIONS_RV, type DimensionRv, type ReponseRv, type ReponsesRv } from './types'

/** Réponses d'une dimension, dans l'ordre de ses cinq questions (undefined : clé absente). */
function dim(d: DimensionRv, valeurs: (ReponseRv | undefined)[]): ReponsesRv {
  const out: ReponsesRv = {}
  questionsDe(d).forEach((id, i) => {
    if (valeurs[i] !== undefined) out[id] = valeurs[i] as ReponseRv
  })
  return out
}

/** Même valeur sur les cinq questions de chaque dimension donnée. */
function partout(v: Partial<Record<DimensionRv, ReponseRv[]>>): ReponsesRv {
  return Object.assign({}, ...Object.entries(v).map(([d, vals]) => dim(d as DimensionRv, vals)))
}

describe('questionsDe', () => {
  it('cinq questions par dimension, Q01 à Q25 dans l’ordre', () => {
    expect(questionsDe('realite')).toEqual(['Q01', 'Q02', 'Q03', 'Q04', 'Q05'])
    expect(questionsDe('identite')).toEqual(['Q21', 'Q22', 'Q23', 'Q24', 'Q25'])
    expect(DIMENSIONS_RV.flatMap(questionsDe)).toHaveLength(25)
  })
})

describe('scoreDimension', () => {
  it('cinq réponses : la somme', () => {
    expect(scoreDimension(dim('realite', [0, 0, 0, 0, 0]), 'realite')).toBe(0)
    expect(scoreDimension(dim('realite', [4, 4, 4, 4, 4]), 'realite')).toBe(20)
    expect(scoreDimension(dim('attachement', [1, 2, 3, 4, 0]), 'attachement')).toBe(10)
  })

  it('quatre réponses (une « je préfère ne pas répondre ») : moyenne × 5 arrondie', () => {
    // 3+3+3+3 = 12 → 15
    expect(scoreDimension(dim('securite', [3, 3, null, 3, 3]), 'securite')).toBe(15)
    // 1+0+0+0 = 1 → 1,25 → 1
    expect(scoreDimension(dim('securite', [1, 0, 0, 0, null]), 'securite')).toBe(1)
    // 3+0+0+0 = 3 → 3,75 → 4
    expect(scoreDimension(dim('securite', [3, 0, 0, 0, null]), 'securite')).toBe(4)
  })

  it('quatre réponses : 0,5 arrondi vers le haut', () => {
    // 2+0+0+0 = 2 → 2,5 → 3, et 4+4+4+2 = 14 → 17,5 → 18
    expect(scoreDimension(dim('autonomie', [2, 0, 0, 0, null]), 'autonomie')).toBe(3)
    expect(scoreDimension(dim('autonomie', [4, 4, 4, 2, null]), 'autonomie')).toBe(18)
  })

  it('quatre réponses : une clé absente compte comme une réponse manquante', () => {
    expect(scoreDimension(dim('identite', [4, 4, 4, 4, undefined]), 'identite')).toBe(20)
  })

  it('trois réponses ou moins : null, jamais un zéro', () => {
    expect(scoreDimension(dim('realite', [4, 4, 4, null, null]), 'realite')).toBeNull()
    expect(scoreDimension(dim('realite', [null, null, null, null, null]), 'realite')).toBeNull()
    expect(scoreDimension({}, 'realite')).toBeNull()
  })

  it('ne lit que les questions de sa dimension', () => {
    expect(scoreDimension(dim('attachement', [4, 4, 4, 4, 4]), 'realite')).toBeNull()
  })
})

describe('niveau', () => {
  it.each([
    [0, 'ressources'],
    [5, 'ressources'],
    [6, 'fragilites'],
    [10, 'fragilites'],
    [11, 'difficultes'],
    [15, 'difficultes'],
    [16, 'tres_presentes'],
    [20, 'tres_presentes'],
  ] as const)('%i → %s', (score, attendu) => {
    expect(niveau(score)).toBe(attendu)
  })
})

describe('composerResultatRv', () => {
  it('priorité 1 : le score le plus haut, priorité 2 absente au-delà de deux points', () => {
    const r = composerResultatRv(
      partout({
        realite: [1, 1, 1, 1, 1], // 5
        attachement: [4, 4, 4, 4, 4], // 20
        securite: [3, 3, 3, 3, 3], // 15
        autonomie: [0, 0, 0, 0, 0], // 0
        identite: [2, 2, 2, 2, 2], // 10
      }),
    )
    expect(r).toEqual({
      scores: { realite: 5, attachement: 20, securite: 15, autonomie: 0, identite: 10 },
      priorite: 'attachement',
      priorite_2: null,
    })
  })

  it('priorité 2 : la suivante à deux points ou moins (écart 2 compris)', () => {
    const r = composerResultatRv(
      partout({
        realite: [3, 3, 3, 3, 2], // 14
        attachement: [4, 4, 4, 4, 0], // 16
        securite: [1, 1, 1, 1, 1],
        autonomie: [1, 1, 1, 1, 1],
        identite: [1, 1, 1, 1, 1],
      }),
    )
    expect(r.priorite).toBe('attachement')
    expect(r.priorite_2).toBe('realite')
  })

  it('écart de trois points : pas de priorité 2', () => {
    const r = composerResultatRv(partout({ securite: [4, 4, 4, 4, 1], identite: [4, 4, 4, 2, 0] })) // 17 et 14
    expect(r.priorite).toBe('securite')
    expect(r.priorite_2).toBeNull()
  })

  it('ex æquo : l’ordre realite, attachement, securite, autonomie, identite tranche', () => {
    const egal = [3, 3, 3, 3, 3] as ReponseRv[]
    expect(composerResultatRv(partout({ identite: egal, autonomie: egal }))).toMatchObject({
      priorite: 'autonomie',
      priorite_2: 'identite',
    })
    const tous = composerResultatRv(
      partout({ realite: egal, attachement: egal, securite: egal, autonomie: egal, identite: egal }),
    )
    expect(tous).toMatchObject({ priorite: 'realite', priorite_2: 'attachement' })
  })

  it('les dimensions incomplètes sont ignorées et restent null', () => {
    const r = composerResultatRv(
      partout({ realite: [4, 4, 4, null, null], attachement: [1, 1, 1, 1, null], securite: [0, 0, 0, 0, 0] }),
    )
    expect(r.scores).toEqual({ realite: null, attachement: 5, securite: 0, autonomie: null, identite: null })
    expect(r.priorite).toBe('attachement')
    expect(r.priorite_2).toBeNull()
  })

  it('une seule dimension avec un score : pas de priorité 2', () => {
    const r = composerResultatRv(partout({ identite: [2, 2, 2, 2, 2] }))
    expect(r).toMatchObject({ priorite: 'identite', priorite_2: null })
  })

  it('aucun score : incomplet, sans priorité 2', () => {
    const nsp = [null, null, null, null, null] as ReponseRv[]
    expect(composerResultatRv(partout({ realite: nsp, attachement: nsp, securite: nsp, autonomie: nsp, identite: nsp }))).toEqual({
      scores: { realite: null, attachement: null, securite: null, autonomie: null, identite: null },
      priorite: 'incomplet',
      priorite_2: null,
    })
    expect(composerResultatRv({}).priorite).toBe('incomplet')
  })

  it('tout à zéro : les scores existent, la première dimension est la priorité', () => {
    const zero = [0, 0, 0, 0, 0] as ReponseRv[]
    expect(composerResultatRv(partout({ realite: zero, attachement: zero, securite: zero, autonomie: zero, identite: zero }))).toMatchObject({
      priorite: 'realite',
      priorite_2: 'attachement',
    })
  })
})
