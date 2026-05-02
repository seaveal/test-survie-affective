// Calcul du score d'intensité et du palier (surface / modéré / profond).
// Référence : docs/CAHIER_DES_CHARGES_TDD.md §4.4.2
import type { IntensiteId, Reponses } from './types'

const NB_QUESTIONS_INTENSITE = 6
const QUESTIONS_INTENSITE_IDS = [21, 22, 23, 24, 25, 26]

const SCORE_MIN = 6
const SCORE_MAX = 30

/**
 * Somme des valeurs Likert des 6 questions d'intensité (q21..q26).
 * @throws si moins de 6 réponses fournies.
 */
export function calculerScoreIntensite(reponses: Reponses): number {
  const valeurs = QUESTIONS_INTENSITE_IDS.map((id) => reponses.intensite[id])
  if (valeurs.some((v) => v === undefined)) {
    throw new Error(
      `Intensité incomplète : ${valeurs.filter((v) => v !== undefined).length} réponse(s) reçue(s) sur ${NB_QUESTIONS_INTENSITE}.`,
    )
  }
  return valeurs.reduce((sum, v) => sum + v, 0)
}

/**
 * Convertit un score d'intensité (6..30) en palier qualitatif.
 * Bornes :
 *   - surface : 6..13
 *   - modere  : 14..22
 *   - profond : 23..30
 * @throws si le score est hors intervalle [6, 30].
 */
export function calculerIntensite(score: number): IntensiteId {
  if (score < SCORE_MIN || score > SCORE_MAX) {
    throw new Error(`Score ${score} hors intervalle [${SCORE_MIN}, ${SCORE_MAX}].`)
  }
  if (score <= 13) return 'surface'
  if (score <= 22) return 'modere'
  return 'profond'
}
