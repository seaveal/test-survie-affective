// src/api/client.ts
// Client de l'API d'ingestion CRM H3C (https://api.souverainauquotidien.com).
//
// Envoie le payload du test terminé à POST /api/test-complete.
// En cas d'échec réseau, la capture est mise en queue localStorage et
// retentée au prochain mount de l'app (flushPendingCaptures).

import type { Resultat } from '../domain/types'

// Helpers exposés par le bloc H3C-TRACKING injecté dans index.html
// (généré depuis 40-Knowledge/Pro/PHM/tracking-config.json — Chantier 8).
declare global {
  interface Window {
    h3cAttribution?: () => Record<string, string | undefined>
    h3cFb?: () => { fbp?: string; fbc?: string }
    h3cEventId?: () => string
    h3cTrack?: (event: string, params?: Record<string, unknown>) => void
    // Variante mise en file jusqu'à ce que le consentement soit tranché. Un
    // événement poussé avant la décision est évalué sur l'état « refusé », et
    // GTM ne le réévalue jamais : il est perdu pour de bon.
    h3cTrackPage?: (event: string, params?: Record<string, unknown>) => void
  }
}

export interface CaptureValues {
  email: string
  prenom: string
  /** Mobile au format E.164 (+33...), déjà normalisé par CaptureScreen. Absent si non fourni. */
  telephone?: string
  consentementMarketing: boolean
  consentementDonneesSante: boolean
  /** Opt-in SMS explicite (mission 2026-06-16). True seulement si numéro valide ET case cochée. */
  consentementSms: boolean
}

export interface TestCompletePayload {
  email: string
  prenom?: string
  telephone?: string
  consentement_marketing: boolean
  consentement_donnees_sante: boolean
  consentement_sms: boolean
  source_acquisition?:
    | 'instagram'
    | 'facebook'
    | 'youtube'
    | 'livre'
    | 'bouche_a_oreille'
    | 'autre'
  utm?: { source?: string; medium?: string; campaign?: string; content?: string; term?: string }
  // Chantier 8 : déduplication Meta Pixel↔CAPI (même event_id des deux côtés)
  // + qualité de match serveur (fbp/fbc) + event_source_url (landing avec UTM).
  event_id?: string
  fbp?: string
  fbc?: string
  landing_url?: string
  resultat: {
    profilDominant: Resultat['profilDominant']
    profilSecondaire: Resultat['profilSecondaire']
    scoreProfils: Resultat['scoreProfils']
    intensite: Resultat['intensite']
    scoreIntensite: Resultat['scoreIntensite']
    statutLivre: Resultat['statutLivre']
    situation: Resultat['situation']
    etatEmotionnel: Resultat['etatEmotionnel']
    pretAAgir: Resultat['pretAAgir']
    reponsesBrutes: Record<string, unknown>
  }
}

export interface TestCompleteResponse {
  contact_id: string
  test_id: string
  cadeau_coupon_expire_le: string
  nurturing_planifie: number
}

const QUEUE_KEY = 'tsa.pending-captures'
const DEFAULT_API_URL = 'https://api.souverainauquotidien.com'

function getApiUrl(): string {
  return (import.meta.env?.VITE_API_URL as string | undefined) ?? DEFAULT_API_URL
}

function readQueue(): TestCompletePayload[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as TestCompletePayload[]) : []
  } catch {
    return []
  }
}

function writeQueue(items: TestCompletePayload[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  } catch {
    // localStorage indisponible ou plein : on accepte la perte (mode degradé)
  }
}

function enqueue(payload: TestCompletePayload): void {
  const q = readQueue()
  q.push(payload)
  writeQueue(q)
}

async function postOnce(payload: TestCompletePayload): Promise<TestCompleteResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(`${getApiUrl()}/api/test-complete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`API ${res.status} : ${text.slice(0, 200)}`)
    }
    return (await res.json()) as TestCompleteResponse
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Envoie le payload du test terminé. Ne throw jamais.
 * Retourne la réponse API si succès, ou null si échec (la capture est mise en queue
 * localStorage et sera retentée au prochain mount).
 */
export async function submitTestComplete(
  payload: TestCompletePayload,
): Promise<TestCompleteResponse | null> {
  // Chantier 8 : Lead dédupliqué Pixel↔CAPI. On génère l'event_id UNE fois,
  // on pousse l'événement browser (dataLayer → GTM → Pixel, si consenti) et le
  // même id part au serveur (CAPI). Les retries de queue gardent l'event_id
  // déjà posé → pas de double Lead.
  if (!payload.event_id) {
    payload.event_id =
      typeof window !== 'undefined' && window.h3cEventId
        ? window.h3cEventId()
        : `h3c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    try {
      // Version mise en file : la fin du Test peut survenir avant que le visiteur
      // ait tranché la bannière de consentement. Poussé brut, le `lead` était alors
      // évalué sur « refusé » et jamais rejoué — le prospect disparaissait de la
      // mesure alors même qu'il venait de finir le Test (audit 2026-08-04).
      // Repli sur l'appel direct si la page ne sert pas la file (pages anciennes).
      const suivre = window.h3cTrackPage ?? window.h3cTrack
      suivre?.('lead', { event_id: payload.event_id })
    } catch {
      // tracking indisponible : sans impact sur la capture
    }
  }
  try {
    return await postOnce(payload)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[tsa] échec envoi test-complete, mise en queue', err)
    enqueue(payload)
    return null
  }
}

/**
 * À appeler au mount de l'App (useEffect). Re-essaie les captures en attente.
 * Les payloads qui passent sortent de la queue, les autres restent.
 */
export async function flushPendingCaptures(): Promise<void> {
  const q = readQueue()
  if (q.length === 0) return
  const remaining: TestCompletePayload[] = []
  for (const item of q) {
    try {
      await postOnce(item)
    } catch {
      remaining.push(item)
    }
  }
  writeQueue(remaining)
}

export interface UtmParams {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
}

/**
 * Extrait les paramètres UTM (source / medium / campaign) depuis une querystring
 * (par défaut `window.location.search`). Trim + lowercase appliqués pour aligner
 * sur la normalisation back (cf. tsa_api routes/test_complete.py _UTM_SOURCE_NORMALIZATION).
 * Retourne un objet avec champs `undefined` si UTM absents.
 *
 * En env non-browser (SSR, tests jsdom où window.location.search est vide) :
 * retourne `{}` qui sérialise propre en JSON.
 */
export function extractUtmParams(search?: string): UtmParams {
  const normStr = (v: string | null | undefined): string | undefined => {
    if (v === null || v === undefined) return undefined
    const trimmed = v.trim().toLowerCase()
    return trimmed === '' ? undefined : trimmed
  }

  // Chantier 8 : préfère l'attribution FIRST-TOUCH persistée par le bloc
  // H3C-TRACKING (sessionStorage) — survit aux navigations internes du SPA
  // là où window.location.search se perd. Fallback : querystring courante.
  if (search === undefined && typeof window !== 'undefined' && window.h3cAttribution) {
    try {
      const at = window.h3cAttribution()
      if (at && (at.utm_source || at.utm_medium || at.utm_campaign)) {
        return {
          source: normStr(at.utm_source),
          medium: normStr(at.utm_medium),
          campaign: normStr(at.utm_campaign),
          content: normStr(at.utm_content),
          term: normStr(at.utm_term),
        }
      }
    } catch {
      // attribution indisponible : fallback querystring
    }
  }

  const raw =
    search ??
    (typeof window !== 'undefined' ? window.location.search : '')
  if (!raw) return {}
  let params: URLSearchParams
  try {
    params = new URLSearchParams(raw)
  } catch {
    return {}
  }
  return {
    source: normStr(params.get('utm_source')),
    medium: normStr(params.get('utm_medium')),
    campaign: normStr(params.get('utm_campaign')),
    content: normStr(params.get('utm_content')),
    term: normStr(params.get('utm_term')),
  }
}

/**
 * Construit le payload d'API à partir d'un Resultat domaine + capture.
 *
 * Les UTM sont extraits par défaut depuis `window.location.search` (passe `utm`
 * explicitement pour les tests). Le champ `source_acquisition` est laissé
 * `undefined` : le back applique le fallback `_normalize_source_from_utm(utm.source)`
 * pour mapper `fb` / `meta` → `facebook`, `ig` → `instagram`, etc. (cf. commit
 * 5525136 test-survie-affective-api).
 */
export function buildPayload(
  capture: CaptureValues,
  resultat: Resultat,
  reponsesBrutes: Record<string, unknown> = {},
  utm: UtmParams = extractUtmParams(),
): TestCompletePayload {
  // Chantier 8 : fbp/fbc (si consentement marketing donné, cookies posés par le
  // Pixel) et landing_url renforcent le matching Meta CAPI côté serveur.
  let fb: { fbp?: string; fbc?: string } = {}
  try {
    fb = (typeof window !== 'undefined' && window.h3cFb ? window.h3cFb() : {}) || {}
  } catch {
    fb = {}
  }
  return {
    email: capture.email,
    prenom: capture.prenom || undefined,
    telephone: capture.telephone || undefined,
    consentement_marketing: capture.consentementMarketing,
    consentement_donnees_sante: capture.consentementDonneesSante,
    consentement_sms: capture.consentementSms,
    utm,
    fbp: fb.fbp,
    fbc: fb.fbc,
    landing_url:
      typeof window !== 'undefined' ? window.location.href.slice(0, 500) : undefined,
    resultat: {
      profilDominant: resultat.profilDominant,
      profilSecondaire: resultat.profilSecondaire,
      scoreProfils: resultat.scoreProfils,
      intensite: resultat.intensite,
      scoreIntensite: resultat.scoreIntensite,
      statutLivre: resultat.statutLivre,
      situation: resultat.situation,
      etatEmotionnel: resultat.etatEmotionnel,
      pretAAgir: resultat.pretAAgir,
      reponsesBrutes,
    },
  }
}
