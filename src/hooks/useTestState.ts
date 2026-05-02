import { useCallback, useMemo, useState } from 'react'
import { questions, questionsTypage } from '../data/questions'
import { composerResultat } from '../domain/result'
import type {
  EtatEmotionnel,
  PretAAgir,
  Question,
  Reponses,
  Resultat,
  SituationActuelle,
  StatutLivre,
} from '../domain/types'

export type Etape = 'welcome' | 'questions' | 'resultat'

interface UseTestState {
  etape: Etape
  indexCourant: number
  questionCourante: Question
  reponses: Reponses
  resultat: Resultat | null
  commencer: () => void
  retour: () => void
  recommencer: () => void
  repondreTypage: (optionId: string) => void
  repondreIntensite: (valeur: 1 | 2 | 3 | 4 | 5) => void
  repondreContexte: (valeur: string) => void
}

const reponsesVides: Reponses = {
  typage: {},
  intensite: {},
  contexte: {
    statutLivre: 'pas_lu',
    situation: 'celibat_long',
    etatEmotionnel: 'fonctionnel',
    pretAAgir: 'incertain',
  },
}

const ORDRE_CHAMP_CONTEXTE: Array<keyof Reponses['contexte']> = [
  'statutLivre',
  'situation',
  'etatEmotionnel',
  'pretAAgir',
]

export function useTestState(): UseTestState {
  const [etape, setEtape] = useState<Etape>('welcome')
  const [indexCourant, setIndexCourant] = useState(0)
  const [reponses, setReponses] = useState<Reponses>(() => ({
    ...reponsesVides,
    typage: {},
    intensite: {},
    contexte: { ...reponsesVides.contexte },
  }))
  const [resultat, setResultat] = useState<Resultat | null>(null)

  const questionCourante = questions[indexCourant]

  const commencer = useCallback(() => {
    setEtape('questions')
    setIndexCourant(0)
  }, [])

  const recommencer = useCallback(() => {
    setEtape('welcome')
    setIndexCourant(0)
    setResultat(null)
    setReponses({
      typage: {},
      intensite: {},
      contexte: { ...reponsesVides.contexte },
    })
  }, [])

  const retour = useCallback(() => {
    setIndexCourant((i) => Math.max(0, i - 1))
  }, [])

  const finaliser = useCallback((nouvellesReponses: Reponses) => {
    const r = composerResultat(nouvellesReponses, questionsTypage)
    setResultat(r)
    setEtape('resultat')
  }, [])

  const avancerOuFinaliser = useCallback(
    (nouvelles: Reponses) => {
      const next = indexCourant + 1
      if (next >= questions.length) {
        finaliser(nouvelles)
      } else {
        setIndexCourant(next)
      }
    },
    [indexCourant, finaliser],
  )

  const repondreTypage = useCallback(
    (optionId: string) => {
      const q = questions[indexCourant]
      if (q.type !== 'typage') return
      const nouvelles: Reponses = {
        ...reponses,
        typage: { ...reponses.typage, [q.id]: optionId },
      }
      setReponses(nouvelles)
      avancerOuFinaliser(nouvelles)
    },
    [reponses, indexCourant, avancerOuFinaliser],
  )

  const repondreIntensite = useCallback(
    (valeur: 1 | 2 | 3 | 4 | 5) => {
      const q = questions[indexCourant]
      if (q.type !== 'intensite') return
      const nouvelles: Reponses = {
        ...reponses,
        intensite: { ...reponses.intensite, [q.id]: valeur },
      }
      setReponses(nouvelles)
      avancerOuFinaliser(nouvelles)
    },
    [reponses, indexCourant, avancerOuFinaliser],
  )

  const repondreContexte = useCallback(
    (valeur: string) => {
      const q = questions[indexCourant]
      if (q.type !== 'contexte') return
      const champ = q.champCible as keyof Reponses['contexte']
      // Sécurité : on ne sait pas typer dynamiquement, mais les valeurs sémantiques
      // viennent des options qui sont elles-mêmes typées dans les données.
      const nouvelles: Reponses = {
        ...reponses,
        contexte: { ...reponses.contexte, [champ]: valeur as StatutLivre & SituationActuelle & EtatEmotionnel & PretAAgir },
      }
      setReponses(nouvelles)
      avancerOuFinaliser(nouvelles)
    },
    [reponses, indexCourant, avancerOuFinaliser],
  )

  // Évite que ORDRE_CHAMP_CONTEXTE soit purgé par un linter (utile aux dérivés futurs).
  void ORDRE_CHAMP_CONTEXTE

  return useMemo(
    () => ({
      etape,
      indexCourant,
      questionCourante,
      reponses,
      resultat,
      commencer,
      retour,
      recommencer,
      repondreTypage,
      repondreIntensite,
      repondreContexte,
    }),
    [
      etape,
      indexCourant,
      questionCourante,
      reponses,
      resultat,
      commencer,
      retour,
      recommencer,
      repondreTypage,
      repondreIntensite,
      repondreContexte,
    ],
  )
}
