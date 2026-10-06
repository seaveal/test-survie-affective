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
  type EtatProgression,
  type Jalon,
  type TestCompleteResponse,
  viderFinsEnAttente,
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
  // Garde par référence : un seul /api/test-debut, même pour deux envois dans la même tâche.
  const captureEnVolRef = useRef(false)
  // Fin refusée faute d'email (jeton tué) : réponses et résultat gardés, l'email est redemandé.
  const finEnAttenteRef = useRef<{ nouvelles: Reponses; r: Resultat } | null>(null)
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

  // Jeton remplacé par un autre appareil : oublié (mémoire et tsa.reprise), sauf s'il a déjà changé.
  const oublierJeton = useCallback((jeton: string) => {
    if (jetonRef.current !== jeton) return
    jetonRef.current = null
    garderJetonReprise(null)
  }, [])

  const sauvegarder = useCallback(async (etat: Brut) => {
    const f = file.current
    if (f.enVol) {
      f.attente = etat
      return
    }
    f.enVol = true
    for (let c: Brut | null = etat; c; c = f.attente, f.attente = null) {
      const j = jetonRef.current
      // Jeton mort (404, 410) : oublié, plus de PUT, la fin partira par email.
      if (j && !(await sauvegarderProgression(j, c))) oublierJeton(j)
    }
    f.enVol = false
  }, [oublierJeton])

  const adopterJeton = useCallback(
    (jeton: string, lead: boolean) => {
      jetonRef.current = jeton
      garderJetonReprise(jeton)
      // Contrat v2.1 B : `lead` seulement si le serveur a envoyé le Lead ; sinon c'est
      // tranché pour ce Test, la fin n'en émettra pas non plus.
      if (lead) emettreLead()
      else leadEmisRef.current = true
      // Jeton arrivé après la borne : les réponses données entre-temps partent tout de suite.
      if (maxAtteint.current > REPONSES_AVANT_EMAIL) void sauvegarder(reponsesEnvoyees(reponsesRef.current, maxAtteint.current))
    },
    [emettreLead, sauvegarder],
  )

  const restaurer = useCallback((r: Extract<EtatProgression, { etat: 'en-cours' }>) => {
    const brut = reponsesValides(r.reponses as Brut)
    jetonRef.current = r.jeton
    garderJetonReprise(r.jeton)
    emailDemandeRef.current = true
    reponsesRef.current = reponsesRestaurees(brut)
    setReponses(reponsesRef.current)
    maxAtteint.current = premiereSansReponse(brut)
    setIndexCourant(maxAtteint.current)
    setEtape('questions')
  }, [])

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
      if (r?.etat === 'en-cours') return restaurer(r)
      // Terminé, 404 ou 410 : tsa.reprise déjà oublié. Erreur réseau (trois
      // essais) : tsa.reprise gardé pour un prochain chargement, comme le jeton
      // du lien que le bloc de suivi garde pour la session.
      setEtape('welcome')
    })
  }, [sources, restaurer])

  useEffect(() => {
    if (etape === 'welcome') jalon('arrivee')
    if (etape === 'capture') jalon('email_affiche')
  }, [etape, jalon])

  const commencer = useCallback(() => {
    jalon('commencer')
    const neuf = () => {
      setEtape('questions')
      setIndexCourant(0)
    }
    // tsa.reprise gardé (API en panne au chargement) : la lecture est retentée avant un Test neuf.
    const stocke = jetonRef.current ? undefined : lireJetonReprise()
    if (!stocke) return neuf()
    setEtape('chargement')
    void lireProgression({ jeton: stocke }).then((r) => {
      if (r.etat === 'en-cours') return restaurer(r)
      if (r.etat === 'oublier') garderJetonReprise(null)
      neuf()
    })
  }, [jalon, restaurer])

  const recommencer = useCallback(() => {
    viderFinsEnAttente()
    garderJetonReprise(null)
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
    finEnAttenteRef.current = null
    reponsesRef.current = reponsesVides
    setReponses(reponsesVides)
  }, [])

  const retour = useCallback(() => {
    setIndexCourant((i) => Math.max(0, i - 1))
  }, [])

  /**
   * Envoi de la fin (contrat v2.1 A) : le jeton s'il vit encore, et l'email quand
   * la page le tient en mémoire (un jeton tué par un autre appareil ne perd pas le
   * Test). Sans jeton ni email, ou jeton inconnu sans email (422) : l'écran de
   * l'email est rouvert, réponses gardées, et la fin repart par email.
   */
  const envoyerFin = useCallback(
    async (nouvelles: Reponses, r: Resultat) => {
      const jeton = jetonRef.current
      const capture = captureRef.current
      const redemanderEmail = () => {
        finEnAttenteRef.current = { nouvelles, r }
        setEtape('capture')
      }
      if (!jeton && !capture) return redemanderEmail()
      // v: 2 = Test à 25 questions (2026-10-06) : numéros 3, 9, 10, 20 et 29 absents.
      const payload = buildPayload(capture, r, {
        v: 2,
        typage: nouvelles.typage,
        intensite: nouvelles.intensite,
        contexte: nouvelles.contexte,
      })
      if (jeton) payload.jeton = jeton
      // event_id toujours posé ici : submitTestComplete n'émet alors aucun `lead` de lui-même.
      payload.event_id = (!jeton && eventIdRef.current) || nouvelEventId()
      setEnvoiEnCours(true)
      try {
        const res = await submitTestComplete(payload)
        if (res && 'refus' in res) {
          // Jeton inconnu et pas d'email (page rechargée, puis jeton tué) : pas un refus de l'adresse.
          if (res.refus === 422 && jeton && !capture) {
            oublierJeton(jeton)
            return redemanderEmail()
          }
          // Refus définitif : aucun lead pour une demande que le serveur a rejetée.
          setEnvoiRefuse(true)
          return
        }
        if (res !== null) {
          // Repli (test-debut sans réponse) : le lead part ici, pour une fin acceptée seulement.
          if (!jeton) emettreLead()
          garderJetonReprise(null)
        }
        setApiResponse(res)
        setEnvoiReussi(res !== null)
      } finally {
        setEnvoiEnCours(false)
      }
    },
    [emettreLead, oublierJeton],
  )

  /** Fin du Test : résultat calculé par la page, affiché tout de suite, envoi en parallèle. */
  const finaliser = useCallback(
    (nouvelles: Reponses) => {
      const r = composerResultat(nouvelles, questionsTypage)
      setResultat(r)
      setEtape('resultat')
      emettreEvenement('test_termine', { profil: r.profilDominant })
      void envoyerFin(nouvelles, r)
    },
    [envoyerFin],
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
      if (captureEnVolRef.current) return
      captureEnVolRef.current = true
      setErreurCapture(null)
      const fin = finEnAttenteRef.current
      if (fin) {
        // Email redemandé après une fin refusée : le Test est fini, il part par email.
        finEnAttenteRef.current = null
        captureRef.current = capture
        emailDemandeRef.current = true
        setEtape('resultat')
        void envoyerFin(fin.nouvelles, fin.r).finally(() => {
          captureEnVolRef.current = false
        })
        return
      }
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
      captureEnVolRef.current = false
      setEnvoiEnCours(false)
      if (r?.etat === 'refus') {
        // Pas de repli : l'adresse est refusée, on la redemande.
        eventIdRef.current = null
        setErreurCapture(MESSAGES_REFUS[r.status])
        return
      }
      captureRef.current = capture
      emailDemandeRef.current = true
      if (r?.etat === 'ok') adopterJeton(r.jeton, r.lead)
      // Réponse tardive : le jeton est adopté à son arrivée (Test pas recommencé entre-temps).
      else if (r === null)
        void appel.then((t) => {
          if (captureRef.current !== capture) return // Test recommencé entre-temps
          if (t.etat === 'ok') adopterJeton(t.jeton, t.lead)
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
    [reponses, adopterJeton, envoyerFin],
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
