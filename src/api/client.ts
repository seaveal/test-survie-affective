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
    // Jeton de contact `h1.…` capté depuis `?c=` par le bloc H3C-TRACKING.
    h3cContact?: () => string | undefined
  }
}

export interface CaptureValues {
  email: string
  prenom: string
  consentementMarketing: boolean
}

export interface TestCompletePayload {
  // Livraison 2 : absents quand le jeton de reprise suffit (contact déjà en base
  // depuis /api/test-debut, l'email du jeton gagne côté API).
  email?: string
  prenom?: string
  // Ni `telephone` ni `consentement_sms` (décision du 06/10/2026, plus de mobile
  // au formulaire). Absents du corps, jamais `false` : côté API, absent veut dire
  // « ne rien toucher », `false` retirerait un consentement SMS existant.
  consentement_marketing?: boolean
  jeton?: string
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

/** Erreur HTTP (réponse reçue). Une panne réseau ou un délai dépassé lève autre chose. */
class ErreurHttp extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Seuls une panne réseau, un délai dépassé ou un 5xx justifient de rejouer.
 * Un 4xx est une réponse définitive (422 invalide, 410 contact supprimé…) :
 * le rejouer à chaque ouverture ne ferait que répéter le refus.
 */
function rejouable(err: unknown): boolean {
  // 408 et 429 (limiteur, IP mobile partagée) sont passagers : rejoués.
  return !(err instanceof ErreurHttp) || err.status >= 500 || err.status === 408 || err.status === 429
}

/** fetch borné (10 s par défaut). Lève sur panne réseau ou délai ; rend la réponse sinon. */
async function appel(method: string, chemin: string, corps?: unknown, delaiMs = 10_000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), delaiMs)
  try {
    return await fetch(`${getApiUrl()}${chemin}`, {
      method,
      headers: corps === undefined ? undefined : { 'content-type': 'application/json' },
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function postOnce(payload: TestCompletePayload): Promise<TestCompleteResponse> {
  const res = await appel('POST', '/api/test-complete', payload)
  if (!res.ok) {
    const text = await res.text()
    throw new ErreurHttp(res.status, `API ${res.status} : ${text.slice(0, 200)}`)
  }
  return (await res.json()) as TestCompleteResponse
}

/**
 * Pousse l'événement navigateur `lead` (dataLayer → GTM → Pixel). Version mise
 * en file : le visiteur peut ne pas avoir encore tranché la bannière de
 * consentement. Poussé brut, le `lead` était alors évalué sur « refusé » et
 * jamais rejoué (audit 2026-08-04). Repli sur l'appel direct si la page ne
 * sert pas la file (pages anciennes).
 */
export function emettreEvenement(evenement: string, params: Record<string, unknown> = {}): void {
  try {
    const suivre = window.h3cTrackPage ?? window.h3cTrack
    suivre?.(evenement, params)
  } catch {
    // tracking indisponible : sans impact sur le Test
  }
}

export function nouvelEventId(): string {
  try {
    if (typeof window !== 'undefined' && window.h3cEventId) return window.h3cEventId()
  } catch {
    // repli ci-dessous
  }
  return `h3c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Envoie le payload du test terminé. Ne throw jamais.
 * Retourne la réponse API si succès, ou null si échec (la capture est mise en queue
 * localStorage et sera retentée au prochain mount).
 */
export async function submitTestComplete(
  payload: TestCompletePayload,
): Promise<TestCompleteResponse | { refus: number } | null> {
  // Chantier 8 : Lead dédupliqué Pixel↔CAPI. On génère l'event_id UNE fois,
  // on pousse l'événement browser (dataLayer → GTM → Pixel, si consenti) et le
  // même id part au serveur (CAPI). Les retries de queue gardent l'event_id
  // déjà posé → pas de double Lead.
  if (!payload.event_id) {
    // Livraison 2 : avec un jeton, le Lead est déjà parti à l'email
    // (/api/test-debut) ; la fin n'en émet jamais un second.
    payload.event_id = nouvelEventId()
    if (!payload.jeton) emettreEvenement('lead', { event_id: payload.event_id })
  }
  try {
    return await postOnce(payload)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[tsa] échec envoi test-complete', err)
    if (rejouable(err)) {
      enqueue(payload)
      return null
    }
    // Refus définitif (4xx) : rien n'est gardé, l'écran doit le dire.
    return { refus: err instanceof ErreurHttp ? err.status : 0 }
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
    } catch (err) {
      // Un 4xx sort de la file : rejoué, il serait refusé à chaque ouverture.
      if (rejouable(err)) remaining.push(item)
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
  /**
   * Code du lien court h3c.fr qui a amené le visiteur (paramètre `h3c`).
   *
   * Distinct des UTM, et c'est délibéré : `utm_content` a déjà une collision
   * dans le parc, et deux emplacements peuvent partager une campagne. Le code
   * est la clé primaire de la table des liens — c'est le seul champ qui
   * identifie sans ambiguïté d'où vient une inscription, et donc le seul qui
   * permette de dire de quelle étape d'une séquence vient une vente.
   */
  code?: string
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

  // Le CODE ne se met pas en minuscules, contrairement aux UTM.
  //
  // Il est la clé primaire de la table des liens, et cette table est sensible à
  // la casse : 125 des 326 codes du parc portent au moins une majuscule
  // (`HTTbC`, `MceDn`, `3TV9C` — le raccourcisseur tire en base62). Abaisser la
  // casse ici produit un code qui ne correspond à rien : la résolution le
  // classerait « code inconnu » et l'origine resterait vide, ce qui est
  // exactement l'inverse du but. Les UTM, elles, sont normalisées côté back et
  // n'ont pas cette contrainte.
  const normCode = (v: string | null | undefined): string | undefined => {
    if (v === null || v === undefined) return undefined
    const trimmed = v.trim()
    return trimmed === '' ? undefined : trimmed
  }

  // Le code de la querystring COURANTE, quand l'attribution persistée n'en a
  // pas. Deux raisons de le lire séparément, et elles se cumulent :
  //
  // 1. Le bloc H3C-TRACKING n'a persisté `h3c` qu'à partir du 2026-08-06. Les
  //    visiteurs dont l'attribution a été posée avant portent un first-touch
  //    sans code, valable quatre-vingt-dix jours. Sans ce repli, le correctif
  //    du bloc ne produirait ses premiers effets qu'en novembre.
  // 2. La condition d'entrée de la branche ci-dessous se satisfait d'une seule
  //    UTM. Une attribution qui porte `utm_source` sans `h3c` renvoie donc un
  //    résultat sans code, et le repli en fin de fonction n'est jamais atteint.
  const codeDeLUrl = (): string | undefined => {
    if (typeof window === 'undefined') return undefined
    try {
      return normCode(new URLSearchParams(window.location.search).get('h3c'))
    } catch {
      return undefined
    }
  }

  // Chantier 8 : préfère l'attribution FIRST-TOUCH persistée par le bloc
  // H3C-TRACKING (localStorage, TTL 90 j) — survit aux navigations internes du
  // SPA là où window.location.search se perd. Fallback : querystring courante.
  if (search === undefined && typeof window !== 'undefined' && window.h3cAttribution) {
    try {
      const at = window.h3cAttribution()
      if (at && (at.utm_source || at.utm_medium || at.utm_campaign || at.h3c)) {
        return {
          source: normStr(at.utm_source),
          medium: normStr(at.utm_medium),
          campaign: normStr(at.utm_campaign),
          content: normStr(at.utm_content),
          term: normStr(at.utm_term),
          code: normCode(at.h3c) ?? codeDeLUrl(),
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
    code: normCode(params.get('h3c')),
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
  capture: CaptureValues | null,
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
    ...(capture ? champsCapture(capture) : {}),
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
      pretAAgir: resultat.pretAAgir,
      reponsesBrutes,
    },
  }
}

function champsCapture(capture: CaptureValues) {
  return {
    email: capture.email,
    prenom: capture.prenom || undefined,
    consentement_marketing: capture.consentementMarketing,
  }
}

// ---------------------------------------------------------------------------
// Livraison 2 (2026-10-06) : email après la 3e réponse, sauvegarde, reprise.
// Contrat : 99-Meta/Logs/Audits/2026-10-06_entonnoir-ig-mot-cle-test/chantier/CONTRAT-L2.md
// ---------------------------------------------------------------------------

/** Clé propre à la page : le jeton de reprise rendu par /api/test-debut. */
export const REPRISE_KEY = 'tsa.reprise'

/** Jeton de cycle gardé par la page (contrat v2). */
export function lireJetonReprise(): string | undefined {
  try {
    return localStorage.getItem(REPRISE_KEY) || undefined
  } catch {
    return undefined // stockage indisponible
  }
}

/** Jeton de contact du lien du courriel (`?c=`), exposé par le bloc de suivi. */
export function lireJetonContact(): string | undefined {
  try {
    return window.h3cContact?.() || undefined
  } catch {
    return undefined
  }
}

export function garderJetonReprise(jeton: string | null): void {
  try {
    if (jeton) localStorage.setItem(REPRISE_KEY, jeton)
    else localStorage.removeItem(REPRISE_KEY)
  } catch {
    // stockage indisponible : la reprise ne marchera que par le lien du courriel
  }
}

export type ResultatDebut =
  | { etat: 'ok'; jeton: string; lead: boolean }
  | { etat: 'refus'; status: 410 | 422 }
  | { etat: 'repli' }

/**
 * POST /api/test-debut. Ne lève jamais. 422 et 410 sont des refus définitifs
 * (message à l'écran) ; tout le reste (réseau, délai, 5xx, 404 d'une API pas
 * encore livrée, réponse sans jeton) bascule sur le repli : le Test continue et
 * finit par l'ancien chemin de /api/test-complete.
 */
export async function demarrerTest(
  capture: CaptureValues,
  eventId: string,
  reponses: Record<string, unknown>,
  jeton?: string,
): Promise<ResultatDebut> {
  const base = buildPayload(capture, {} as Resultat)
  const corps = {
    ...champsCapture(capture),
    utm: base.utm,
    event_id: eventId,
    fbp: base.fbp,
    fbc: base.fbc,
    landing_url: base.landing_url,
    reponses,
    ...(jeton ? { jeton } : {}),
  }
  try {
    const res = await appel('POST', '/api/test-debut', corps)
    if (res.status === 422 || res.status === 410) return { etat: 'refus', status: res.status }
    if (!res.ok) return { etat: 'repli' }
    const data = (await res.json()) as { jeton?: unknown; lead?: unknown }
    // Contrat v2.1 B : `lead` vrai seulement quand le serveur a envoyé le Lead (nouveau cycle).
    return typeof data.jeton === 'string' && data.jeton
      ? { etat: 'ok', jeton: data.jeton, lead: data.lead === true }
      : { etat: 'repli' }
  } catch {
    return { etat: 'repli' }
  }
}

/**
 * PUT /api/test-progression. Ne lève jamais ; l'échec est silencieux.
 * Rend false si le jeton est mort (404, 410 : remplacé par un autre appareil),
 * true sinon (réseau, 5xx, 409 : la prochaine réponse renverra l'état complet).
 */
export async function sauvegarderProgression(
  jeton: string,
  reponses: Record<string, unknown>,
): Promise<boolean> {
  try {
    const res = await appel('PUT', '/api/test-progression', { jeton, reponses })
    return res.status !== 404 && res.status !== 410
  } catch {
    return true
  }
}

export type EtatProgression =
  | { etat: 'en-cours'; reponses: Record<string, unknown>; jeton: string }
  | { etat: 'oublier' } // terminé, 404 ou 410 : le jeton ne sert plus
  | { etat: 'erreur' } // réseau, 5xx : accueil normal, jeton gardé

// Reprise : une panne au chargement ne renvoie pas le visiteur à zéro (il
// écraserait ensuite sa progression à la 3e réponse). Deux nouvelles
// tentatives, ~0,8 s puis 2 s, écran d'attente maintenu ; jamais après un 404
// ni un `termine`, qui sont des réponses définitives.
const ATTENTES_REPRISE_MS = [800, 2000]
// Délai d'abandon d'une lecture : 4 s (au pire ~15 s d'écran d'attente, contre 33 s).
const DELAI_LECTURE_MS = 4000

/** Jeton de cycle (`tsa.reprise`) ou jeton de contact du lien (`c`). */
export type SourceReprise = { jeton: string } | { c: string }

export async function lireProgression(source: SourceReprise): Promise<EtatProgression> {
  let r = await lireProgressionUneFois(source)
  for (const ms of ATTENTES_REPRISE_MS) {
    if (r.etat !== 'erreur') break
    await new Promise((fin) => setTimeout(fin, ms))
    r = await lireProgressionUneFois(source)
  }
  return r
}

async function lireProgressionUneFois(source: SourceReprise): Promise<EtatProgression> {
  const [cle, valeur] = 'jeton' in source ? ['jeton', source.jeton] : ['c', source.c]
  try {
    const res = await appel('GET', `/api/test-progression?${cle}=${encodeURIComponent(valeur)}`, undefined, DELAI_LECTURE_MS)
    if (res.status === 404 || res.status === 410) return { etat: 'oublier' }
    if (!res.ok) return { etat: 'erreur' }
    const data = (await res.json()) as { termine?: boolean; reponses?: Record<string, unknown>; jeton?: unknown }
    if (data.termine) return { etat: 'oublier' }
    // Le serveur rend le jeton de cycle courant ; par `?jeton=`, c'est celui envoyé.
    const jeton = typeof data.jeton === 'string' && data.jeton ? data.jeton : 'jeton' in source ? source.jeton : ''
    return data.reponses && jeton ? { etat: 'en-cours', reponses: data.reponses, jeton } : { etat: 'erreur' }
  } catch {
    return { etat: 'erreur' }
  }
}

export type Jalon = 'arrivee' | 'commencer' | 'email_affiche'

/** POST /api/test-jalon en keepalive. Jamais attendu, jamais levé. */
export function envoyerJalon(jalon: Jalon): void {
  try {
    const utm = extractUtmParams()
    void fetch(`${getApiUrl()}/api/test-jalon`, {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jalon, utm_source: utm.source, utm_medium: utm.medium }),
    }).catch(() => {})
  } catch {
    // mesure seulement : sans impact sur le Test
  }
}
