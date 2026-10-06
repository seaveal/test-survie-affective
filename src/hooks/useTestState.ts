import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { questions, questionsTypage } from '../data/questions'
import { composerResultat } from '../domain/result'
import type {
  PretAAgir,
  Question,
  Reponses,
  Resultat,
  SituationActuelle,
  StatutLivre,
} from '../domain/types'
import {
  buildPayload,
  demarrerTest,
  emettreEvenement,
  envoyerJalon,
  garderJetonReprise,
  lireJetonContact,
  lireJetonReprise,
  lireProgression,
  nouvelEventId,
  sauvegarderProgression,
  submitTestComplete,
  type CaptureValues,
  type Jalon,
  type TestCompleteResponse,
} from '../api/client'

// Livraison 2 (2026-10-06) : accueil → 3 réponses → email → 22 réponses → résultat.
// 'chargement' : jeton de reprise présent, GET /api/test-progression en cours.
export type Etape = 'chargement' | 'welcome' | 'questions' | 'capture' | 'resultat'

/** L'écran de l'email s'affiche après cette réponse (positions, pas numéros). */
export const REPONSES_AVANT_EMAIL = 3
/** Attente bornée de /api/test-debut avant de laisser le Test continuer. */
export const BORNE_DEBUT_MS = 2500

const MESSAGES_REFUS: Record<410 | 422, string> = {
  422: 'Votre adresse n’a pas pu être enregistrée. Vérifiez-la, cochez la case des emails, puis validez à nouveau.',
  410: 'Cette adresse a été supprimée de nos fichiers. Indiquez une autre adresse pour continuer.',
}

interface UseTestState {
  etape: Etape
  indexCourant: number
  questionCourante: Question
  reponses: Reponses
  resultat: Resultat | null
  envoiEnCours: boolean
  envoiReussi: boolean
  envoiRefuse: boolean
  erreurCapture: string | null
  apiResponse: TestCompleteResponse | null
  commencer: () => void
  retour: () => void
  recommencer: () => void
  repondreTypage: (optionId: string) => void
  repondreIntensite: (valeur: 1 | 2 | 3 | 4 | 5) => void
  repondreContexte: (valeur: string) => void
  soumettreCapture: (capture: CaptureValues) => Promise<void>
}

const reponsesVides: Reponses = {
  typage: {},
  intensite: {},
  contexte: {
    statutLivre: 'pas_lu',
    situation: 'celibat_long',
    pretAAgir: 'incertain',
  },
}

type Brut = Record<string, Record<string, unknown> | number>

/** Valeur de la question `q` dans un bloc {typage, intensite, contexte}. */
function valeurDe(r: Brut | Reponses, q: Question): unknown {
  const bloc = (r as Brut)[q.type]
  if (!bloc || typeof bloc !== 'object') return undefined
  return bloc[q.type === 'contexte' ? (q.champCible as string) : String(q.id)]
}

/**
 * Réponses des `n` premières questions au format de l'API ({typage, intensite,
 * contexte, v: 2}). Le contexte a des valeurs par défaut dans l'état local :
 * seules celles des questions déjà posées partent.
 */
function reponsesEnvoyees(r: Reponses, n: number): Brut {
  const out: Brut = { typage: {}, intensite: {}, contexte: {}, v: 2 }
  for (const q of questions.slice(0, n)) {
    const v = valeurDe(r, q)
    if (v !== undefined) (out[q.type] as Record<string, unknown>)[q.type === 'contexte' ? (q.champCible as string) : String(q.id)] = v
  }
  return out
}

/** Valeur admise par la question (option existante). */
function valeurValide(q: Question, v: unknown): boolean {
  if (q.type === 'typage') return q.options.some((o) => o.id === v)
  return (q.options as { valeur: unknown }[]).some((o) => o.valeur === v)
}

/**
 * Réponses rendues par le serveur, réduites aux questions en vigueur et aux
 * options existantes (question retirée ou inconnue, option disparue : ignorée,
 * la question est reposée), au format de l'API.
 */
function reponsesValides(brut: Brut): Brut {
  const out: Brut = { typage: {}, intensite: {}, contexte: {} }
  for (const q of questions) {
    const v = valeurDe(brut, q)
    if (valeurValide(q, v)) (out[q.type] as Record<string, unknown>)[q.type === 'contexte' ? (q.champCible as string) : String(q.id)] = v
  }
  return out
}

/** Réponses (déjà validées) fusionnées sur l'état vide. */
function reponsesRestaurees(brut: Brut): Reponses {
  const bloc = (k: string) => (brut[k] && typeof brut[k] === 'object' ? brut[k] : {}) as Record<string, never>
  return {
    typage: { ...bloc('typage') },
    intensite: { ...bloc('intensite') },
    contexte: { ...reponsesVides.contexte, ...bloc('contexte') },
  }
}

/** Première question sans réponse, dans l'ordre des questions. */
function premiereSansReponse(brut: Brut): number {
  const i = questions.findIndex((q) => valeurDe(brut, q) === undefined)
  // Tout répondu sans Test fini : on rouvre la dernière question.
  return i === -1 ? questions.length - 1 : i
}

export function useTestState(): UseTestState {
  // Lus une fois au chargement : jeton de cycle (tsa.reprise), jeton de contact (`?c=` du courriel).
  const [sources] = useState(() => ({ stocke: lireJetonReprise(), contact: lireJetonContact() }))
  const [etape, setEtape] = useState<Etape>(sources.stocke || sources.contact ? 'chargement' : 'welcome')
  const [indexCourant, setIndexCourant] = useState(0)
  const [reponses, setReponses] = useState<Reponses>(() => reponsesRestaurees({}))
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [envoiReussi, setEnvoiReussi] = useState(false)
  const [erreurCapture, setErreurCapture] = useState<string | null>(null)
  // Fin refusée par l'API (4xx définitif) : rien n'est gardé, l'écran le dit.
  const [envoiRefuse, setEnvoiRefuse] = useState(false)
  const [apiResponse, setApiResponse] = useState<TestCompleteResponse | null>(null)
  // Jeton servi par l'API pour CE Test (null tant que /api/test-debut n'a pas répondu).
  const jetonRef = useRef<string | null>(null)
  // Email et consentements en mémoire, pour le repli par l'ancien chemin.
  const captureRef = useRef<CaptureValues | null>(null)
  const eventIdRef = useRef<string | null>(null)
  const leadEmisRef = useRef(false)
  const emailDemandeRef = useRef(false)
  const jalonsRef = useRef(new Set<Jalon>())
  const repriseLancee = useRef(false)
  // Position la plus avancée atteinte : un retour en arrière ne retire rien au serveur.
  const maxAtteint = useRef(0)
  // Dernier état des réponses, pour la sauvegarde d'un jeton adopté tardivement.
  const reponsesRef = useRef<Reponses>(reponsesVides)
  // Sauvegarde sans rafale : une requête à la fois, la suivante part avec le dernier état.
  const file = useRef({ enVol: false, attente: null as Brut | null })

  const questionCourante = questions[indexCourant]

  const jalon = useCallback((j: Jalon) => {
    if (jalonsRef.current.has(j)) return
    jalonsRef.current.add(j)
    envoyerJalon(j)
  }, [])

  // Un seul `lead` par Test, avec l'event_id du corps de /api/test-debut.
  const emettreLead = useCallback(() => {
    if (leadEmisRef.current || !eventIdRef.current) return
    leadEmisRef.current = true
    emettreEvenement('lead', { event_id: eventIdRef.current })
  }, [])

  const sauvegarder = useCallback(async (etat: Brut) => {
    const f = file.current
    if (f.enVol) {
      f.attente = etat
      return
    }
    f.enVol = true
    for (let c: Brut | null = etat; c; c = f.attente, f.attente = null) {
      if (jetonRef.current) await sauvegarderProgression(jetonRef.current, c)
    }
    f.enVol = false
  }, [])

  const adopterJeton = useCallback(
    (jeton: string) => {
      jetonRef.current = jeton
      garderJetonReprise(jeton)
      emettreLead()
      // Jeton arrivé après la borne : les réponses données entre-temps partent tout de suite.
      if (maxAtteint.current > REPONSES_AVANT_EMAIL) void sauvegarder(reponsesEnvoyees(reponsesRef.current, maxAtteint.current))
    },
    [emettreLead, sauvegarder],
  )

  // Reprise : GET une seule fois au chargement (garde contre le double effet de StrictMode).
  useEffect(() => {
    const { stocke, contact } = sources
    if (!(stocke || contact) || repriseLancee.current) return
    repriseLancee.current = true
    void (async () => {
      let r = stocke ? await lireProgression({ jeton: stocke }) : null
      // tsa.reprise périmé (ou absent) : le lien du courriel prend le relais.
      if (r?.etat === 'oublier') garderJetonReprise(null)
      if ((!r || r.etat === 'oublier') && contact) r = await lireProgression({ c: contact })
      return r
    })().then((r) => {
      if (r?.etat === 'en-cours') {
        const brut = reponsesValides(r.reponses as Brut)
        jetonRef.current = r.jeton
        garderJetonReprise(r.jeton)
        emailDemandeRef.current = true
        reponsesRef.current = reponsesRestaurees(brut)
        setReponses(reponsesRef.current)
        maxAtteint.current = premiereSansReponse(brut)
        setIndexCourant(maxAtteint.current)
        setEtape('questions')
        return
      }
      // Terminé, 404 ou 410 : tsa.reprise déjà oublié. Erreur réseau (trois
      // essais) : tsa.reprise gardé pour un prochain chargement, comme le jeton
      // du lien que le bloc de suivi garde pour la session.
      setEtape('welcome')
    })
  }, [sources])

  useEffect(() => {
    if (etape === 'welcome') jalon('arrivee')
    if (etape === 'capture') jalon('email_affiche')
  }, [etape, jalon])

  const commencer = useCallback(() => {
    jalon('commencer')
    setEtape('questions')
    setIndexCourant(0)
  }, [jalon])

  const recommencer = useCallback(() => {
    setEtape('welcome')
    setIndexCourant(0)
    setResultat(null)
    setEnvoiEnCours(false)
    setEnvoiReussi(false)
    setApiResponse(null)
    setErreurCapture(null)
    setEnvoiRefuse(false)
    jetonRef.current = null
    captureRef.current = null
    eventIdRef.current = null
    leadEmisRef.current = false
    emailDemandeRef.current = false
    maxAtteint.current = 0
    reponsesRef.current = reponsesVides
    setReponses(reponsesVides)
  }, [])

  const retour = useCallback(() => {
    setIndexCourant((i) => Math.max(0, i - 1))
  }, [])

  /**
   * Fin du Test : résultat calculé par la page, affiché tout de suite, et
   * /api/test-complete en parallèle. Avec le jeton (chemin nominal), l'email
   * n'est pas nécessaire et aucun second Lead ne part. Sans jeton (repli),
   * ancien chemin avec l'email gardé en mémoire, et c'est ICI que part le Lead,
   * avec l'event_id déjà tiré à l'email.
   */
  const finaliser = useCallback(
    async (nouvelles: Reponses) => {
      const r = composerResultat(nouvelles, questionsTypage)
      setResultat(r)
      setEtape('resultat')
      emettreEvenement('test_termine', { profil: r.profilDominant })
      const jeton = jetonRef.current
      const capture = captureRef.current
      if (!jeton && !capture) return
      // v: 2 = Test à 25 questions (2026-10-06) : numéros 3, 9, 10, 20 et 29 absents.
      // Avec le jeton, l'email est déjà en base : on ne le renvoie pas (minimisation).
      const payload = buildPayload(jeton ? null : capture, r, {
        v: 2,
        typage: nouvelles.typage,
        intensite: nouvelles.intensite,
        contexte: nouvelles.contexte,
      })
      if (jeton) payload.jeton = jeton
      else if (eventIdRef.current) payload.event_id = eventIdRef.current
      setEnvoiEnCours(true)
      try {
        const res = await submitTestComplete(payload)
        if (res && 'refus' in res) {
          // Refus définitif : aucun lead pour une demande que le serveur a rejetée.
          setEnvoiRefuse(true)
          return
        }
        // Repli : le lead part ici (envoyé, ou gardé en file pour plus tard).
        if (!jeton) emettreLead()
        setApiResponse(res)
        setEnvoiReussi(res !== null)
        if (res !== null) garderJetonReprise(null)
      } finally {
        setEnvoiEnCours(false)
      }
    },
    [emettreLead],
  )

  const avancerOuFinaliser = useCallback(
    (nouvelles: Reponses) => {
      const next = indexCourant + 1
      if (next >= questions.length) {
        void finaliser(nouvelles)
        return
      }
      reponsesRef.current = nouvelles
      setIndexCourant(next)
      maxAtteint.current = Math.max(maxAtteint.current, next)
      if (next === REPONSES_AVANT_EMAIL && !emailDemandeRef.current) {
        setEtape('capture')
        return
      }
      // ponytail: pas de PUT à la dernière réponse, /api/test-complete porte tout.
      if (jetonRef.current) void sauvegarder(reponsesEnvoyees(nouvelles, maxAtteint.current))
    },
    [indexCourant, finaliser, sauvegarder],
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
      const nouvelles: Reponses = {
        ...reponses,
        contexte: {
          ...reponses.contexte,
          [champ]: valeur as StatutLivre & SituationActuelle & PretAAgir,
        },
      }
      setReponses(nouvelles)
      avancerOuFinaliser(nouvelles)
    },
    [reponses, indexCourant, avancerOuFinaliser],
  )


  /**
   * Écran de l'email (après la 3e réponse) : POST /api/test-debut, attente
   * bornée à BORNE_DEBUT_MS. Au-delà, le Test continue ; si le jeton arrive
   * plus tard, il est adopté (sauvegarde + Lead) comme s'il était arrivé à temps.
   */
  const soumettreCapture = useCallback(
    async (capture: CaptureValues) => {
      setErreurCapture(null)
      setEnvoiEnCours(true)
      eventIdRef.current = nouvelEventId()
      const appel = demarrerTest(
        capture,
        eventIdRef.current,
        reponsesEnvoyees(reponses, Math.max(REPONSES_AVANT_EMAIL, maxAtteint.current)),
        jetonRef.current ?? lireJetonReprise(),
      )
      const borne = new Promise<null>((ok) => setTimeout(() => ok(null), BORNE_DEBUT_MS))
      const r = await Promise.race([appel, borne])
      setEnvoiEnCours(false)
      if (r?.etat === 'refus') {
        // Pas de repli : l'adresse est refusée, on la redemande.
        eventIdRef.current = null
        setErreurCapture(MESSAGES_REFUS[r.status])
        return
      }
      captureRef.current = capture
      emailDemandeRef.current = true
      if (r?.etat === 'ok') adopterJeton(r.jeton)
      // Réponse tardive : le jeton est adopté à son arrivée (Test pas recommencé entre-temps).
      else if (r === null)
        void appel.then((t) => {
          if (captureRef.current !== capture) return // Test recommencé entre-temps
          if (t.etat === 'ok') adopterJeton(t.jeton)
          else if (t.etat === 'refus') {
            // Refus tardif : pas de repli, l'email est redemandé (le Test reprend où il en était).
            captureRef.current = null
            eventIdRef.current = null
            emailDemandeRef.current = false
            setErreurCapture(MESSAGES_REFUS[t.status])
            setEtape((e) => (e === 'questions' ? 'capture' : e))
          }
        })
      setEtape('questions')
    },
    [reponses, adopterJeton],
  )

  return useMemo(
    () => ({
      etape,
      indexCourant,
      questionCourante,
      reponses,
      resultat,
      envoiEnCours,
      envoiReussi,
      envoiRefuse,
      erreurCapture,
      apiResponse,
      commencer,
      retour,
      recommencer,
      repondreTypage,
      repondreIntensite,
      repondreContexte,
      soumettreCapture,
    }),
    [
      etape,
      indexCourant,
      questionCourante,
      reponses,
      resultat,
      envoiEnCours,
      envoiReussi,
      envoiRefuse,
      erreurCapture,
      apiResponse,
      commencer,
      retour,
      recommencer,
      repondreTypage,
      repondreIntensite,
      repondreContexte,
      soumettreCapture,
    ],
  )
}
