// Scoring du bilan RETROUVEZ-VOUS, SPEC §2 à la lettre (le même calcul vit en Python
// côté API, rv_scoring.py : toute différence entre les deux est un défaut).
import { DIMENSIONS_RV, type DimensionRv, type NiveauRv, type ReponsesRv, type ResultatRv, type ScoresRv } from './types'

/** Identifiants des cinq questions d'une dimension : Q01 à Q05 pour la première, et ainsi de suite. */
export function questionsDe(d: DimensionRv): string[] {
  const debut = DIMENSIONS_RV.indexOf(d) * 5
  return [1, 2, 3, 4, 5].map((k) => `Q${String(debut + k).padStart(2, '0')}`)
}

/**
 * Cinq réponses : la somme (0 à 20). Quatre : la moyenne × 5, arrondie, 0,5 vers le haut.
 * Trois ou moins : `null`. « Je préfère ne pas répondre » (`null`) ne compte pas.
 */
export function scoreDimension(reponses: ReponsesRv, d: DimensionRv): number | null {
  const donnees = questionsDe(d)
    .map((id) => reponses[id])
    .filter((v): v is 0 | 1 | 2 | 3 | 4 => typeof v === 'number')
  if (donnees.length < 4) return null
  const somme = donnees.reduce<number>((a, v) => a + v, 0)
  // somme × 5 / 4 est exact en virgule flottante (quarts) : Math.round tranche 0,5 vers le haut.
  return donnees.length === 5 ? somme : Math.round((somme * 5) / 4)
}

export function niveau(score: number): NiveauRv {
  if (score <= 5) return 'ressources'
  if (score <= 10) return 'fragilites'
  if (score <= 15) return 'difficultes'
  return 'tres_presentes'
}

/**
 * Priorité 1 : le score non nul (non `null`) le plus haut, ex æquo tranché par l'ordre
 * des dimensions. Priorité 2 : la suivante si elle est à deux points ou moins.
 * Aucun score : `incomplet`. Aucun score global, jamais.
 */
export function composerResultatRv(reponses: ReponsesRv): ResultatRv {
  const scores = Object.fromEntries(DIMENSIONS_RV.map((d) => [d, scoreDimension(reponses, d)])) as ScoresRv
  const note = (d: DimensionRv) => scores[d] as number
  // Tri stable (ES2019) : à score égal, l'ordre de DIMENSIONS_RV est gardé.
  const classees = DIMENSIONS_RV.filter((d) => scores[d] !== null).sort((a, b) => note(b) - note(a))
  const [p1, p2] = classees
  if (p1 === undefined) return { scores, priorite: 'incomplet', priorite_2: null }
  return { scores, priorite: p1, priorite_2: p2 !== undefined && note(p1) - note(p2) <= 2 ? p2 : null }
}
