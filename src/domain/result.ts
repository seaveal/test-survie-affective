// Composition du résultat final + helpers de sélection (pont domain ↔ data).
// Référence : docs/CAHIER_DES_CHARGES_TDD.md §4.4.3
import { profils } from '../data/profils'
import { roadmaps } from '../data/roadmaps'
import { calculerIntensite, calculerScoreIntensite } from './intensity'
import {
  calculerProfilDominant,
  calculerProfilSecondaire,
  calculerScoreProfils,
} from './scoring'
import type {
  IntensiteId,
  Profil,
  ProfilId,
  QuestionTypage,
  Reponses,
  Resultat,
  Roadmap,
} from './types'

/**
 * Compose le résultat complet du test à partir des réponses et des questions
 * de typage. Pure : ne mute pas l'entrée.
 *
 * @throws si le typage est incomplet ou contient une option inexistante
 *         (erreur propagée depuis scoring), ou si l'intensité est incomplète.
 */
export function composerResultat(
  reponses: Reponses,
  questionsTypage: QuestionTypage[],
): Resultat {
  const scoreProfils = calculerScoreProfils(reponses, questionsTypage)
  const profilDominant = calculerProfilDominant(reponses, questionsTypage)
  const profilSecondaire = calculerProfilSecondaire(reponses, questionsTypage)

  const scoreIntensite = calculerScoreIntensite(reponses)
  const intensite = calculerIntensite(scoreIntensite)

  return {
    profilDominant,
    profilSecondaire,
    scoreProfils,
    intensite,
    scoreIntensite,
    statutLivre: reponses.contexte.statutLivre,
    situation: reponses.contexte.situation,
    etatEmotionnel: reponses.contexte.etatEmotionnel,
    pretAAgir: reponses.contexte.pretAAgir,
  }
}

/**
 * Récupère le profil correspondant à un ProfilId.
 * @throws si le profil n'existe pas dans les data.
 */
export function getProfil(profilId: ProfilId): Profil {
  const p = profils.find((p) => p.id === profilId)
  if (!p) {
    throw new Error(`Profil '${profilId}' introuvable dans src/data/profils.ts`)
  }
  return p
}

/**
 * Récupère la roadmap correspondant au couple (profilId, intensite).
 * @throws si le couple n'existe pas dans les data.
 */
export function getRoadmap(profilId: ProfilId, intensite: IntensiteId): Roadmap {
  const r = roadmaps.find((r) => r.profilId === profilId && r.intensite === intensite)
  if (!r) {
    throw new Error(
      `Roadmap '${profilId}' × '${intensite}' introuvable dans src/data/roadmaps.ts`,
    )
  }
  return r
}
