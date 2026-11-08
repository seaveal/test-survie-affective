// Parcours de la page /rdv/ contre une API simulée : chaque échec prévu par le contrat
// (PLAN du chantier RDV page maison, « Contrat de l'API ») et les fuseaux de la règle unique.
// Aucune requête ne sort : tout ce qui n'est pas localhost est simulé ou coupé.
import { expect, test, type Page, type Request } from '@playwright/test'

const API = 'https://api.souverainauquotidien.com'
const ms = (iso: string) => Date.parse(iso)
// Vendredi 6/11/2026 : 18:30 et 19:00 à Paris (UTC+1) ; samedi 7/11 10:00.
const CRENEAUX = [ms('2026-11-06T17:30:00Z'), ms('2026-11-06T18:00:00Z'), ms('2026-11-07T09:00:00Z')]

interface Reponse { status: number; body?: unknown; delai?: number }
interface Options {
  creneaux?: number[] | 'panne' | Reponse
  reserver?: Reponse[]
  email?: string | null
  doublon?: boolean
}
interface Journal { reserver: Record<string, unknown>[]; creneaux: number; email: Record<string, unknown>[]; ycbm: string[]; verifier: Record<string, unknown>[] }

async function simuler(page: Page, o: Options = {}): Promise<Journal> {
  const j: Journal = { reserver: [], creneaux: 0, email: [], ycbm: [], verifier: [] }
  const reponses = [...(o.reserver ?? [{ status: 200 }])]
  await page.route(/^https?:\/\/(?!localhost)/, async (route, req: Request) => {
    const u = new URL(req.url())
    if (u.hostname.endsWith('youcanbook.me')) {
      j.ycbm.push(req.url())
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Agenda YouCanBookMe</h1>' })
    }
    if (u.origin !== API) return route.abort()
    if (u.pathname === '/api/rdv/creneaux') {
      j.creneaux++
      const c = o.creneaux ?? CRENEAUX
      if (c === 'panne') return route.abort('connectionrefused')
      if (!Array.isArray(c)) return route.fulfill({ status: c.status, json: c.body })
      return route.fulfill({ status: 200, json: { creneaux: c, duree_min: 45, page: 'https://cyrillenovou-45mn.youcanbook.me/' } })
    }
    if (u.pathname === '/api/rdv/reserver') {
      const corps = req.postDataJSON() as Record<string, unknown>
      j.reserver.push(corps)
      const r = reponses.length > 1 ? reponses.shift()! : reponses[0]
      if (r.delai) await new Promise((fin) => setTimeout(fin, r.delai))
      const body = r.status === 200 ? { ok: true, creneau: corps.creneau, fuseau: corps.fuseau, event_id: 'evt-1', ...(r.body as object) } : r.body
      return route.fulfill({ status: r.status, json: body })
    }
    if (u.pathname === '/api/rdv/verifier') {
      j.verifier.push(req.postDataJSON() as Record<string, unknown>)
      return route.fulfill({ status: 200, json: { deja_demande: o.doublon ?? false } })
    }
    if (u.pathname === '/api/rdv/email') {
      j.email.push(req.postDataJSON() as Record<string, unknown>)
      return route.fulfill({ status: 200, json: { email: o.email ?? null } })
    }
    return route.fulfill({ status: 204, body: '' }) // jalons, page-view
  })
  return j
}

async function ouvrir(page: Page, chemin = '/rdv/') {
  await page.goto(chemin)
  await page.locator('#h3c-refuse').click({ timeout: 3000 }).catch(() => {})
  if (await page.getByTestId('cta-haut').count()) await page.getByTestId('cta-haut').click()
}

const continuer = (page: Page) => page.getByRole('button', { name: 'Continuer' }).click()

async function jusquAuCreneau(page: Page, { provenance = true, attendre = true } = {}) {
  await page.getByLabel('Quel est votre prénom ?').fill('Jane')
  await continuer(page)
  await page.getByLabel('Quelle situation relationnelle souhaitez-vous travailler ?').fill('Je rejoue le même scénario.')
  await continuer(page)
  await page.getByRole('radio', { name: 'Plus de 2 ans' }).click()
  await expect(page.getByRole('heading', { name: 'Qu’aimeriez-vous vivre autrement ?' })).toBeVisible()
  await continuer(page)
  await page.getByLabel('Votre nom').fill('Doe')
  await page.getByLabel('Votre adresse e-mail').fill('jane@example.com')
  await page.getByLabel('Votre numéro de téléphone').fill('06 12 34 56 78')
  await continuer(page)
  if (provenance) await page.getByRole('radio', { name: 'je ne sais plus' }).click()
  if (attendre) await expect(page.getByRole('heading', { name: 'Choisissez le créneau de votre rendez-vous' })).toBeVisible()
}

test('parcours complet à Paris : une demande, la confirmation, rien de redemandé', async ({ page }) => {
  const j = await simuler(page)
  await ouvrir(page)
  await jusquAuCreneau(page)
  await expect(page.getByText('heure de Paris')).toBeVisible()
  await expect(page.getByText('Jane Doe')).toBeVisible()
  await page.getByRole('radio', { name: '18:30' }).click()
  await page.getByRole('button', { name: 'Demander ce créneau' }).click()
  await expect(page.getByText('Votre demande est bien envoyée.', { exact: false })).toBeVisible()
  await expect(page.getByText('vendredi 6 novembre à 18:30 (heure de Paris)')).toBeVisible()
  expect(j.reserver).toHaveLength(1)
  const c = j.reserver[0]
  expect(c).toMatchObject({
    prenom: 'Jane', nom: 'Doe', email: 'jane@example.com', telephone: '06 12 34 56 78',
    situation: 'Je rejoue le même scénario.', anciennete: 'Plus de 2 ans', objectif: '',
    provenance: 'je ne sais plus', origine: '', creneau: CRENEAUX[0], fuseau: 'Europe/Paris',
    sms_rappels: false, site_web: '',
  })
  expect(typeof c.cle).toBe('string')
  expect(c.duree_ms as number).toBeGreaterThan(0)
})

test('lien avec un code h3c : pas de question de provenance, ORIGINE transmise', async ({ page }) => {
  const j = await simuler(page)
  await ouvrir(page, '/rdv/?h3c=zRH7M')
  await jusquAuCreneau(page, { provenance: false })
  await page.getByRole('radio', { name: '19:00' }).click()
  await page.getByRole('button', { name: 'Demander ce créneau' }).click()
  await expect(page.getByText('Votre demande est bien envoyée.', { exact: false })).toBeVisible()
  expect(j.reserver[0]).toMatchObject({ origine: 'zRH7M', provenance: '', creneau: CRENEAUX[1] })
})

test('créneau pris (410 à la confirmation) : message, créneaux relus, réponses gardées', async ({ page }) => {
  const j = await simuler(page, {
    reserver: [{ status: 410, body: { detail: { code: 'creneau_pris' } } }, { status: 200 }],
  })
  await ouvrir(page)
  await jusquAuCreneau(page)
  const avant = j.creneaux
  await page.getByRole('radio', { name: '18:30' }).click()
  await page.getByRole('button', { name: 'Demander ce créneau' }).click()
  await expect(page.getByText('Ce créneau vient d’être pris.', { exact: false })).toBeVisible()
  await expect.poll(() => j.creneaux).toBeGreaterThan(avant)
  await page.getByRole('radio', { name: '19:00' }).click()
  await page.getByRole('button', { name: 'Demander ce créneau' }).click()
  await expect(page.getByText('Votre demande est bien envoyée.', { exact: false })).toBeVisible()
  expect(j.reserver).toHaveLength(2)
  expect(j.reserver[1]).toMatchObject({ situation: 'Je rejoue le même scénario.', creneau: CRENEAUX[1] })
  expect(j.reserver[1].cle).not.toBe(j.reserver[0].cle)
})

test('téléphone refusé (422) : retour à l\'écran des coordonnées, puis demande acceptée', async ({ page }) => {
  const j = await simuler(page, {
    reserver: [
      { status: 422, body: { detail: { code: 'champ_refuse', champ: 'telephone', message: 'Ce numéro n’est pas un mobile valide.' } } },
      { status: 200 },
    ],
  })
  await ouvrir(page)
  await jusquAuCreneau(page)
  await page.getByRole('radio', { name: '18:30' }).click()
  await page.getByRole('button', { name: 'Demander ce créneau' }).click()
  await expect(page.getByRole('heading', { name: 'Vos coordonnées' })).toBeVisible()
  await expect(page.getByText('Ce numéro n’est pas un mobile valide.')).toBeVisible()
  await page.getByLabel('Votre numéro de téléphone').fill('+33 6 98 76 54 32')
  await continuer(page)
  await page.getByRole('radio', { name: 'je ne sais plus' }).click()
  await page.getByRole('radio', { name: '18:30' }).click()
  await page.getByRole('button', { name: 'Demander ce créneau' }).click()
  await expect(page.getByText('Votre demande est bien envoyée.', { exact: false })).toBeVisible()
  expect(j.reserver[1]).toMatchObject({ telephone: '+33 6 98 76 54 32' })
})

test('serveur injoignable : repli vers YouCanBookMe pré-rempli de tout', async ({ page }) => {
  const j = await simuler(page, { creneaux: 'panne' })
  await ouvrir(page, '/rdv/?h3c=zRH7M')
  await jusquAuCreneau(page, { provenance: false })
  await expect(page.getByText('Agenda YouCanBookMe')).toBeVisible({ timeout: 20_000 })
  const u = new URL(j.ycbm.at(-1)!)
  expect(u.origin + u.pathname).toBe('https://cyrillenovou-45mn.youcanbook.me/')
  expect(Object.fromEntries(u.searchParams)).toEqual({
    FNAME: 'Jane', LNAME: 'Doe', EMAIL: 'jane@example.com', PHONE: '06 12 34 56 78',
    SITUATION: 'Je rejoue le même scénario.', Q6: 'Plus de 2 ans', ORIGINE: 'zRH7M',
  })
  expect(j.reserver).toHaveLength(0)
})

test('drapeau éteint : la page renvoie aussitôt vers l\'agenda indiqué par le serveur', async ({ page }) => {
  const j = await simuler(page, {
    creneaux: { status: 503, body: { detail: { code: 'inactive', page: 'https://cyrillenovou-45mn.youcanbook.me/' } } },
  })
  await ouvrir(page, '/rdv/?h3c=abc&EMAIL=jane%40example.com')
  await expect(page.getByText('Agenda YouCanBookMe')).toBeVisible()
  const u = new URL(j.ycbm.at(-1)!)
  expect(u.hostname).toBe('cyrillenovou-45mn.youcanbook.me')
  expect(u.searchParams.get('ORIGINE')).toBe('abc')
})

test('double clic : une seule demande envoyée', async ({ page }) => {
  const j = await simuler(page, { reserver: [{ status: 200, delai: 800 }] })
  await ouvrir(page)
  await jusquAuCreneau(page)
  await page.getByRole('radio', { name: '18:30' }).click()
  await page.getByRole('button', { name: 'Demander ce créneau' }).dblclick()
  await expect(page.getByText('Votre demande est bien envoyée.', { exact: false })).toBeVisible()
  expect(j.reserver).toHaveLength(1)
})

test('rechargement en cours de parcours et geste retour : rien n\'est perdu', async ({ page }) => {
  await simuler(page)
  await ouvrir(page)
  await page.getByLabel('Quel est votre prénom ?').fill('Jane')
  await continuer(page)
  await page.getByLabel('Quelle situation relationnelle souhaitez-vous travailler ?').fill('Ma situation')
  await continuer(page)
  await expect(page.getByRole('heading', { name: 'Depuis combien de temps cette difficulté est-elle présente ?' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Depuis combien de temps cette difficulté est-elle présente ?' })).toBeVisible()
  await page.goBack()
  await expect(page.getByLabel('Quelle situation relationnelle souhaitez-vous travailler ?')).toHaveValue('Ma situation')
  await page.goBack()
  await expect(page.getByLabel('Quel est votre prénom ?')).toHaveValue('Jane')
})

test('adresse du lien (?EMAIL=) : pré-remplie, modifiable, retirée de l\'adresse', async ({ page }) => {
  await simuler(page)
  await ouvrir(page, '/rdv/?EMAIL=jane%40example.com')
  await expect.poll(() => new URL(page.url()).searchParams.has('EMAIL')).toBe(false)
  await page.getByLabel('Quel est votre prénom ?').fill('Jane')
  await continuer(page)
  await page.getByLabel('Quelle situation relationnelle souhaitez-vous travailler ?').fill('x')
  await continuer(page)
  await page.getByRole('radio', { name: 'Plus de 2 ans' }).click()
  await expect(page.getByRole('heading', { name: 'Qu’aimeriez-vous vivre autrement ?' })).toBeVisible()
  await continuer(page)
  await expect(page.getByLabel('Votre adresse e-mail')).toHaveValue('jane@example.com')
})

test('jeton de contact (?c=) : l\'adresse vient du serveur', async ({ page }) => {
  const j = await simuler(page, { email: 'connue@example.com' })
  await ouvrir(page, `/rdv/?c=h1.${'A'.repeat(40)}`)
  // L'arrivée appelle /api/rdv/email (deux fois en développement : StrictMode).
  await expect.poll(() => j.email.length).toBeGreaterThanOrEqual(1)
  expect(j.email[0].contact).toBe(`h1.${'A'.repeat(40)}`)
  await page.getByLabel('Quel est votre prénom ?').fill('Jane')
  await continuer(page)
  await page.getByLabel('Quelle situation relationnelle souhaitez-vous travailler ?').fill('x')
  await continuer(page)
  await page.getByRole('radio', { name: 'Plus de 2 ans' }).click()
  await expect(page.getByRole('heading', { name: 'Qu’aimeriez-vous vivre autrement ?' })).toBeVisible()
  await continuer(page)
  await expect(page.getByLabel('Votre adresse e-mail')).toHaveValue('connue@example.com')
})

test.describe('Toronto, pendant la fenêtre du 25/10 au 01/11/2026 (5 h d\'écart)', () => {
  test.use({ timezoneId: 'America/Toronto' })
  test('heures écrites à Toronto, fuseau envoyé', async ({ page }) => {
    const j = await simuler(page, { creneaux: [ms('2026-10-30T17:30:00Z'), ms('2026-11-06T17:30:00Z')] })
    await ouvrir(page)
    await jusquAuCreneau(page)
    await expect(page.getByText('heure de Toronto')).toBeVisible()
    await expect(page.getByRole('radio', { name: '13:30' })).toBeVisible() // 30/10 : 18:30 à Paris
    await page.getByRole('tab', { name: /6 novembre/ }).click()
    await page.getByRole('radio', { name: '12:30' }).click() // 06/11 : 18:30 à Paris, 6 h d'écart
    await page.getByRole('button', { name: 'Demander ce créneau' }).click()
    await expect(page.getByText('vendredi 6 novembre à 12:30 (heure de Toronto)')).toBeVisible()
    expect(j.reserver[0]).toMatchObject({ fuseau: 'America/Toronto', creneau: ms('2026-11-06T17:30:00Z') })
  })
})

test.describe('Kolkata (UTC+5:30)', () => {
  test.use({ timezoneId: 'Asia/Kolkata' })
  test('le créneau de 20:00 à Paris tombe le lendemain à 00:30', async ({ page }) => {
    await simuler(page, { creneaux: [ms('2026-11-06T19:00:00Z')] })
    await ouvrir(page)
    await jusquAuCreneau(page)
    await expect(page.getByText('heure de Kolkata')).toBeVisible()
    await expect(page.getByRole('tab', { name: /7 novembre/ })).toBeVisible()
    await expect(page.getByRole('radio', { name: '00:30' })).toBeVisible()
  })
})

test.describe('appareil en UTC', () => {
  test.use({ timezoneId: 'UTC' })
  test('la page demande le fuseau, Paris en premier, puis change à la demande', async ({ page }) => {
    const j = await simuler(page)
    await ouvrir(page)
    await jusquAuCreneau(page, { attendre: false }) // l'écran du créneau commence par la question du fuseau
    await expect(page.getByRole('heading', { name: 'Dans quel fuseau horaire êtes-vous ?' })).toBeVisible()
    await page.getByRole('button', { name: 'Heure de Paris' }).click()
    await expect(page.getByRole('radio', { name: '18:30' })).toBeVisible()
    await page.getByRole('button', { name: 'Changer' }).click()
    await page.getByLabel('Chercher une ville').fill('vancouver')
    await page.getByRole('button', { name: /Vancouver/ }).first().click()
    await expect(page.getByText('heure de Vancouver')).toBeVisible()
    await page.getByRole('radio', { name: '09:30' }).click() // 06/11 : 18:30 à Paris, UTC−8 à Vancouver
    await page.getByRole('button', { name: 'Demander ce créneau' }).click()
    await expect(page.getByText('Votre demande est bien envoyée.', { exact: false })).toBeVisible()
    expect(j.reserver[0]).toMatchObject({ fuseau: 'America/Vancouver' })
  })
})

test('demande déjà en cours : dite à l\'écran des coordonnées, jamais au créneau (04/11/2026)', async ({ page }) => {
  const j = await simuler(page, { doublon: true })
  await ouvrir(page)
  await jusquAuCreneau(page, { provenance: false, attendre: false })
  await expect(page.getByText('Une demande est déjà enregistrée pour cette adresse e-mail.', { exact: false })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Vos coordonnées' })).toBeVisible()
  expect(j.verifier).toEqual([{ email: 'jane@example.com' }])
  expect(j.reserver).toHaveLength(0)
  // Une autre adresse : le message s'efface, la vérification repart.
  await page.getByLabel('Votre adresse e-mail').fill('autre@example.com')
  await expect(page.getByText('Une demande est déjà enregistrée', { exact: false })).toHaveCount(0)
})

test('coordonnées incomplètes : chaque message sous sa case (audit du 04/11/2026)', async ({ page }) => {
  await simuler(page)
  await ouvrir(page)
  await page.getByLabel('Quel est votre prénom ?').fill('Jane')
  await continuer(page)
  await page.getByLabel('Quelle situation relationnelle souhaitez-vous travailler ?').fill('Je rejoue le même scénario.')
  await continuer(page)
  await page.getByRole('radio', { name: 'Plus de 2 ans' }).click()
  await expect(page.getByRole('heading', { name: 'Qu’aimeriez-vous vivre autrement ?' })).toBeVisible()
  await continuer(page)
  await page.getByLabel('Votre nom').fill('Doe')
  await continuer(page)
  await expect(page.locator('#email-erreur')).toBeVisible()
  await expect(page.locator('#telephone-erreur')).toBeVisible()
  await expect(page.locator('#nom-erreur')).toHaveCount(0)
  await expect(page.getByLabel('Votre adresse e-mail')).toHaveAttribute('aria-describedby', /email-erreur/)
})

test('écran du créneau : Retour revient à l\'écran précédent, « Modifier » ouvre les coordonnées (audit du 04/11/2026)', async ({ page }) => {
  await simuler(page)
  await ouvrir(page)
  await jusquAuCreneau(page)
  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'Comment avez-vous découvert cet appel ?' })).toBeVisible()
  await continuer(page)
  await expect(page.getByRole('heading', { name: 'Choisissez le créneau de votre rendez-vous' })).toBeVisible()
  await page.getByRole('button', { name: 'Ce n’est pas vous ? Modifier' }).click()
  await expect(page.getByRole('heading', { name: 'Vos coordonnées' })).toBeVisible()
  await expect(page.getByLabel('Votre adresse e-mail')).toHaveValue('jane@example.com')
})
