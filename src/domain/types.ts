// Types du domaine — App Test de Survie Affective H3C
// Référence : docs/CAHIER_DES_CHARGES_TDD.md §4.2

export type ProfilId = 'mendiant' | 'sauveur' | 'controleur' | 'fantome'

export type IntensiteId = 'surface' | 'modere' | 'profond'

export type StatutLivre = 'lu_complet' | 'lu_partiel' | 'pas_lu'

export type SituationActuelle =
  | 'couple_stable'
  | 'couple_difficile'
  | 'rupture_recente'
  | 'celibat_long'

export type EtatEmotionnel =
  | 'fonctionnel'
  | 'tendu'
  | 'crise'
  | 'reconstruction'

export type PretAAgir = 'maintenant' | 'bientot' | 'comprendre_dabord' | 'incertain'

// QUESTIONS

export type TypeQuestion = 'typage' | 'intensite' | 'contexte'

export interface OptionTypage {
  id: string // 'A' | 'B' | 'C' | 'D'
  texte: string
  profil: ProfilId
}

export interface OptionLikert {
  valeur: 1 | 2 | 3 | 4 | 5
  texte: string
}

export interface OptionContexte {
  id: string
  texte: string
  valeur: string // valeur sémantique (ex: 'lu_complet')
}

export interface QuestionTypage {
  id: number // 1 à 20
  type: 'typage'
  enonce: string
  options: OptionTypage[] // exactement 4 options, une par profil
}

export interface QuestionIntensite {
  id: number // 21 à 26
  type: 'intensite'
  enonce: string
  options: OptionLikert[] // exactement 5 options sur échelle 1-5
}

export interface QuestionContexte {
  id: number // 27 à 30
  type: 'contexte'
  enonce: string
  options: OptionContexte[]
  champCible: 'statutLivre' | 'situation' | 'etatEmotionnel' | 'pretAAgir'
}

export type Question = QuestionTypage | QuestionIntensite | QuestionContexte

// RÉPONSES

export interface Reponses {
  typage: Record<number, string> // q.id -> option.id
  intensite: Record<number, 1 | 2 | 3 | 4 | 5> // q.id -> valeur
  contexte: {
    statutLivre: StatutLivre
    situation: SituationActuelle
    etatEmotionnel: EtatEmotionnel
    pretAAgir: PretAAgir
  }
}

// SCORE ET RÉSULTAT

export interface ScoreProfils {
  mendiant: number
  sauveur: number
  controleur: number
  fantome: number
}

export interface Resultat {
  profilDominant: ProfilId
  profilSecondaire: ProfilId | null
  scoreProfils: ScoreProfils
  intensite: IntensiteId
  scoreIntensite: number // 6 à 30
  statutLivre: StatutLivre
  situation: SituationActuelle
  etatEmotionnel: EtatEmotionnel
  pretAAgir: PretAAgir
}

// PROFILS ET ROADMAPS (data layer)

export interface Profil {
  id: ProfilId
  nom: string
  icone: string
  ambassadeur: string
  descriptionBase: string
  septSymptomes: string[]
  modulateursIntensite: {
    surface: string
    modere: string
    profond: string
  }
}

export interface Roadmap {
  profilId: ProfilId
  intensite: IntensiteId
  pasNumeroUn: string
  pasNumeroDeux: string
  pasNumeroTrois: string
  chapitresLivreCibles: number[] // pour les lecteurs
  exerciceCorporel: string
}

// CTA composés dynamiquement selon statutLivre (cf. docs/PROFILS_RESULTATS_TEXTES.md §CTA)

export interface CtaLien {
  texte: string
  url: string
}

export interface CtaParStatut {
  amorce: string // bloc d'amorce (texte introductif au-dessus des CTA)
  ctaPrincipal: CtaLien
  ctaSecondaire: CtaLien
}

// CONSTANTES

export const ORDRE_PRIORITE_PROFILS: ProfilId[] = [
  'fantome',
  'controleur',
  'sauveur',
  'mendiant',
]

export const QUESTIONS_DISCRIMINANTES: number[] = [1, 4, 11, 19]

export const SEUIL_PROFIL_SECONDAIRE = 4 // écart strict < 4 → secondaire affiché
