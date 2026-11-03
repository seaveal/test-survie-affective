import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReponseRv } from '../src/domain/rv/types'
import AppRV from '../src/rv/AppRV'
import { questionsRv } from '../src/rv/questions'
import { RESTITUTIONS_RV } from '../src/rv/restitutions'
import { TEXTES_RV } from '../src/rv/textes'

/**
 * Parcours entier du bilan RETROUVEZ-VOUS (SPEC §3), avec le même faux serveur
 * que tests/e2e.test.tsx (helpers copiés, aucun import croisé avec le test du Test),
 * plus la route /api/rv-complete.
 */

const JETON = 'h1.' + 'b'.repeat(40)
const EMAIL = 'cyrille+rv@cyrillenovou.com'
type Appel = { methode: string, chemin: string, corps: Record<string, unknown> | null }
let appels: Appel[]
let reglage: {
  debut?: number | 'reseau' | { status: number, delai: number }
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
  if (u.pathname === '/api/rv-complete') {
    const fin = typeof reglage.fin === 'function' ? reglage.fin(corps) : reglage.fin
    if (fin) return Promise.resolve(repondre(fin))
    return Promise.resolve(repondre(200, { contact_id: 'c', bilan_id: 'b', priorite: 'attachement', priorite_2: 'securite', scores: {} }))
  }
  return Promise.resolve(repondre(200, { ok: true }))
}

const vers = (chemin: string, methode = 'POST') =>
  appels.filter((a) => a.chemin.startsWith(chemin) && a.methode === methode)
const leads = () => suivi.mock.calls.filter((c) => c[0] === 'lead')

const LIBELLES = ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Presque toujours']

// realite 5 · attachement 20 · securite 4 réponses (16 × 5/4 = 20, ex æquo) ·
// autonomie 0 · identite 3 réponses (incomplet).
const PLAN: ReponseRv[] = [
  1, 1, 1, 1, 1,
  4, 4, 4, 4, 4,
  4, 4, 4, 4, null,
  0, 0, 0, 0, 0,
  null, null, 2, 2, 2,
]
const REPONSES_PLAN = Object.fromEntries(questionsRv.map((q, i) => [q.id, PLAN[i]]))

async function repondreQ(user: ReturnType<typeof userEvent.setup>, v: ReponseRv) {
  await user.click(screen.getByRole('button', { name: v === null ? 'Je préfère ne pas répondre' : LIBELLES[v] }))
}

async function passerLecranCapture(user: ReturnType<typeof userEvent.setup>, cocher = true) {
  expect(screen.getByTestId('capture-screen')).toBeInTheDocument()
  await user.type(screen.getByRole('textbox', { name: /email/i }), EMAIL)
  if (cocher) await user.click(screen.getByLabelText(/textes de Cyrille Novou/i))
  await user.click(screen.getByRole('button', { name: 'Sauvegarder et continuer' }))
}

async function finDuBilan(user: ReturnType<typeof userEvent.setup>, s1: string, depuis = 3) {
  for (const v of PLAN.slice(depuis)) await repondreQ(user, v)
  await user.click(screen.getByRole('button', { name: 'La relation est terminée depuis moins de six mois' }))
  await user.click(screen.getByRole('button', { name: "Je veux m'y mettre maintenant" }))
  expect(screen.getByTestId('securite')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: s1 }))
}

async function parcours(user: ReturnType<typeof userEvent.setup>, s1 = 'Non', cocher = true) {
  await user.click(screen.getByTestId('cta-haut'))
  for (const v of PLAN.slice(0, 3)) await repondreQ(user, v)
  await passerLecranCapture(user, cocher)
  expect(await screen.findByText(/Question 4 sur 28/)).toBeInTheDocument()
  await finDuBilan(user, s1)
}

/** La réponse de sécurité n'existe nulle part hors de l'écran : ni corps, ni stockage. */
function attendreS1Absente() {
  const corps = appels.map((a) => JSON.stringify(a.corps ?? {})).join('\n')
  expect(corps).not.toMatch(/securite|S1|"oui"|"non"|sans_reponse|danger/i)
  for (const stock of [localStorage, sessionStorage]) {
    for (let k = 0; k < stock.length; k++) {
      const cle = stock.key(k) as string
      // Seules clés admises : le jeton du cycle et la file des fins (SPEC §1 et §3).
      expect(['rv.reprise', 'rv.fin-en-attente']).toContain(cle)
      expect(stock.getItem(cle)).not.toMatch(/securite|S1|"oui"|"non"|sans_reponse/i)
    }
  }
}

describe('e2e RETROUVEZ-VOUS', () => {
  beforeEach(() => {
    appels = []
    reglage = {}
    suivi = vi.fn()
    localStorage.clear()
    sessionStorage.clear()
    window.history.pushState({}, '', '/retrouvez-vous?utm_source=youtube&utm_medium=video&utm_campaign=retrouvez-vous')
    vi.spyOn(globalThis, 'fetch').mockImplementation(fauxServeur as typeof fetch)
    window.h3cTrack = suivi
    window.h3cEventId = () => 'evt-1'
    window.h3cFb = () => ({ fbp: 'fb.1.x', fbc: 'fb.1.y' })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    window.history.pushState({}, '', '/')
    delete window.h3cTrack
    delete window.h3cEventId
    delete window.h3cFb
    delete window.h3cContact
  })

  it('accueil : titre et sous-titre fixes, deux boutons « Commencer mon bilan »', () => {
    render(<AppRV />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Et vous ? Comment réussissez-vous si bien à tomber dans le panneau ?',
    )
    expect(screen.getByText("Vous avez compris ce qui s'est passé. Et pourtant, c'est encore aussi difficile.")).toBeInTheDocument()
    expect(screen.getByTestId('cta-haut')).toHaveTextContent('Commencer mon bilan')
    expect(screen.getByTestId('cta-bas')).toHaveTextContent('Commencer mon bilan')
    expect(screen.getByText(/Le bilan RETROUVEZ-VOUS et le programme/)).toBeInTheDocument()
  })

  it('parcours complet : email à la 3e, 25 + 2 questions, « Je préfère ne pas répondre » accepté, rv-complete, bouton rdv-retrouvez', async () => {
    const user = userEvent.setup()
    render(<AppRV />)
    await user.click(screen.getByTestId('cta-haut'))
    await repondreQ(user, PLAN[0])
    await repondreQ(user, PLAN[1])
    // La question neuve prend le focus, reliée à ses réponses (FRONT-08).
    expect(document.activeElement).toHaveTextContent(questionsRv[2].enonce)
    expect(screen.getByRole('list')).toHaveAccessibleName(questionsRv[2].enonce)
    expect(screen.queryByTestId('capture-screen')).toBeNull()
    await repondreQ(user, PLAN[2])
    expect(screen.getByRole('heading', { name: 'Où voulez-vous recevoir votre bilan ?' })).toBeInTheDocument()
    await passerLecranCapture(user)
    expect(await screen.findByText(/Question 4 sur 28/)).toBeInTheDocument()

    const [debut] = vers('/api/test-debut')
    expect(vers('/api/test-debut')).toHaveLength(1)
    expect(debut.corps).toMatchObject({
      email: EMAIL,
      consentement_marketing: true,
      event_id: 'evt-1',
      utm: { source: 'youtube', medium: 'video', campaign: 'retrouvez-vous' },
      fbp: 'fb.1.x',
      fbc: 'fb.1.y',
    })
    expect(debut.corps!.reponses).toEqual({
      jeu: 'rv',
      v: 1,
      reponses: { Q01: 1, Q02: 1, Q03: 1 },
      situation: null,
      pret_a_agir: null,
    })
    expect(localStorage.getItem('rv.reprise')).toBe(JETON)
    expect(localStorage.getItem('tsa.reprise')).toBeNull()
    expect(leads()).toEqual([['lead', { event_id: 'evt-1' }]])

    await finDuBilan(user, 'Non')

    // Résultat : priorité (ex æquo tranché par l'ordre), seconde priorité, cinq scores.
    expect(await screen.findByTestId('priorite-titre')).toHaveTextContent(RESTITUTIONS_RV.priorites.attachement.titre)
    expect(screen.getByText('Votre priorité')).toBeInTheDocument()
    expect(screen.getByTestId('priorite-2')).toHaveTextContent(RESTITUTIONS_RV.priorites.securite.titre)
    // Seconde priorité : sa phrase `seconde` du canonique, jamais la restitution de la première (FRONT-05).
    expect(screen.getByTestId('priorite-2')).toHaveTextContent(RESTITUTIONS_RV.priorites.securite.seconde)
    expect(screen.getByTestId('priorite-2')).not.toHaveTextContent(RESTITUTIONS_RV.priorites.securite.ecran)
    expect(screen.getByTestId('score-realite')).toHaveTextContent('5/20 · Ressources disponibles')
    expect(screen.getByTestId('score-attachement')).toHaveTextContent('20/20 · Difficultés très présentes')
    expect(screen.getByTestId('score-securite')).toHaveTextContent('20/20 · Difficultés très présentes')
    expect(screen.getByTestId('score-autonomie')).toHaveTextContent('0/20 · Ressources disponibles')
    expect(screen.getByTestId('score-identite')).toHaveTextContent('Résultat incomplet')
    const rdv = screen.getByTestId('rdv-bouton')
    expect(rdv).toHaveAttribute('href', 'https://h3c.fr/rdv-retrouvez')
    expect(rdv).toHaveTextContent('Réserver mon appel de 30 minutes')
    expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('https://h3c.fr/'))).toHaveLength(1)
    expect(screen.queryByTestId('urgence')).toBeNull()

    await waitFor(() => expect(vers('/api/rv-complete')).toHaveLength(1))
    const fin = vers('/api/rv-complete')[0].corps!
    expect(Object.keys(fin).sort()).toEqual([
      'consentement_marketing', 'email', 'event_id', 'fbc', 'fbp', 'jeton', 'landing_url', 'pret_a_agir', 'reponses', 'situation', 'utm',
    ])
    expect(fin).toMatchObject({
      jeton: JETON,
      email: EMAIL,
      consentement_marketing: true,
      situation: 'separe_recent',
      pret_a_agir: 'maintenant',
      utm: { source: 'youtube', medium: 'video', campaign: 'retrouvez-vous' },
    })
    expect(fin.landing_url).toContain('/retrouvez-vous')
    expect(fin.reponses).toEqual(REPONSES_PLAN)
    expect(vers('/api/test-complete')).toHaveLength(0)

    // Une sauvegarde par réponse après l'email, C2 comprise (24), avec le dernier état.
    const puts = vers('/api/test-progression', 'PUT')
    expect(puts).toHaveLength(24)
    expect(puts.at(-1)!.corps).toEqual({
      jeton: JETON,
      reponses: { jeu: 'rv', v: 1, reponses: REPONSES_PLAN, situation: 'separe_recent', pret_a_agir: 'maintenant' },
    })
    expect(vers('/api/test-jalon').map((a) => a.corps!.jalon)).toEqual([
      'rv_arrivee', 'rv_commencer', 'rv_email_affiche',
    ]) // `rv_email_donne` et `rv_test_fini` sont comptés par le serveur (test-debut, rv-complete).
    expect(leads()).toHaveLength(1)
    expect(await screen.findByText(TEXTES_RV.resultat.emailOk)).toBeInTheDocument()
    await waitFor(() => expect(localStorage.getItem('rv.reprise')).toBeNull())
    attendreS1Absente()
  })

  it('sécurité « Oui » : le bloc d’urgence remplace le bouton, rien d’enregistré, la fin part quand même', async () => {
    const user = userEvent.setup()
    render(<AppRV />)
    await parcours(user, 'Oui')
    const urgence = await screen.findByTestId('urgence')
    expect(screen.queryByTestId('rdv-bouton')).toBeNull()
    for (const n of ['17', '112', '114', '3919', '116 006']) expect(urgence).toHaveTextContent(n)
    expect(screen.getByRole('link', { name: '3919' })).toHaveAttribute('href', 'tel:3919')
    expect(screen.getByRole('link', { name: '114' })).toHaveAttribute('href', 'sms:114')
    // Rien d'autre ne change : priorité et scores restent affichés.
    expect(screen.getByTestId('priorite-titre')).toHaveTextContent(RESTITUTIONS_RV.priorites.attachement.titre)
    expect(screen.getByTestId('scores')).toBeInTheDocument()
    await waitFor(() => expect(vers('/api/rv-complete')).toHaveLength(1))
    expect(vers('/api/rv-complete')[0].corps!.reponses).toEqual(REPONSES_PLAN)
    attendreS1Absente()
  })

  it('sécurité « Je préfère ne pas répondre » : l’appel reste proposé', async () => {
    const user = userEvent.setup()
    render(<AppRV />)
    await parcours(user, 'Je préfère ne pas répondre')
    expect(await screen.findByTestId('rdv-bouton')).toBeInTheDocument()
    expect(screen.queryByTestId('urgence')).toBeNull()
    attendreS1Absente()
  })

  it('aucune réponse comptée : priorité « incomplet », cinq « Résultat incomplet », appel proposé', async () => {
    const user = userEvent.setup()
    render(<AppRV />)
    await user.click(screen.getByTestId('cta-haut'))
    for (let i = 0; i < 3; i++) await repondreQ(user, null)
    await passerLecranCapture(user)
    await screen.findByText(/Question 4 sur 28/)
    for (let i = 3; i < 25; i++) await repondreQ(user, null)
    await user.click(screen.getByRole('button', { name: 'Je suis encore dans cette relation' }))
    await user.click(screen.getByRole('button', { name: 'Je ne sais pas encore' }))
    await user.click(screen.getByRole('button', { name: 'Non' }))
    expect(await screen.findByTestId('priorite-titre')).toHaveTextContent(RESTITUTIONS_RV.priorites.incomplet.titre)
    expect(screen.getAllByText('Résultat incomplet')).toHaveLength(5)
    expect(screen.queryByTestId('priorite-2')).toBeNull()
    expect(screen.getByTestId('rdv-bouton')).toBeInTheDocument()
    await waitFor(() => expect(vers('/api/rv-complete')).toHaveLength(1))
    const fin = vers('/api/rv-complete')[0].corps!
    expect(Object.values(fin.reponses as object)).toEqual(Array(25).fill(null))
    expect(fin).toMatchObject({ situation: 'en_relation', pret_a_agir: 'incertain' })
  })

  it('case laissée vide : la suite est reproposée sur le résultat, un clic l’enregistre', async () => {
    const user = userEvent.setup()
    render(<AppRV />)
    await parcours(user, 'Non', false)
    await user.click(await screen.findByTestId('suite-accepter'))
    expect(await screen.findByTestId('suite-ok')).toBeInTheDocument()
    expect(vers('/api/test-consentement').map((a) => a.corps)).toEqual([{ jeton: JETON }])
    expect(vers('/api/rv-complete')[0].corps).toMatchObject({ consentement_marketing: false })
  })

  it('question précédente : la sécurité revient à C2, la réponse changée part dans la fin', async () => {
    const user = userEvent.setup()
    render(<AppRV />)
    await user.click(screen.getByTestId('cta-haut'))
    for (const v of PLAN.slice(0, 3)) await repondreQ(user, v)
    await passerLecranCapture(user)
    await screen.findByText(/Question 4 sur 28/)
    for (const v of PLAN.slice(3)) await repondreQ(user, v)
    await user.click(screen.getByRole('button', { name: 'La relation est terminée depuis moins de six mois' }))
    await user.click(screen.getByRole('button', { name: "Je veux m'y mettre maintenant" }))
    expect(screen.getByText(/Question 28 sur 28/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Question précédente/ }))
    expect(screen.getByText(/Question 27 sur 28/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Je veux m'y mettre maintenant" })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Je ne sais pas encore' }))
    await user.click(screen.getByRole('button', { name: 'Non' }))
    await waitFor(() => expect(vers('/api/rv-complete')).toHaveLength(1))
    expect(vers('/api/rv-complete')[0].corps).toMatchObject({ pret_a_agir: 'incertain' })
  })

  it.each([422, 410] as const)('refus %i de test-debut : message à l’écran, rien gardé', async (status) => {
    reglage.debut = status
    const user = userEvent.setup()
    render(<AppRV />)
    await user.click(screen.getByTestId('cta-haut'))
    for (const v of PLAN.slice(0, 3)) await repondreQ(user, v)
    await passerLecranCapture(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTES_RV.refus[status])
    expect(screen.getByTestId('capture-screen')).toBeInTheDocument()
    expect(localStorage.getItem('rv.reprise')).toBeNull()
    expect(leads()).toHaveLength(0)
  })

  it('test-debut en panne : le bilan continue, fin par email, un lead à la fin', async () => {
    reglage.debut = 503
    const user = userEvent.setup()
    render(<AppRV />)
    await parcours(user)
    await waitFor(() => expect(vers('/api/rv-complete')).toHaveLength(1))
    const fin = vers('/api/rv-complete')[0].corps!
    expect(fin).not.toHaveProperty('jeton')
    expect(fin).toMatchObject({ email: EMAIL, event_id: 'evt-1' })
    expect(vers('/api/test-progression', 'PUT')).toHaveLength(0)
    await waitFor(() => expect(leads()).toEqual([['lead', { event_id: 'evt-1' }]]))
  })

  it('reprise par le lien du courriel : 10 réponses, on rouvre sur la 11e, sans email redemandé', async () => {
    window.h3cContact = () => JETON
    const reponses = Object.fromEntries(questionsRv.slice(0, 10).map((q, i) => [q.id, PLAN[i]]))
    reglage.getC = { termine: false, reponses: { jeu: 'rv', v: 1, reponses, situation: null, pret_a_agir: null }, jeton: 'cycle-lien' }
    const user = userEvent.setup()
    render(<AppRV />)
    expect(screen.getByText(TEXTES_RV.chargement)).toBeInTheDocument()
    expect(await screen.findByText(/Question 11 sur 28/)).toBeInTheDocument()
    expect(localStorage.getItem('rv.reprise')).toBe('cycle-lien')
    expect(vers('/api/test-jalon')).toHaveLength(0)
    await repondreQ(user, 3)
    expect(screen.queryByTestId('capture-screen')).toBeNull()
    await waitFor(() => expect(vers('/api/test-progression', 'PUT')).toHaveLength(1))
    expect(vers('/api/test-progression', 'PUT')[0].corps).toMatchObject({ jeton: 'cycle-lien', reponses: { jeu: 'rv' } })
  })

  it('reprise : un cycle du Test de Survie Affective est ignoré, accueil normal', async () => {
    window.h3cContact = () => JETON
    reglage.getC = { termine: false, reponses: { typage: { 1: 'A' }, intensite: {}, contexte: {}, v: 2 }, jeton: 'cycle-test' }
    render(<AppRV />)
    expect(await screen.findByTestId('cta-haut')).toBeInTheDocument()
    expect(localStorage.getItem('rv.reprise')).toBeNull()
  })

  it('reprise par rv.reprise : valeur hors échelle ignorée, « je préfère ne pas répondre » gardé', async () => {
    localStorage.setItem('rv.reprise', JETON)
    reglage.get = { termine: false, reponses: { jeu: 'rv', v: 1, reponses: { Q01: 2, Q02: null, Q03: 9 }, situation: 'ailleurs', pret_a_agir: null } }
    render(<AppRV />)
    expect(await screen.findByText(/Question 3 sur 28/)).toBeInTheDocument()
    expect(vers('/api/test-progression', 'GET')[0].chemin).toBe(`/api/test-progression?jeton=${JETON}`)
  })

  it('page rechargée, jeton tué, fin 404 sans email : écran de l’email rouvert, fin par email', async () => {
    localStorage.setItem('rv.reprise', JETON)
    reglage.get = { termine: false, reponses: { jeu: 'rv', v: 1, reponses: REPONSES_PLAN, situation: 'separe_ancien', pret_a_agir: null }, jeton: JETON }
    reglage.fin = (c) => (c && c.jeton && !c.email ? 404 : 0)
    const user = userEvent.setup()
    render(<AppRV />)
    expect(await screen.findByText(/Question 27 sur 28/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Je veux m\'y mettre maintenant' }))
    await user.click(screen.getByRole('button', { name: 'Non' }))
    await passerLecranCapture(user)
    await waitFor(() => expect(vers('/api/rv-complete')).toHaveLength(2))
    const [refusee, acceptee] = vers('/api/rv-complete')
    expect(refusee.corps).toMatchObject({ jeton: JETON })
    expect(acceptee.corps).not.toHaveProperty('jeton')
    expect(acceptee.corps).toMatchObject({ email: EMAIL, situation: 'separe_ancien', pret_a_agir: 'maintenant', reponses: REPONSES_PLAN })
    expect(await screen.findByTestId('rdv-bouton')).toBeInTheDocument()
    expect(vers('/api/test-debut')).toHaveLength(0)
  })

  it('envoi raté (503) : fin rangée dans rv.fin-en-attente, rejouée au chargement suivant', async () => {
    reglage.fin = 503
    const user = userEvent.setup()
    const { unmount } = render(<AppRV />)
    await parcours(user)
    expect(await screen.findByTestId('resultat-attente')).toBeInTheDocument()
    expect(screen.getByText(TEXTES_RV.resultat.emailFile)).toBeInTheDocument() // FRONT-11
    expect(screen.queryByText(TEXTES_RV.resultat.spams)).toBeNull()
    const file = JSON.parse(localStorage.getItem('rv.fin-en-attente') ?? '[]')
    expect(file).toHaveLength(1)
    expect(file[0]).toMatchObject({ jeton: JETON, reponses: REPONSES_PLAN })
    attendreS1Absente()
    unmount()
    reglage.fin = undefined
    render(<AppRV />)
    await waitFor(() => expect(vers('/api/rv-complete')).toHaveLength(2))
    expect(vers('/api/rv-complete')[1].corps).toEqual(file[0])
    await waitFor(() => expect(localStorage.getItem('rv.fin-en-attente')).toBe('[]'))
    // La fin rejouée part AVANT la lecture de reprise : le cycle clos n'est jamais rouvert
    // à la question 27 (FRONT-04).
    expect(await screen.findByTestId('cta-haut')).toBeInTheDocument()
    const ordre = appels.map((a) => `${a.methode} ${a.chemin.split('?')[0]}`)
    expect(ordre.lastIndexOf('POST /api/rv-complete')).toBeLessThan(ordre.lastIndexOf('GET /api/test-progression'))
  })

  it('fin refusée (422) : rien en file, l’écran le dit', async () => {
    reglage.fin = 422
    const user = userEvent.setup()
    render(<AppRV />)
    await parcours(user)
    expect(await screen.findByText(TEXTES_RV.resultat.emailRefus)).toBeInTheDocument()
    expect(localStorage.getItem('rv.fin-en-attente')).toBeNull()
  })

  it('« Recommencer le bilan » : file des fins et jeton vidés, accueil', async () => {
    const user = userEvent.setup()
    render(<AppRV />)
    await parcours(user)
    localStorage.setItem('rv.fin-en-attente', JSON.stringify([{ email: 'x@y.z' }]))
    localStorage.setItem('rv.reprise', 'jeton-perime')
    await user.click(await screen.findByRole('button', { name: 'Recommencer le bilan' }))
    expect(localStorage.getItem('rv.fin-en-attente')).toBe('[]')
    expect(localStorage.getItem('rv.reprise')).toBeNull()
    expect(screen.getByTestId('cta-haut')).toBeInTheDocument()
  })

  it('main.tsx : /retrouvez-vous/ aiguillé vers le bilan, titre et description posés', async () => {
    window.history.pushState({}, '', '/retrouvez-vous/')
    const racine = document.createElement('div')
    racine.id = 'root'
    document.body.append(racine)
    try {
      await import('../src/main')
      expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(TEXTES_RV.accueil.titre)
      expect(document.title).toBe("RETROUVEZ-VOUS, le bilan après une relation d'emprise · Cyrille Novou")
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', TEXTES_RV.meta.description)
    } finally {
      racine.remove()
    }
  })
})
