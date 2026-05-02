// Calcul du score de profils, du profil dominant et du profil secondaire.
// Référence : docs/CAHIER_DES_CHARGES_TDD.md §4.4
import type {
  ProfilId,
  QuestionTypage,
  Reponses,
  ScoreProfils,
} from './types'
import {
  ORDRE_PRIORITE_PROFILS,
  QUESTIONS_DISCRIMINANTES,
  SEUIL_PROFIL_SECONDAIRE,
} from './types'

const POINTS_PAR_REPONSE = 3
const NB_QUESTIONS_TYPAGE = 20

/**
 * Calcule le score brut par profil à partir des réponses de typage.
 * Pure : ne mute pas l'entrée, mêmes entrées → mêmes sorties.
 *
 * @throws si le nombre de réponses n'est pas exactement 20 (typage incomplet),
 *         ou si une réponse référence une option inexistante dans la question
 *         correspondante.
 */
export function calculerScoreProfils(
  reponses: Reponses,
  questions: QuestionTypage[],
): ScoreProfils {
  const reponsesIds = Object.keys(reponses.typage)
  if (reponsesIds.length !== NB_QUESTIONS_TYPAGE) {
    throw new Error(
      `Typage incomplet : ${reponsesIds.length} réponse(s) reçue(s), ${NB_QUESTIONS_TYPAGE} attendues.`,
    )
  }

  const score: ScoreProfils = { mendiant: 0, sauveur: 0, controleur: 0, fantome: 0 }

  const questionsParId = new Map<number, QuestionTypage>(questions.map((q) => [q.id, q]))

  for (const [qIdStr, optionId] of Object.entries(reponses.typage)) {
    const qId = Number(qIdStr)
    const question = questionsParId.get(qId)
    if (!question) {
      throw new Error(`Question typage ${qId} non trouvée dans la liste fournie.`)
    }
    const option = question.options.find((o) => o.id === optionId)
    if (!option) {
      throw new Error(
        `Option inexistante : '${optionId}' n'existe pas pour la question ${qId}.`,
      )
    }
    score[option.profil] += POINTS_PAR_REPONSE
  }

  return score
}

/**
 * Détermine le profil dominant à partir des réponses.
 * En cas d'égalité de score, on tranche d'abord avec les questions discriminantes
 * (1, 4, 11, 19), puis avec l'ordre prédéfini Fantôme > Contrôleur > Sauveur > Mendiant.
 */
export function calculerProfilDominant(
  reponses: Reponses,
  questions: QuestionTypage[],
): ProfilId {
  const score = calculerScoreProfils(reponses, questions)
  const maxScore = Math.max(...Object.values(score))
  const candidats = (Object.keys(score) as ProfilId[]).filter((p) => score[p] === maxScore)

  if (candidats.length === 1) {
    return candidats[0]
  }

  // Tie-breaker 1 : score sur questions discriminantes
  const scoreDiscriminant = scoreSurDiscriminantes(reponses, questions)
  const maxDiscriminant = Math.max(
    ...candidats.map((p) => scoreDiscriminant[p] ?? 0),
  )
  const finalistes = candidats.filter(
    (p) => (scoreDiscriminant[p] ?? 0) === maxDiscriminant,
  )

  if (finalistes.length === 1) {
    return finalistes[0]
  }

  // Tie-breaker 2 : ordre prédéfini
  for (const profil of ORDRE_PRIORITE_PROFILS) {
    if (finalistes.includes(profil)) {
      return profil
    }
  }

  // Sécurité : ne devrait jamais arriver vu que ORDRE_PRIORITE_PROFILS couvre tous les profils.
  return finalistes[0]
}

/**
 * Retourne le profil secondaire si l'écart strict avec le dominant est < SEUIL_PROFIL_SECONDAIRE,
 * sinon null.
 */
export function calculerProfilSecondaire(
  reponses: Reponses,
  questions: QuestionTypage[],
): ProfilId | null {
  const score = calculerScoreProfils(reponses, questions)
  const dominant = calculerProfilDominant(reponses, questions)
  const scoreDominant = score[dominant]

  let meilleurSecond: { profil: ProfilId; score: number } | null = null
  for (const p of Object.keys(score) as ProfilId[]) {
    if (p === dominant) continue
    if (meilleurSecond === null || score[p] > meilleurSecond.score) {
      meilleurSecond = { profil: p, score: score[p] }
    }
  }
  if (meilleurSecond === null) return null

  const ecart = scoreDominant - meilleurSecond.score
  return ecart < SEUIL_PROFIL_SECONDAIRE ? meilleurSecond.profil : null
}

/**
 * Score par profil restreint aux questions discriminantes.
 * Helper interne, pas exporté hors du domaine.
 */
function scoreSurDiscriminantes(
  reponses: Reponses,
  questions: QuestionTypage[],
): ScoreProfils {
  const score: ScoreProfils = { mendiant: 0, sauveur: 0, controleur: 0, fantome: 0 }
  const questionsParId = new Map<number, QuestionTypage>(questions.map((q) => [q.id, q]))
  for (const qId of QUESTIONS_DISCRIMINANTES) {
    const optionId = reponses.typage[qId]
    if (!optionId) continue
    const question = questionsParId.get(qId)
    if (!question) continue
    const option = question.options.find((o) => o.id === optionId)
    if (!option) continue
    score[option.profil] += 1
  }
  return score
}
