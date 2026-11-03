import { useCallback, useEffect, useRef, useState } from 'react'
import {
  accepterSuite,
  buildRvPayload,
  demarrerTest,
  emettreEvenement,
  envoyerJalon,
  lireJetonContact,
  lireProgression,
  nouvelEventId,
  rejouerFinsRv,
  sauvegarderProgression,
  submitRvComplete,
  viderFinsRvEnAttente,
  type CaptureValues,
  type Jalon,
} from '../api/client'
import { composerResultatRv } from '../domain/rv/scoring'
import type { PretAAgirRv, ReponseRv, ReponsesRv, ResultatRv, SituationRv } from '../domain/rv/types'
import { BORNE_DEBUT_MS, REPONSES_AVANT_EMAIL } from '../hooks/useTestState'
import { contexteRv, ECHELLE_RV, questionsRv, type ReponseSecurite } from './questions'
import { TEXTES_RV } from './textes'

// Bilan RETROUVEZ-VOUS (SPEC §3) : accueil, Q01 à Q03, email, Q04 à Q25, C1, C2,
// sécurité, résultat. Même mécanique que useTestState (course bornée de
// /api/test-debut, sauvegarde après chaque réponse, reprise, jalons), sur ses
// propres clés `rv.*` et son propre corps. Hook distinct : useTestState est typé Test.
export type EtapeRv = 'chargement' | 'welcome' | 'questions' | 'capture' | 'securite' | 'resultat'

/** Corps de /api/test-debut et de /api/test-progression pour ce bilan. */
export type CorpsRv = {
  jeu: 'rv'
  v: 1
  reponses: ReponsesRv
  situation: SituationRv | null
  pret_a_agir: PretAAgirRv | null
}

/** 25 questions puis C1 et C2. La question de sécurité vient après, hors de ce compte. */
export const NB_QUESTIONS_RV = questionsRv.length + contexteRv.length

const REPRISE_RV_KEY = 'rv.reprise'

const corpsVide: CorpsRv = { jeu: 'rv', v: 1, reponses: {}, situation: null, pret_a_agir: null }

function lireJeton(): string | undefined {
  try {
    return localStorage.getItem(REPRISE_RV_KEY) || undefined
  } catch {
    return undefined
  }
}

function garderJeton(jeton: string | null): void {
  try {
    if (jeton) localStorage.setItem(REPRISE_RV_KEY, jeton)
    else localStorage.removeItem(REPRISE_RV_KEY)
  } catch {
    // stockage indisponible : la reprise ne marchera que par le lien du courriel
  }
}

function repondue(c: CorpsRv, i: number): boolean {
  if (i < questionsRv.length) return questionsRv[i].id in c.reponses
  return (i === questionsRv.length ? c.situation : c.pret_a_agir) !== null
}

/** Première position sans réponse. Tout répondu sans bilan fini : on rouvre la dernière. */
function premiereSansReponse(c: CorpsRv): number {
  return [...Array(NB_QUESTIONS_RV).keys()].find((i) => !repondue(c, i)) ?? NB_QUESTIONS_RV - 1
}

/**
 * Réponses rendues par le serveur. Un cycle d'un autre jeu (le Test) est ignoré.
 * Valeur hors échelle ou hors énumération : ignorée, la question est reposée.
 */
function corpsRepris(brut: Record<string, unknown>): CorpsRv | null {
  if (brut.jeu !== 'rv') return null
  const r = (brut.reponses ?? {}) as Record<string, unknown>
  const reponses: ReponsesRv = {}
  for (const q of questionsRv) if (ECHELLE_RV.some((o) => o.valeur === r[q.id])) reponses[q.id] = r[q.id] as ReponseRv
  const parmi = (v: unknown, i: number) => (contexteRv[i].options.some((o) => o.valeur === v) ? v : null)
  return {
    ...corpsVide,
    reponses,
    situation: parmi(brut.situation, 0) as SituationRv | null,
    pret_a_agir: parmi(brut.pret_a_agir, 1) as PretAAgirRv | null,
  }
}

export function useRvState() {
  // Lus une fois au chargement : jeton de cycle (rv.reprise), jeton de contact (`?c=` du courriel).
  const [sources] = useState(() => ({ stocke: lireJeton(), contact: lireJetonContact() }))
  const [etape, setEtape] = useState<EtapeRv>(sources.stocke || sources.contact ? 'chargement' : 'welcome')
  const [indexCourant, setIndexCourant] = useState(0)
  const [corps, setCorps] = useState<CorpsRv>(corpsVide)
  // Question de sécurité : en mémoire d'écran seulement, jamais dans un corps de
  // requête ni dans le stockage local (SPEC §1). Elle ne change que le résultat affiché.
  const [securite, setSecurite] = useState<ReponseSecurite | null>(null)
  const [resultat, setResultat] = useState<ResultatRv | null>(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [envoiReussi, setEnvoiReussi] = useState(false)
  const [envoiRefuse, setEnvoiRefuse] = useState(false)
  const [erreurCapture, setErreurCapture] = useState<string | null>(null)
  // Seconde proposition, comme le Test : fin acceptée, jeton du cycle connu, case restée vide.
  const [suiteAProposer, setSuiteAProposer] = useState(false)
  const jetonRef = useRef<string | null>(null)
  const captureRef = useRef<CaptureValues | null>(null)
  const eventIdRef = useRef<string | null>(null)
  const leadEmisRef = useRef(false)
  const emailDemandeRef = useRef(false)
  const jalonsRef = useRef(new Set<Jalon>())
  const repriseLancee = useRef(false)
  const captureEnVolRef = useRef(false)
  // Fin refusée faute d'email (jeton tué) : réponses gardées, l'email est redemandé.
  const finEnAttenteRef = useRef<CorpsRv | null>(null)
  const maxAtteint = useRef(0)
  const corpsRef = useRef<CorpsRv>(corpsVide)
  // Sauvegarde sans rafale : une requête à la fois, la suivante part avec le dernier état.
  const file = useRef({ enVol: false, attente: null as CorpsRv | null })

  const jalon = useCallback((j: Jalon) => {
    if (jalonsRef.current.has(j)) return
    jalonsRef.current.add(j)
    envoyerJalon(j)
  }, [])

  const emettreLead = useCallback(() => {
    if (leadEmisRef.current || !eventIdRef.current) return
    leadEmisRef.current = true
    emettreEvenement('lead', { event_id: eventIdRef.current })
  }, [])

  const oublierJeton = useCallback((jeton: string) => {
    if (jetonRef.current !== jeton) return
    jetonRef.current = null
    garderJeton(null)
  }, [])

  const sauvegarder = useCallback(
    async (etat: CorpsRv) => {
      const f = file.current
      if (f.enVol) {
        f.attente = etat
        return
      }
      f.enVol = true
      let c: CorpsRv | null = etat
      while (c) {
        const j = jetonRef.current
        // Jeton mort (404, 410) : oublié, plus de PUT, la fin partira par email.
        if (j && !(await sauvegarderProgression(j, c))) oublierJeton(j)
        c = f.attente
        f.attente = null
      }
      f.enVol = false
    },
    [oublierJeton],
  )

  const adopterJeton = useCallback(
    (jeton: string, lead: boolean) => {
      jetonRef.current = jeton
      garderJeton(jeton)
      // `lead` vrai : le serveur vient d'ouvrir le cycle (même règle que le Test).
      // `rv_email_donne` est compté par /api/test-debut, jamais par la page.
      if (lead) emettreLead()
      else leadEmisRef.current = true
      // Jeton arrivé après la borne : les réponses données entre-temps partent tout de suite.
      if (maxAtteint.current > REPONSES_AVANT_EMAIL) void sauvegarder(corpsRef.current)
    },
    [emettreLead, jalon, sauvegarder],
  )

  const restaurer = useCallback((jeton: string, c: CorpsRv) => {
    jetonRef.current = jeton
    garderJeton(jeton)
    emailDemandeRef.current = true
    corpsRef.current = c
    setCorps(c)
    maxAtteint.current = premiereSansReponse(c)
    setIndexCourant(maxAtteint.current)
    setEtape('questions')
  }, [])

  // Reprise : une seule fois au chargement (garde contre le double effet de StrictMode).
  // Les fins restées en attente sur l'appareil partent D'ABORD : une fin rejouée clôt le
  // cycle, que la lecture voit alors terminé ; lues en parallèle, la page rouvrait la
  // question 27 d'un bilan déjà enregistré (audit du 03/11/2026, FRONT-04).
  useEffect(() => {
    if (repriseLancee.current) return
    repriseLancee.current = true
    const { stocke, contact } = sources
    void (async () => {
      await rejouerFinsRv()
      if (!(stocke || contact)) return undefined
      let r = stocke ? await lireProgression({ jeton: stocke }) : null
      if (r?.etat === 'oublier') garderJeton(null)
      if ((!r || r.etat === 'oublier') && contact) r = await lireProgression({ c: contact })
      return r
    })().then((r) => {
      if (r === undefined) return
      const c = r?.etat === 'en-cours' ? corpsRepris(r.reponses) : null
      if (c && r?.etat === 'en-cours') return restaurer(r.jeton, c)
      setEtape('welcome')
    })
  }, [sources, restaurer])

  useEffect(() => {
    if (etape === 'welcome') jalon('rv_arrivee')
    if (etape === 'capture') jalon('rv_email_affiche')
  }, [etape, jalon])

  const commencer = useCallback(() => {
    jalon('rv_commencer')
    const neuf = () => {
      setEtape('questions')
      setIndexCourant(0)
    }
    // rv.reprise gardé (API en panne au chargement) : la lecture est retentée avant un bilan neuf.
    const stocke = jetonRef.current ? undefined : lireJeton()
    if (!stocke) return neuf()
    setEtape('chargement')
    void lireProgression({ jeton: stocke }).then((r) => {
      const c = r.etat === 'en-cours' ? corpsRepris(r.reponses) : null
      if (c && r.etat === 'en-cours') return restaurer(r.jeton, c)
      if (r.etat === 'oublier') garderJeton(null)
      neuf()
    })
  }, [jalon, restaurer])

  const recommencer = useCallback(() => {
    viderFinsRvEnAttente()
    garderJeton(null)
    setEtape('welcome')
    setIndexCourant(0)
    setResultat(null)
    setSecurite(null)
    setEnvoiEnCours(false)
    setEnvoiReussi(false)
    setEnvoiRefuse(false)
    setErreurCapture(null)
    setSuiteAProposer(false)
    jetonRef.current = null
    captureRef.current = null
    eventIdRef.current = null
    leadEmisRef.current = false
    emailDemandeRef.current = false
    maxAtteint.current = 0
    finEnAttenteRef.current = null
    corpsRef.current = corpsVide
    setCorps(corpsVide)
  }, [])

  const retour = useCallback(() => {
    if (etape === 'securite') return setEtape('questions')
    setIndexCourant((i) => Math.max(0, i - 1))
  }, [etape])

  /**
   * Fin du bilan : le jeton s'il vit encore, et l'email quand la page le tient.
   * Sans jeton ni email, ou jeton inconnu sans email (404) : l'écran de l'email
   * est rouvert, réponses gardées, et la fin repart par email.
   */
  const envoyerFin = useCallback(
    async (c: CorpsRv) => {
      const jeton = jetonRef.current
      const capture = captureRef.current
      const redemanderEmail = () => {
        finEnAttenteRef.current = c
        setEtape('capture')
      }
      if (!jeton && !capture) return redemanderEmail()
      const payload = buildRvPayload(capture, { reponses: c.reponses, situation: c.situation, pret_a_agir: c.pret_a_agir })
      if (jeton) payload.jeton = jeton
      payload.event_id = (!jeton && eventIdRef.current) || nouvelEventId()
      setEnvoiEnCours(true)
      try {
        const res = await submitRvComplete(payload)
        if (res && 'refus' in res) {
          if (res.refus === 404 && jeton && !capture) {
            oublierJeton(jeton)
            return redemanderEmail()
          }
          setEnvoiRefuse(true)
          return
        }
        if (res !== null) {
          // Sans jeton, le serveur envoie le Lead à la fin : le Pixel le suit ici.
          if (!jeton) emettreLead()
          garderJeton(null)
          setSuiteAProposer(!!jeton && capture?.consentementMarketing === false)
        }
        setEnvoiReussi(res !== null)
      } finally {
        setEnvoiEnCours(false)
      }
    },
    [emettreLead, oublierJeton],
  )

  const avancer = useCallback(
    (nouveau: CorpsRv) => {
      corpsRef.current = nouveau
      setCorps(nouveau)
      const next = indexCourant + 1
      if (next >= NB_QUESTIONS_RV) setEtape('securite')
      else {
        setIndexCourant(next)
        maxAtteint.current = Math.max(maxAtteint.current, next)
        if (next === REPONSES_AVANT_EMAIL && !emailDemandeRef.current) return setEtape('capture')
      }
      // La fin part après la question de sécurité : C2 est donc sauvegardée elle aussi.
      if (jetonRef.current) void sauvegarder(nouveau)
    },
    [indexCourant, sauvegarder],
  )

  const repondreQuestion = useCallback(
    (v: ReponseRv) => {
      const c = corpsRef.current
      avancer({ ...c, reponses: { ...c.reponses, [questionsRv[indexCourant].id]: v } })
    },
    [indexCourant, avancer],
  )

  const repondreContexte = useCallback(
    (valeur: string) => {
      const c = corpsRef.current
      const q = contexteRv[indexCourant - questionsRv.length]
      avancer(
        q.champCible === 'situation'
          ? { ...c, situation: valeur as SituationRv }
          : { ...c, pret_a_agir: valeur as PretAAgirRv },
      )
    },
    [indexCourant, avancer],
  )

  /** Dernier écran : résultat calculé par la page, affiché tout de suite, envoi en parallèle. */
  const repondreSecurite = useCallback(
    (v: ReponseSecurite) => {
      setSecurite(v)
      setResultat(composerResultatRv(corpsRef.current.reponses))
      setEtape('resultat')
      // `rv_test_fini` est compté par /api/rv-complete, jamais par la page.
      void envoyerFin(corpsRef.current)
    },
    [envoyerFin],
  )

  /** Écran de l'email (après la 3e réponse) : POST /api/test-debut, attente bornée. */
  const soumettreCapture = useCallback(
    async (capture: CaptureValues) => {
      if (captureEnVolRef.current) return
      captureEnVolRef.current = true
      setErreurCapture(null)
      const fin = finEnAttenteRef.current
      if (fin) {
        // Email redemandé après une fin refusée : le bilan est fini, il part par email.
        finEnAttenteRef.current = null
        captureRef.current = capture
        emailDemandeRef.current = true
        setEtape('resultat')
        void envoyerFin(fin).finally(() => {
          captureEnVolRef.current = false
        })
        return
      }
      setEnvoiEnCours(true)
      eventIdRef.current = nouvelEventId()
      const appel = demarrerTest(capture, eventIdRef.current, corpsRef.current, jetonRef.current ?? lireJeton())
      const borne = new Promise<null>((ok) => setTimeout(() => ok(null), BORNE_DEBUT_MS))
      const r = await Promise.race([appel, borne])
      captureEnVolRef.current = false
      setEnvoiEnCours(false)
      if (r?.etat === 'refus') {
        eventIdRef.current = null
        setErreurCapture(TEXTES_RV.refus[r.status])
        return
      }
      captureRef.current = capture
      emailDemandeRef.current = true
      if (r?.etat === 'ok') adopterJeton(r.jeton, r.lead)
      else if (r === null)
        void appel.then((t) => {
          if (captureRef.current !== capture) return // bilan recommencé entre-temps
          if (t.etat === 'ok') adopterJeton(t.jeton, t.lead)
          else if (t.etat === 'refus') {
            // Refus tardif : l'email est redemandé, le bilan reprend où il en était.
            captureRef.current = null
            eventIdRef.current = null
            emailDemandeRef.current = false
            setErreurCapture(TEXTES_RV.refus[t.status])
            setEtape((e) => (e === 'questions' ? 'capture' : e))
          }
        })
      setEtape('questions')
    },
    [adopterJeton, envoyerFin],
  )

  const accepterSuiteDuBilan = useCallback(
    () => (jetonRef.current ? accepterSuite(jetonRef.current) : Promise.resolve(false)),
    [],
  )

  return {
    etape,
    indexCourant,
    corps,
    securite,
    resultat,
    envoiEnCours,
    envoiReussi,
    envoiRefuse,
    erreurCapture,
    suiteAProposer,
    commencer,
    retour,
    recommencer,
    repondreQuestion,
    repondreContexte,
    repondreSecurite,
    soumettreCapture,
    accepterSuite: accepterSuiteDuBilan,
  }
}
