import { act, render, screen, waitFor } from '@testing-library/react'
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
let reglage: {
  debut?: number | 'reseau' | { status: number; delai: number }
  put?: 'reseau' | number
  lead?: boolean
  get?: number | Record<string, unknown>
  getC?: number | Record<string, unknown>
  fin?: number | ((corps: Record<string, unknown> | null) => number)
}
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
    const d = reglage.debut
    if (typeof d === 'object') {
      const r = d.status === 200 ? repondre(200, { ok: true, jeton: JETON, lead: reglage.lead ?? true }) : repondre(d.status)
      return new Promise((ok) => setTimeout(() => ok(r), d.delai))
    }
    if (d) return Promise.resolve(repondre(d))
    return Promise.resolve(repondre(200, { ok: true, jeton: JETON, lead: reglage.lead ?? true }))
  }
  if (u.pathname === '/api/test-progression' && init?.method === 'PUT') {
    if (reglage.put === 'reseau') return Promise.reject(new TypeError('Failed to fetch'))
    return Promise.resolve(repondre(reglage.put ?? 200, { ok: true }))
  }
  if (u.pathname === '/api/test-progression') {
    const g = (u.searchParams.has('c') ? reglage.getC : reglage.get) ?? 404
    return Promise.resolve(typeof g === 'number' ? repondre(g) : repondre(200, g))
  }
  if (u.pathname === '/api/test-jalon') return Promise.resolve(repondre(204))
  const fin = typeof reglage.fin === 'function' ? reglage.fin(corps) : reglage.fin
  if (fin) return Promise.resolve(repondre(fin))
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
    // Décision du 6 octobre : ni mobile ni consentement SMS dans test-debut (m6).
    expect(debut.corps).not.toHaveProperty('telephone')
    expect(debut.corps).not.toHaveProperty('consentement_sms')
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
    // Contrat v2.1 A : le jeton ET l'email gardé en mémoire (un jeton tué ne perd pas le Test).
    expect(fin.corps).toMatchObject({ jeton: JETON, consentement_marketing: true })
    expect(fin.corps).toHaveProperty('email')
    // Contrat (révision du 06/10) : la fin d'un Test commencé par /api/test-debut
    // ne renvoie pas consentement_sms, pour ne pas retirer celui donné à la question 3.
    expect(fin.corps).not.toHaveProperty('consentement_sms')
    expect(leads()).toHaveLength(1)
    expect(suivi.mock.calls.some((c) => c[0] === 'test_termine')).toBe(true)
    await waitFor(() => expect(localStorage.getItem('tsa.reprise')).toBeNull())
    expect(vers('/api/test-jalon').map((a) => a.corps!.jalon)).toEqual(['arrivee', 'commencer', 'email_affiche'])
    expect(vers('/api/test-jalon')[0].corps).toMatchObject({ utm_source: 'ig', utm_medium: 'social' })
    // Jalons une fois par chargement : un second passage par l'accueil n'en renvoie aucun (m6).
    await user.click(screen.getByRole('button', { name: /Recommencer le test/i }))
    await commencerLeTest(user)
    expect(vers('/api/test-jalon')).toHaveLength(3)
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
    expect(vers('/api/test-progression', 'GET')[0].chemin).toBe(`/api/test-progression?jeton=${JETON}`)
    expect(vers('/api/test-jalon')).toHaveLength(0)
    expect(localStorage.getItem('tsa.reprise')).toBe(JETON)
    // La suite sauvegarde avec le jeton repris, sans redemander l'email.
    await repondreN(userEvent.setup(), 1)
    expect(vers('/api/test-progression', 'PUT')[0].corps!.jeton).toBe(JETON)
    expect(screen.queryByTestId('capture-screen')).not.toBeInTheDocument()
  })

  it('reprise : la question s’affiche en haut de page, sans défilement hérité', async () => {
    localStorage.setItem('tsa.reprise', JETON)
    reglage.get = { termine: false, reponses: reponsesServeur(7) }
    const haut = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true })
    try {
      render(<App />)
      await screen.findByText(/Question 8 sur 25/)
      expect(haut).toHaveBeenLastCalledWith(0, 0)
    } finally {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    }
  })

  it('reprise par le lien du courriel (window.h3cContact) quand tsa.reprise est vide', async () => {
    window.h3cContact = () => JETON
    reglage.getC = { termine: false, reponses: reponsesServeur(10), jeton: 'cycle-lien' }
    render(<App />)
    expect(await screen.findByText(/Question 11 sur 25/)).toBeInTheDocument()
    expect(localStorage.getItem('tsa.reprise')).toBe('cycle-lien') // jeton de cycle rendu, jamais le jeton de contact
  })

  it.each([{ termine: true }, 404] as const)('reprise %o : jeton oublié, accueil normal', async (get) => {
    localStorage.setItem('tsa.reprise', JETON)
    reglage.get = get as never
    render(<App />)
    expect(await screen.findByTestId('cta-haut')).toBeInTheDocument()
    expect(localStorage.getItem('tsa.reprise')).toBeNull()
    // Le jalon part d'un effet postérieur à l'affichage (constat M1).
    await waitFor(() => expect(vers('/api/test-jalon').map((a) => a.corps!.jalon)).toEqual(['arrivee']))
    // Réponse définitive : aucune nouvelle tentative.
    expect(vers('/api/test-progression', 'GET')).toHaveLength(1)
  })

  it('reprise : réponses hors questionnaire ignorées, la fin part quand même (constat S1)', async () => {
    localStorage.setItem('tsa.reprise', JETON)
    const r = reponsesServeur(5)
    const q1 = questions[0]
    r.typage['3'] = 'A' // question retirée
    r.typage['29'] = 'A' // question retirée
    r.typage['999'] = 'A' // inconnue
    r.typage[String(q1.id)] = 'Z' // option inexistante : question à reposer
    reglage.get = { termine: false, reponses: r, jeton: JETON }
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText(/Question 1 sur 25/)).toBeInTheDocument()
    await repondreN(user, 25)
    await waitFor(() => expect(vers('/api/test-complete')).toHaveLength(1))
    const corps = vers('/api/test-complete')[0].corps!
    expect(corps.jeton).toBe(JETON)
    const typage = (corps.resultat as { reponsesBrutes: { typage: Record<string, unknown> } }).reponsesBrutes.typage
    expect(Object.keys(typage)).not.toContain('3')
    expect(Object.keys(typage)).not.toContain('999')
  })

  it('tsa.reprise périmé : GET ?jeton= puis ?c= du lien ; le jeton de cycle rendu est adopté (constat M2, contrat v2)', async () => {
    localStorage.setItem('tsa.reprise', 'cycle-perime')
    window.h3cContact = () => JETON
    reglage.get = 404
    reglage.getC = { termine: false, reponses: reponsesServeur(3), jeton: 'cycle-2' }
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText(/Question 4 sur 25/)).toBeInTheDocument()
    expect(vers('/api/test-progression', 'GET').map((a) => a.chemin)).toEqual([
      '/api/test-progression?jeton=cycle-perime',
      `/api/test-progression?c=${encodeURIComponent(JETON)}`,
    ])
    expect(localStorage.getItem('tsa.reprise')).toBe('cycle-2')
    await repondreN(user, 1)
    await waitFor(() => expect(vers('/api/test-progression', 'PUT')[0]?.corps!.jeton).toBe('cycle-2'))
  })

  it('tsa.reprise périmé sans lien : accueil, jeton oublié', async () => {
    localStorage.setItem('tsa.reprise', 'cycle-perime')
    reglage.get = 410
    render(<App />)
    expect(await screen.findByTestId('cta-haut')).toBeInTheDocument()
    expect(localStorage.getItem('tsa.reprise')).toBeNull()
  })

  it('écran de l’email : le focus arrive sur le champ email (constat M4)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    expect(await screen.findByTestId('capture-screen')).toBeInTheDocument()
    expect(document.activeElement?.id).toBe('capture-email')
  })

  it('refus 410 arrivé après la borne : écran de l’email rouvert avec le message, aucun lead (constat S2)', async () => {
    reglage.debut = { status: 410, delai: 2800 }
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    expect(await screen.findByText(/Question 4 sur 25/, {}, { timeout: 4000 })).toBeInTheDocument()
    await repondreN(user, 1)
    expect(await screen.findByText(/supprimée de nos fichiers/, {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByTestId('capture-screen')).toBeInTheDocument()
    expect(leads()).toHaveLength(0)
    reglage.debut = undefined
    await passerLecranCapture(user)
    expect(await screen.findByText(/Question 5 sur 25/)).toBeInTheDocument()
    expect(vers('/api/test-debut')).toHaveLength(2)
    expect(Object.keys((vers('/api/test-debut')[1].corps!.reponses as { typage: object }).typage).length).toBeGreaterThan(0)
    expect(leads()).toHaveLength(1)
  }, 15_000)

  it('jeton arrivé après la borne : un PUT part à l’adoption (constat M6)', async () => {
    reglage.debut = { status: 200, delai: 2800 }
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    expect(await screen.findByText(/Question 4 sur 25/, {}, { timeout: 4000 })).toBeInTheDocument()
    await repondreN(user, 2)
    await waitFor(() => expect(vers('/api/test-progression', 'PUT')).toHaveLength(1), { timeout: 3000 })
    expect(leads()).toHaveLength(1)
  }, 15_000)

  it.each([404, 503])('API sans /api/test-debut (%i) : repli, fin par test-complete avec email, un lead (constat B1)', async (st) => {
    reglage.debut = st
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    await repondreN(user, 22)
    await waitFor(() => expect(vers('/api/test-complete')).toHaveLength(1))
    const corps = vers('/api/test-complete')[0].corps!
    expect(corps.email).toBeTruthy()
    expect(corps).not.toHaveProperty('telephone')
    expect(corps).not.toHaveProperty('consentement_sms')
    expect(Object.keys((corps.resultat as { reponsesBrutes: { typage: object } }).reponsesBrutes.typage)).toHaveLength(16)
    expect(leads()).toHaveLength(1)
  })

  it.each([
    [422, false],
    [429, true],
  ])('fin en repli rendue %i : file=%s ; message exact, aucun lead tant que la fin n’est pas acceptée (m3)', async (st, enFile) => {
    reglage.debut = 404
    reglage.fin = st
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    await repondreN(user, 22)
    await waitFor(() => expect(vers('/api/test-complete')).toHaveLength(1))
    await waitFor(() => expect(screen.queryByText(/conservée sur cet appareil|n’a pas pu être enregistrée/)).not.toBeNull())
    expect(JSON.parse(localStorage.getItem('tsa.pending-captures') ?? '[]')).toHaveLength(enFile ? 1 : 0)
    expect(screen.queryByText(/conservée sur cet appareil/) !== null).toBe(enFile)
    expect(screen.queryByText(/n’a pas pu être enregistrée/) !== null).toBe(!enFile)
    expect(leads()).toHaveLength(0)
  })

  it('jeton tué en cours de Test (PUT 404) : PUT arrêtés, fin par email, un seul lead (S1, v2.1 A)', async () => {
    reglage.put = 404
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    await repondreN(user, 22)
    await waitFor(() => expect(vers('/api/test-complete')).toHaveLength(1))
    expect(vers('/api/test-progression', 'PUT')).toHaveLength(1)
    expect(localStorage.getItem('tsa.reprise')).toBeNull()
    const fin = vers('/api/test-complete')[0].corps!
    expect(fin).not.toHaveProperty('jeton')
    expect(fin).toMatchObject({ consentement_marketing: true })
    expect(fin).toHaveProperty('email')
    expect(leads()).toHaveLength(1)
    expect(screen.queryByText(/n’a pas pu être enregistrée/)).toBeNull()
  })

  it('page rechargée, jeton tué, fin 422 sans email : écran de l’email rouvert, fin par email (S1, v2.1 A)', async () => {
    localStorage.setItem('tsa.reprise', JETON)
    reglage.get = { termine: false, reponses: reponsesServeur(24), jeton: JETON }
    reglage.fin = (c) => (c && c.jeton && !c.email ? 422 : 0)
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByText(/Question 25 sur 25/)).toBeInTheDocument()
    await repondreN(user, 1)
    await passerLecranCapture(user)
    await waitFor(() => expect(vers('/api/test-complete')).toHaveLength(2))
    const [refusee, acceptee] = vers('/api/test-complete')
    expect(refusee.corps).toMatchObject({ jeton: JETON })
    expect(acceptee.corps).not.toHaveProperty('jeton')
    expect(acceptee.corps).toHaveProperty('email')
    expect(Object.keys((acceptee.corps!.resultat as { reponsesBrutes: { typage: object } }).reponsesBrutes.typage)).toHaveLength(16)
    expect(vers('/api/test-debut')).toHaveLength(0)
    expect(await screen.findByRole('button', { name: /Recommencer le test/i })).toBeInTheDocument()
    expect(screen.queryByText(/n’a pas pu être enregistrée/)).toBeNull()
    expect(leads()).toHaveLength(0)
    expect(suivi.mock.calls.filter((c) => c[0] === 'test_termine')).toHaveLength(1)
  })

  it('test-debut rend lead: false : aucun événement lead, même à la fin (S2, v2.1 B)', async () => {
    reglage.lead = false
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    await repondreN(user, 22)
    await waitFor(() => expect(vers('/api/test-complete')).toHaveLength(1))
    expect(leads()).toHaveLength(0)
  })

  it('deux envois de l’écran de l’email dans la même tâche : un seul test-debut (m2)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreN(user, 3)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@exemple.fr')
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
    const b = screen.getByRole('button', { name: /sauvegarder et continuer/i })
    act(() => {
      b.click()
      b.click()
    })
    expect(await screen.findByText(/Question 4 sur 25/)).toBeInTheDocument()
    expect(vers('/api/test-debut')).toHaveLength(1)
    expect(leads()).toHaveLength(1)
  })

  it('test-debut envoie le jeton de cycle que la page tient', async () => {
    localStorage.setItem('tsa.reprise', JETON)
    reglage.get = 503
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByTestId('cta-haut', {}, { timeout: 12_000 })).toBeInTheDocument()
    await commencerLeTest(user)
    // Lecture retentée au clic (contrat v2.1 C), toujours en panne : Test neuf, jeton gardé.
    await screen.findByText(/Question 1 sur 25/, {}, { timeout: 12_000 })
    expect(vers('/api/test-progression?jeton', 'GET').length).toBeGreaterThan(3)
    await repondreN(user, 3)
    await passerLecranCapture(user)
    await waitFor(() => expect(vers('/api/test-debut')).toHaveLength(1))
    expect(vers('/api/test-debut')[0].corps!.jeton).toBe(JETON)
  }, 30_000)

  it('API en panne au chargement puis revenue : le clic de départ reprend le Test gardé (m1)', async () => {
    localStorage.setItem('tsa.reprise', JETON)
    reglage.get = 503
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByTestId('cta-haut', {}, { timeout: 12_000 })).toBeInTheDocument()
    reglage.get = { termine: false, reponses: reponsesServeur(11), jeton: JETON }
    await commencerLeTest(user)
    expect(await screen.findByText(/Question 12 sur 25/, {}, { timeout: 5_000 })).toBeInTheDocument()
    expect(vers('/api/test-debut')).toHaveLength(0)
  }, 20_000)

  describe('reprise en panne réseau : deux nouvelles tentatives', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())
    const panne = () => {
      appels.push({ methode: 'GET', chemin: '/api/test-progression', corps: null })
      return Promise.reject(new TypeError('Failed to fetch'))
    }

    it('succès au 2e essai : reprise sur la 11e, écran d’attente maintenu entre les essais', async () => {
      localStorage.setItem('tsa.reprise', JETON)
      reglage.get = { termine: false, reponses: reponsesServeur(10) }
      vi.mocked(globalThis.fetch)
        .mockImplementationOnce(panne as typeof fetch)
        .mockImplementation(fauxServeur as typeof fetch)
      render(<App />)
      await act(() => vi.advanceTimersByTimeAsync(500))
      expect(screen.getByText(/Chargement de votre Test/)).toBeInTheDocument()
      expect(vers('/api/test-progression', 'GET')).toHaveLength(1)
      await act(() => vi.advanceTimersByTimeAsync(500))
      expect(screen.getByText(/Question 11 sur 25/)).toBeInTheDocument()
      expect(vers('/api/test-progression', 'GET')).toHaveLength(2)
    })

    // Contrat v2 : le jeton de contact du lien n'entre jamais dans tsa.reprise
    // (le bloc de suivi le garde pour la session) ; le jeton de cycle, lui, reste.
    it.each(['tsa.reprise', 'lien ?c='])('trois échecs (%s) : accueil normal, jeton gardé', async (source) => {
      if (source === 'tsa.reprise') localStorage.setItem('tsa.reprise', JETON)
      else window.h3cContact = () => JETON
      vi.mocked(globalThis.fetch).mockImplementation((u, i) =>
        String(u).includes('/api/test-progression') ? panne() : fauxServeur(String(u), i),
      )
      render(<App />)
      await act(() => vi.advanceTimersByTimeAsync(2500))
      expect(screen.getByText(/Chargement de votre Test/)).toBeInTheDocument()
      await act(() => vi.advanceTimersByTimeAsync(500))
      expect(screen.getByTestId('cta-haut')).toBeInTheDocument()
      expect(vers('/api/test-progression', 'GET')).toHaveLength(3)
      expect(localStorage.getItem('tsa.reprise')).toBe(source === 'tsa.reprise' ? JETON : null)
    })
  })
})
