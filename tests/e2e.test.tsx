import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { questions } from '../src/data/questions'

/**
 * Test e2e du parcours complet : welcome → 25 questions → capture email → page résultat allégée.
 *
 * Sprint 2 (2026-05-22) : la page résultat est désormais ALLÉGÉE.
 * À l'écran : niveau 1 seul (nom profil + intensité) + bloc "le détail arrive par email".
 * Le détail complet (7 symptômes + roadmap) part par email via Brevo (api.souverainauquotidien.com).
 *
 * On mocke `fetch` pour ne pas réellement contacter l'API d'ingestion en CI.
 */

async function commencerLeTest(user: ReturnType<typeof userEvent.setup>) {
  // Audit conversion 2026-08-27 : deux boutons « Découvrir mon masque »,
  // l'un au-dessus de la ligne de flottaison, l'autre en bas de page. Le
  // parcours part du premier.
  await user.click(screen.getByTestId('cta-haut'))
}

async function passerLecranCapture(
  user: ReturnType<typeof userEvent.setup>,
  email: string = 'cyrille+e2e@cyrillenovou.com',
) {
  // CaptureScreen affiche un champ email + 3 cases consentement (marketing, SMS,
  // donnees de sante) + bouton "Recevoir mon profil"
  expect(screen.getByTestId('capture-screen')).toBeInTheDocument()
  const emailInput = screen.getByRole('textbox', { name: /email/i })
  await user.type(emailInput, email)
  // Les trois cases partent decochees depuis le correctif RGPD-VX34 (une case
  // pre-cochee ne vaut pas consentement : recital 32, CJUE Planet49). Ce
  // parcours coche donc explicitement le marketing, comme le visiteur devra le
  // faire : le garde reste en place tant que le decouplage n'est pas decide,
  // et il est tenu en accord avec le validateur serveur, qui refuse `false`.
  await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
  await user.click(screen.getByRole('button', { name: /sauvegarder et continuer/i }))
}

// ---------------------------------------------------------------------------
// Livraison 2 (2026-10-06) : email après la 3e réponse, sauvegarde, reprise.
// Faux serveur en mémoire : chaque route du contrat CONTRAT-L2.md.
// ---------------------------------------------------------------------------
const JETON = 'h1.' + 'a'.repeat(40)
type Appel = { methode: string; chemin: string; corps: Record<string, unknown> | null }
let appels: Appel[]
let reglage: { debut?: number | 'reseau'; put?: 'reseau'; get?: number | Record<string, unknown> }
let suivi: ReturnType<typeof vi.fn>

function repondre(status: number, data: unknown = {}): Response {
  return { ok: status < 300, status, json: async () => data, text: async () => '' } as unknown as Response
}

function fauxServeur(url: string, init?: RequestInit): Promise<Response> {
  const u = new URL(url)
  const corps = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : null
  appels.push({ methode: init?.method ?? 'GET', chemin: u.pathname + u.search, corps })
  if (u.pathname === '/api/test-debut') {
    if (reglage.debut === 'reseau') return Promise.reject(new TypeError('Failed to fetch'))
    if (reglage.debut) return Promise.resolve(repondre(reglage.debut))
    return Promise.resolve(repondre(200, { ok: true, jeton: JETON }))
  }
  if (u.pathname === '/api/test-progression' && init?.method === 'PUT') {
    if (reglage.put === 'reseau') return Promise.reject(new TypeError('Failed to fetch'))
    return Promise.resolve(repondre(200, { ok: true }))
  }
  if (u.pathname === '/api/test-progression') {
    const g = reglage.get ?? 404
    return Promise.resolve(typeof g === 'number' ? repondre(g) : repondre(200, g))
  }
  if (u.pathname === '/api/test-jalon') return Promise.resolve(repondre(204))
  return Promise.resolve(repondre(200, { contact_id: 'c', test_id: 't', cadeau_coupon_expire_le: '', nurturing_planifie: 0 }))
}

const vers = (chemin: string, methode = 'POST') =>
  appels.filter((a) => a.chemin.startsWith(chemin) && a.methode === methode)
const leads = () => suivi.mock.calls.filter((c) => c[0] === 'lead')

async function repondreN(user: ReturnType<typeof userEvent.setup>, n: number) {
  for (let i = 0; i < n; i++) {
    const b = screen.getAllByRole('button').filter((x) => x.getAttribute('aria-pressed') !== null)
    await user.click(b[0])
  }
}

/** Réponses des n premières questions au format de l'API. */
function reponsesServeur(n: number) {
  const r = { typage: {} as Record<string, unknown>, intensite: {} as Record<string, unknown>, contexte: {} as Record<string, unknown>, v: 2 }
  for (const q of questions.slice(0, n)) {
    if (q.type === 'typage') r.typage[String(q.id)] = q.options[0].id
    else if (q.type === 'intensite') r.intensite[String(q.id)] = 3
    else r.contexte[q.champCible as string] = q.options[0].valeur
  }
  return r
}

describe('e2e livraison 2 : email après la 3e réponse', () => {
  beforeEach(() => {
    appels = []
    reglage = {}
    suivi = vi.fn()
    localStorage.clear()
    vi.spyOn(globalThis, 'fetch').mockImplementation(fauxServeur as typeof fetch)
    window.h3cTrack = suivi
    window.h3cEventId = () => 'evt-1'
    window.h3cAttribution = () => ({ utm_source: 'ig', utm_medium: 'social', h3c: 'AbC12' })
    window.h3cFb = () => ({ fbp: 'fb.1.x', fbc: 'fb.1.y' })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    delete window.h3cTrack
    delete window.h3cEventId
    delete window.h3cAttribution
    delete window.h3cFb
    delete window.h3cContact
  })

  it('chemin nominal : email après la 3e, PUT, fin directe avec jeton, un seul lead, trois jalons', async () => {
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 2)
    expect(screen.queryByTestId('capture-screen')).not.toBeInTheDocument()
    await repondreN(user, 1)
    await passerLecranCapture(user)
    expect(await screen.findByText(/Question 4 sur 25/)).toBeInTheDocument()

    const [debut] = vers('/api/test-debut')
    expect(vers('/api/test-debut')).toHaveLength(1)
    expect(debut.corps).toMatchObject({
      email: 'cyrille+e2e@cyrillenovou.com',
      consentement_marketing: true,
      event_id: 'evt-1',
      utm: { source: 'ig', medium: 'social', code: 'AbC12' },
      fbp: 'fb.1.x',
      fbc: 'fb.1.y',
      reponses: { v: 2 },
    })
    expect(Object.keys((debut.corps!.reponses as { typage: object }).typage)).toHaveLength(3)
    expect(localStorage.getItem('tsa.reprise')).toBe(JETON)
    expect(leads()).toEqual([['lead', { event_id: 'evt-1' }]])

    await repondreN(user, 22)
    expect(await screen.findByRole('button', { name: /Recommencer le test/i })).toBeInTheDocument()
    expect(screen.queryByTestId('capture-screen')).not.toBeInTheDocument()

    const puts = vers('/api/test-progression', 'PUT')
    expect(puts).toHaveLength(21) // réponses 4 à 24 ; la 25e part dans test-complete
    expect(puts.every((p) => p.corps!.jeton === JETON)).toBe(true)
    const [fin] = vers('/api/test-complete')
    expect(fin.corps).toMatchObject({ jeton: JETON })
    expect(fin.corps).not.toHaveProperty('email')
    // Contrat (révision du 06/10) : la fin d'un Test commencé par /api/test-debut
    // ne renvoie pas consentement_sms, pour ne pas retirer celui donné à la question 3.
    expect(fin.corps).not.toHaveProperty('consentement_sms')
    expect(leads()).toHaveLength(1)
    expect(suivi.mock.calls.some((c) => c[0] === 'test_termine')).toBe(true)
    await waitFor(() => expect(localStorage.getItem('tsa.reprise')).toBeNull())
    expect(vers('/api/test-jalon').map((a) => a.corps!.jalon)).toEqual(['arrivee', 'commencer', 'email_affiche'])
    expect(vers('/api/test-jalon')[0].corps).toMatchObject({ utm_source: 'ig', utm_medium: 'social' })
  })

  it.each(['reseau', 500, 404] as const)('repli sur %s : le Test continue, ancien chemin, lead une seule fois à la fin', async (panne) => {
    reglage.debut = panne
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    expect(await screen.findByText(/Question 4 sur 25/)).toBeInTheDocument()
    expect(leads()).toHaveLength(0)
    await repondreN(user, 22)
    await waitFor(() => expect(vers('/api/test-complete')).toHaveLength(1))
    expect(vers('/api/test-progression', 'PUT')).toHaveLength(0)
    const fin = vers('/api/test-complete')[0].corps!
    expect(fin).toMatchObject({ email: 'cyrille+e2e@cyrillenovou.com', consentement_marketing: true, event_id: 'evt-1' })
    expect(fin).not.toHaveProperty('jeton')
    expect(leads()).toEqual([['lead', { event_id: 'evt-1' }]])
  })

  it.each([422, 410] as const)('refus %s : message à l’écran, pas de repli, rien en file', async (status) => {
    reglage.debut = status
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('capture-screen')).toBeInTheDocument()
    expect(leads()).toHaveLength(0)
    expect(localStorage.getItem('tsa.reprise')).toBeNull()
    expect(localStorage.getItem('tsa.pending-captures')).toBeNull()
  })

  it('PUT sans rafale : une requête à la fois, la suivante porte le dernier état ; un échec ne casse rien', async () => {
    const user = userEvent.setup()
    let liberer: () => void = () => {}
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    await screen.findByText(/Question 4 sur 25/)
    const base = fauxServeur
    vi.mocked(globalThis.fetch).mockImplementation(((url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        appels.push({ methode: 'PUT', chemin: '/api/test-progression', corps: JSON.parse(init.body as string) })
        return new Promise<Response>((_, ko) => { liberer = () => ko(new TypeError('Failed to fetch')) })
      }
      return base(url, init)
    }) as typeof fetch)
    await repondreN(user, 3) // réponses 4, 5, 6 pendant que le premier PUT pend
    expect(vers('/api/test-progression', 'PUT')).toHaveLength(1)
    liberer() // le premier PUT échoue : silencieux
    await waitFor(() => expect(vers('/api/test-progression', 'PUT')).toHaveLength(2))
    const dernier = vers('/api/test-progression', 'PUT')[1].corps!.reponses as ReturnType<typeof reponsesServeur>
    const n = Object.keys(dernier.typage).length + Object.keys(dernier.intensite).length + Object.keys(dernier.contexte).length
    expect(n).toBe(6)
    expect(screen.getByText(/Question 7 sur 25/)).toBeInTheDocument()
  })

  it('reprise par tsa.reprise : 7 réponses → on rouvre sur la 8e, sans accueil ni jalon arrivee', async () => {
    localStorage.setItem('tsa.reprise', JETON)
    reglage.get = { termine: false, reponses: reponsesServeur(7) }
    render(<App />)
    expect(screen.getByText(/Chargement de votre Test/)).toBeInTheDocument()
    expect(await screen.findByText(/Question 8 sur 25/)).toBeInTheDocument()
    expect(vers('/api/test-progression', 'GET')[0].chemin).toBe(`/api/test-progression?c=${JETON}`)
    expect(vers('/api/test-jalon')).toHaveLength(0)
    expect(localStorage.getItem('tsa.reprise')).toBe(JETON)
    // La suite sauvegarde avec le jeton repris, sans redemander l'email.
    await repondreN(userEvent.setup(), 1)
    expect(vers('/api/test-progression', 'PUT')[0].corps!.jeton).toBe(JETON)
    expect(screen.queryByTestId('capture-screen')).not.toBeInTheDocument()
  })

  it('reprise par le lien du courriel (window.h3cContact) quand tsa.reprise est vide', async () => {
    window.h3cContact = () => JETON
    reglage.get = { termine: false, reponses: reponsesServeur(10) }
    render(<App />)
    expect(await screen.findByText(/Question 11 sur 25/)).toBeInTheDocument()
    expect(localStorage.getItem('tsa.reprise')).toBe(JETON)
  })

  it.each([{ termine: true }, 404] as const)('reprise %o : jeton oublié, accueil normal', async (get) => {
    localStorage.setItem('tsa.reprise', JETON)
    reglage.get = get as never
    render(<App />)
    expect(await screen.findByTestId('cta-haut')).toBeInTheDocument()
    expect(localStorage.getItem('tsa.reprise')).toBeNull()
    expect(vers('/api/test-jalon').map((a) => a.corps!.jalon)).toEqual(['arrivee'])
  })

  it('reprise en panne réseau : accueil normal, jeton gardé', async () => {
    localStorage.setItem('tsa.reprise', JETON)
    vi.mocked(globalThis.fetch).mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
    render(<App />)
    expect(await screen.findByTestId('cta-haut')).toBeInTheDocument()
    expect(localStorage.getItem('tsa.reprise')).toBe(JETON)
  })
})
