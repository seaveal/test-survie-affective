import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildPayload,
  extractUtmParams,
  flushPendingCaptures,
  submitTestComplete,
  type CaptureValues,
} from './client'
import type { Resultat } from '../domain/types'

const CAPTURE: CaptureValues = {
  email: 'alice@h3c.life',
  prenom: 'Alice',
  consentementMarketing: true,
  consentementDonneesSante: false,
  consentementSms: false,
}

const RESULTAT: Resultat = {
  profilDominant: 'mendiant',
  profilSecondaire: null,
  scoreProfils: { mendiant: 30, sauveur: 10, controleur: 8, fantome: 12 },
  intensite: 'modere',
  scoreIntensite: 18,
  statutLivre: 'pas_lu',
  situation: 'couple_stable',
  etatEmotionnel: 'tendu',
  pretAAgir: 'maintenant',
}

describe('api/client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('buildPayload', () => {
    it('mappe correctement les champs Resultat -> payload API', () => {
      const p = buildPayload(CAPTURE, RESULTAT, { q1: 'A' }, {})
      expect(p.email).toBe('alice@h3c.life')
      expect(p.prenom).toBe('Alice')
      expect(p.consentement_marketing).toBe(true)
      expect(p.consentement_donnees_sante).toBe(false)
      expect(p.resultat.profilDominant).toBe('mendiant')
      expect(p.resultat.intensite).toBe('modere')
      expect(p.resultat.scoreIntensite).toBe(18)
      expect(p.resultat.reponsesBrutes).toEqual({ q1: 'A' })
    })

    it('omet prenom si vide', () => {
      const p = buildPayload(
        { ...CAPTURE, prenom: '' },
        RESULTAT,
        {},
        {},
      )
      expect(p.prenom).toBeUndefined()
    })

    it('inclut telephone (E.164) + consentement_sms quand fournis', () => {
      const p = buildPayload(
        { ...CAPTURE, telephone: '+33612345678', consentementSms: true },
        RESULTAT,
        {},
        {},
      )
      expect(p.telephone).toBe('+33612345678')
      expect(p.consentement_sms).toBe(true)
    })

    it('omet telephone si absent, consentement_sms=false par defaut', () => {
      const p = buildPayload(CAPTURE, RESULTAT, {}, {})
      expect(p.telephone).toBeUndefined()
      expect(p.consentement_sms).toBe(false)
    })

    it('NE hardcode PLUS source_acquisition (le back décide via UTM)', () => {
      const p = buildPayload(CAPTURE, RESULTAT, {}, {})
      expect(p.source_acquisition).toBeUndefined()
    })

    it('propage les UTM passés explicitement', () => {
      const p = buildPayload(CAPTURE, RESULTAT, {}, {
        source: 'facebook',
        medium: 'cpc',
        campaign: 'launch-2026',
      })
      expect(p.utm).toEqual({
        source: 'facebook',
        medium: 'cpc',
        campaign: 'launch-2026',
      })
    })

    it('extrait les UTM depuis window.location.search par défaut', () => {
      const originalSearch = window.location.search
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          ...window.location,
          search: '?utm_source=fb&utm_medium=cpc&utm_campaign=test',
        },
      })
      try {
        const p = buildPayload(CAPTURE, RESULTAT)
        expect(p.utm).toEqual({
          source: 'fb',
          medium: 'cpc',
          campaign: 'test',
        })
      } finally {
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: { ...window.location, search: originalSearch },
        })
      }
    })
  })

  describe('extractUtmParams', () => {
    it('retourne {} si querystring vide', () => {
      expect(extractUtmParams('')).toEqual({})
      expect(extractUtmParams('?')).toEqual({})
    })

    it('extrait les 3 paramètres UTM standards', () => {
      expect(
        extractUtmParams('?utm_source=facebook&utm_medium=cpc&utm_campaign=launch'),
      ).toEqual({ source: 'facebook', medium: 'cpc', campaign: 'launch' })
    })

    it('lowercase + trim les valeurs (alignement normalisation back)', () => {
      expect(extractUtmParams('?utm_source=FB&utm_medium=%20Email%20')).toEqual({
        source: 'fb',
        medium: 'email',
        campaign: undefined,
      })
    })

    it('retourne undefined pour les champs absents', () => {
      expect(extractUtmParams('?utm_source=instagram')).toEqual({
        source: 'instagram',
        medium: undefined,
        campaign: undefined,
      })
    })

    it('ignore les paramètres non-UTM', () => {
      expect(
        extractUtmParams('?foo=bar&utm_source=youtube&baz=42'),
      ).toEqual({ source: 'youtube', medium: undefined, campaign: undefined })
    })

    it('chaîne vide après trim = undefined', () => {
      expect(extractUtmParams('?utm_source=%20%20')).toEqual({
        source: undefined,
        medium: undefined,
        campaign: undefined,
      })
    })
  })

  describe('submitTestComplete', () => {
    it('retourne la reponse API en cas de succes', async () => {
      const mock = {
        contact_id: 'c1',
        test_id: 't1',
        cadeau_coupon_expire_le: '2026-05-25T00:00:00Z',
        nurturing_planifie: 6,
      }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mock,
      } as unknown as Response)

      const payload = buildPayload(CAPTURE, RESULTAT)
      const res = await submitTestComplete(payload)
      expect(res).toEqual(mock)
      expect(localStorage.getItem('tsa.pending-captures')).toBeNull()
    })

    it('retourne null et empile la capture en cas d\'echec reseau', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network down'))
      const payload = buildPayload(CAPTURE, RESULTAT)
      const res = await submitTestComplete(payload)
      expect(res).toBeNull()
      const queue = JSON.parse(localStorage.getItem('tsa.pending-captures') ?? '[]')
      expect(queue).toHaveLength(1)
      expect(queue[0].email).toBe('alice@h3c.life')
    })

    it('retourne null et empile la capture en cas de 5xx', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'boom',
      } as unknown as Response)
      const payload = buildPayload(CAPTURE, RESULTAT)
      const res = await submitTestComplete(payload)
      expect(res).toBeNull()
      const queue = JSON.parse(localStorage.getItem('tsa.pending-captures') ?? '[]')
      expect(queue).toHaveLength(1)
    })

    it('retourne null et empile en cas de 422', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'invalid email',
      } as unknown as Response)
      const payload = buildPayload(CAPTURE, RESULTAT)
      const res = await submitTestComplete(payload)
      expect(res).toBeNull()
    })
  })

  describe('flushPendingCaptures', () => {
    it('retente les payloads en queue et les retire en cas de succes', async () => {
      const payload = buildPayload(CAPTURE, RESULTAT)
      localStorage.setItem('tsa.pending-captures', JSON.stringify([payload]))
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contact_id: 'c1',
          test_id: 't1',
          cadeau_coupon_expire_le: '2026-05-25T00:00:00Z',
          nurturing_planifie: 6,
        }),
      } as unknown as Response)
      await flushPendingCaptures()
      const queue = JSON.parse(localStorage.getItem('tsa.pending-captures') ?? '[]')
      expect(queue).toHaveLength(0)
    })

    it('conserve les payloads qui echouent encore', async () => {
      const payload = buildPayload(CAPTURE, RESULTAT)
      localStorage.setItem('tsa.pending-captures', JSON.stringify([payload]))
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('still down'))
      await flushPendingCaptures()
      const queue = JSON.parse(localStorage.getItem('tsa.pending-captures') ?? '[]')
      expect(queue).toHaveLength(1)
    })

    it('no-op si queue vide', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      await flushPendingCaptures()
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })
})
