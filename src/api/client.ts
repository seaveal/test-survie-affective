// src/api/client.ts
// Client de l'API d'ingestion CRM H3C (https://api.souverainauquotidien.com).
//
// Envoie le payload du test terminé à POST /api/test-complete.
// En cas d'échec réseau, la capture est mise en queue localStorage et
// retentée au prochain mount de l'app (flushPendingCaptures).

import type { Resultat } from '../domain/types'

export interface CaptureValues {
  email: string
  prenom: string
  consentementMarketing: boolean
  consentementDonneesSante: boolean
}

export interface TestCompletePayload {
  email: string
  prenom?: string
  consentement_marketing: boolean
  consentement_donnees_sante: boolean
  source_acquisition?:
    | 'instagram'
    | 'facebook'
    | 'youtube'
    | 'livre'
    | 'bouche_a_oreille'
    | 'autre'
  utm?: { source?: string; medium?: string; campaign?: string }
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

/**
 * Construit le payload d'API à partir d'un Resultat domaine + capture.
 */
export function buildPayload(
  capture: CaptureValues,
  resultat: Resultat,
  reponsesBrutes: Record<string, unknown> = {},
): TestCompletePayload {
  return {
    email: capture.email,
    prenom: capture.prenom || undefined,
    consentement_marketing: capture.consentementMarketing,
    consentement_donnees_sante: capture.consentementDonneesSante,
    source_acquisition: 'autre',
    utm: { source: undefined, medium: undefined, campaign: undefined },
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
