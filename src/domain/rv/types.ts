// Types du bilan RETROUVEZ-VOUS (second test, purement additif).
// Référence : vault 10-PRO/13-PHM/Marketing/Retrouvez-vous/SPEC-technique.md §1 et §2.

/** Les cinq dimensions, dans l'ordre de la SPEC : cet ordre tranche les ex æquo. */
export const DIMENSIONS_RV = ['realite', 'attachement', 'securite', 'autonomie', 'identite'] as const

export type DimensionRv = (typeof DIMENSIONS_RV)[number]

/** 0 Jamais à 4 Presque toujours. `null` : « Je préfère ne pas répondre » (jamais un zéro). */
export type ReponseRv = 0 | 1 | 2 | 3 | 4 | null

/** Q01 à Q25. Clé absente : question pas encore posée. */
export type ReponsesRv = Record<string, ReponseRv>

export type SituationRv = 'en_relation' | 'separe_recent' | 'separe_ancien'

export type PretAAgirRv = 'maintenant' | 'bientot' | 'comprendre_dabord' | 'incertain'

export type NiveauRv = 'ressources' | 'fragilites' | 'difficultes' | 'tres_presentes'

/** Score de 0 à 20, `null` sous quatre réponses (« résultat incomplet »). */
export type ScoresRv = Record<DimensionRv, number | null>

export interface ResultatRv {
  scores: ScoresRv
  priorite: DimensionRv | 'incomplet'
  priorite_2: DimensionRv | null
}
