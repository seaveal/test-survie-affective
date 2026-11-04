// Appels de la page /rdv/ à tsa-api, selon le contrat fixé dans le PLAN du chantier
// (section « Contrat de l'API entre le lot 2 et le lot 3 »). Aucune fonction ne lève :
// chaque issue est une valeur que la page sait traiter.

import { extractUtmParams } from '../api/client'

declare global {
  interface Window {
    h3cEmailLien?: () => string | undefined
    fbq?: (...args: unknown[]) => void
    __h3cPixelInitialized?: Record<string, boolean>
  }
}

const API = (import.meta.env?.VITE_API_URL as string | undefined) ?? 'https://api.souverainauquotidien.com'

async function poster(chemin: string, corps: unknown, delaiMs: number): Promise<Response> {
  const ctrl = new AbortController()
  const minuteur = setTimeout(() => ctrl.abort(), delaiMs)
  try {
    return await fetch(`${API}${chemin}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(corps),
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(minuteur)
  }
}

async function code(res: Response): Promise<{ code?: string; champ?: string; message?: string; page?: string }> {
  try {
    const d = (await res.json()) as { detail?: unknown }
    return d && typeof d.detail === 'object' && d.detail ? (d.detail as Record<string, string>) : {}
  } catch {
    return {}
  }
}

export type IssueCreneaux =
  | { etat: 'ok'; creneaux: number[]; page: string }
  | { etat: 'inactive'; page?: string }
  | { etat: 'panne' }

const attendre = (ms: number) => new Promise((fin) => setTimeout(fin, ms))

/** Créneaux libres. Délai de 8 s, une nouvelle tentative ; puis panne. */
export async function lireCreneaux(): Promise<IssueCreneaux> {
  for (let essai = 0; essai < 2; essai++) {
    try {
      const res = await poster('/api/rdv/creneaux', {}, 8000)
      if (res.ok) {
        const d = (await res.json()) as { creneaux?: unknown; page?: unknown }
        if (Array.isArray(d.creneaux)) {
          return {
            etat: 'ok',
            creneaux: d.creneaux.filter((x): x is number => typeof x === 'number'),
            page: typeof d.page === 'string' ? d.page : '',
          }
        }
      } else {
        const c = await code(res)
        if (c.code === 'inactive') return { etat: 'inactive', page: c.page }
        if (res.status === 429) return { etat: 'panne' }
      }
    } catch {
      // réseau coupé ou délai dépassé : nouvelle tentative
    }
    if (essai === 0) await attendre(1500)
  }
  return { etat: 'panne' }
}

export interface DemandeRdv {
  cle: string
  prenom: string
  nom: string
  email: string
  telephone: string
  situation: string
  anciennete: string
  objectif: string
  provenance: string
  origine: string
  creneau: number
  fuseau: string
  sms_rappels: boolean
  site_web: string
  duree_ms: number
}

export type IssueReservation =
  | { etat: 'ok'; creneau: number; fuseau: string; eventId: string }
  | { etat: 'creneau_pris' }
  | { etat: 'champ'; champ: string; message: string }
  | { etat: 'deja_demande' }
  | { etat: 'panne' }

/**
 * Pose la demande. La même `cle` rejouée rend le même résultat côté serveur : un délai
 * dépassé ou une coupure est donc rejoué une fois avec la même clé avant le repli (la
 * demande a pu partir), et `en_cours` (la même clé encore en vol) attend puis rejoue.
 */
export async function reserver(d: DemandeRdv): Promise<IssueReservation> {
  const fb = window.h3cFb?.() ?? {}
  const corps = { ...d, fbp: fb.fbp, fbc: fb.fbc, page_url: location.href.slice(0, 500) }
  for (let essai = 0; essai < 2; essai++) {
    let res: Response
    try {
      res = await poster('/api/rdv/reserver', corps, 25000)
    } catch {
      if (essai === 0) {
        await attendre(2000)
        continue
      }
      return { etat: 'panne' }
    }
    if (res.ok) {
      const r = (await res.json().catch(() => ({}))) as { creneau?: number; fuseau?: string; event_id?: string }
      return { etat: 'ok', creneau: r.creneau || d.creneau, fuseau: r.fuseau || d.fuseau, eventId: r.event_id || '' }
    }
    const c = await code(res)
    if (res.status === 410 || c.code === 'creneau_pris') return { etat: 'creneau_pris' }
    if (res.status === 422 && c.code === 'champ_refuse' && c.champ) {
      return c.champ === 'creneau' ? { etat: 'creneau_pris' } : { etat: 'champ', champ: c.champ, message: c.message ?? '' }
    }
    if (res.status === 409 && c.code === 'deja_demande') return { etat: 'deja_demande' }
    if (res.status === 409 && c.code === 'en_cours' && essai === 0) {
      await attendre(3000)
      continue
    }
    return { etat: 'panne' }
  }
  return { etat: 'panne' }
}

/**
 * Une demande à venir existe-t-elle déjà pour cette adresse ou ce numéro ? Posée à l'écran des
 * coordonnées (demande Cyrille du 04/11/2026). Dans le doute, non : `/reserver` revérifie.
 */
export async function dejaDemande(email: string, telephone: string): Promise<boolean> {
  try {
    const res = await poster('/api/rdv/verifier', { email, telephone }, 5000)
    if (!res.ok) return false
    const d = (await res.json()) as { deja_demande?: unknown }
    return d.deja_demande === true
  } catch {
    return false
  }
}

/** L'adresse connue d'un jeton (cycle du Test ou du bilan, jeton `?c=`), sinon null. */
export async function emailDesJetons(cycle?: string, contact?: string): Promise<string | null> {
  if (!cycle && !contact) return null
  try {
    const res = await poster('/api/rdv/email', { cycle, contact }, 5000)
    if (!res.ok) return null
    const d = (await res.json()) as { email?: unknown }
    return typeof d.email === 'string' && d.email ? d.email : null
  } catch {
    return null
  }
}

/** Compteur d'écran, en keepalive. Jamais attendu ; un refus (422) ne casse rien. */
export function jalon(nom: string): void {
  try {
    const utm = extractUtmParams()
    void fetch(`${API}/api/test-jalon`, {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jalon: nom, utm_source: utm.source }),
    }).catch(() => {})
  } catch {
    // mesure seulement
  }
}

/** `Schedule` navigateur, même `event_id` que l'évènement serveur (déduplication Meta). */
export function signalerDemande(eventId: string): void {
  if (!eventId) return
  try {
    window.h3cTrack?.('schedule', { event_id: eventId })
    // Le pixel n'existe qu'après l'accord « publicité » (chargé par GTM) : rien sans lui.
    const ids = Object.keys(window.__h3cPixelInitialized ?? {})
    if (window.fbq) for (const id of ids) window.fbq('trackSingle', id, 'Schedule', {}, { eventID: eventId })
  } catch {
    // mesure seulement
  }
}
