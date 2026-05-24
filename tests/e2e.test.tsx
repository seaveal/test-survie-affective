import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'

/**
 * Test e2e du parcours complet : welcome → 30 questions → capture email → page résultat allégée.
 *
 * Sprint 2 (2026-05-22) : la page résultat est désormais ALLÉGÉE.
 * À l'écran : niveau 1 seul (nom profil + intensité) + bloc "le détail arrive par email".
 * Le détail complet (7 symptômes + roadmap) part par email via Brevo (api.souverainauquotidien.com).
 *
 * On mocke `fetch` pour ne pas réellement contacter l'API d'ingestion en CI.
 */

async function commencerLeTest(user: ReturnType<typeof userEvent.setup>) {
  // Refonte écran d'accueil 2026-05-24 : 2 boutons "Commencer le test" (hero + CTA final).
  // Clic sur le premier (hero) suffit, les deux appellent la même callback onCommencer.
  const boutons = screen.getAllByRole('button', { name: /commencer le test/i })
  await user.click(boutons[0])
}

async function repondreToutTypage(
  user: ReturnType<typeof userEvent.setup>,
  optionId: string,
) {
  for (let i = 0; i < 20; i++) {
    const boutons = screen.getAllByRole('button')
    const tousLesBoutonsAriaPressed = boutons.filter(
      (b) => b.getAttribute('aria-pressed') !== null,
    )
    expect(tousLesBoutonsAriaPressed).toHaveLength(4)
    const idx = ['A', 'B', 'C', 'D'].indexOf(optionId)
    await user.click(tousLesBoutonsAriaPressed[idx])
  }
}

async function repondreToutIntensite(
  user: ReturnType<typeof userEvent.setup>,
  valeur: 1 | 2 | 3 | 4 | 5,
) {
  for (let i = 0; i < 6; i++) {
    const boutons = screen.getAllByRole('button')
    const tousAriaPressed = boutons.filter(
      (b) => b.getAttribute('aria-pressed') !== null,
    )
    expect(tousAriaPressed).toHaveLength(5)
    await user.click(tousAriaPressed[valeur - 1])
  }
}

async function repondreContexte(
  user: ReturnType<typeof userEvent.setup>,
  index: number,
) {
  for (let i = 0; i < 4; i++) {
    const boutons = screen.getAllByRole('button')
    const tousAriaPressed = boutons.filter(
      (b) => b.getAttribute('aria-pressed') !== null,
    )
    expect(tousAriaPressed.length).toBeGreaterThanOrEqual(2)
    const idx = Math.min(index, tousAriaPressed.length - 1)
    await user.click(tousAriaPressed[idx])
  }
}

async function passerLecranCapture(
  user: ReturnType<typeof userEvent.setup>,
  email: string = 'cyrille+e2e@cyrillenovou.com',
) {
  // CaptureScreen affiche un champ email + 2 cases consentement + bouton "Recevoir mon profil"
  expect(screen.getByTestId('capture-screen')).toBeInTheDocument()
  const emailInput = screen.getByRole('textbox', { name: /email/i })
  await user.type(emailInput, email)
  // Marketing coche par defaut, sante decoche par defaut : on garde l'etat
  await user.click(screen.getByRole('button', { name: /Recevoir mon profil/i }))
}

describe('e2e : parcours complet', () => {
  beforeEach(() => {
    // Mock fetch pour ne pas reellement appeler l'API d'ingestion en CI
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        contact_id: 'c-e2e',
        test_id: 't-e2e',
        cadeau_coupon_expire_le: '2026-05-25T00:00:00Z',
        nurturing_planifie: 6,
      }),
      text: async () => '',
    } as unknown as Response)
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('Welcome → 30 questions → Capture → page résultat allégée affichée', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 1. Welcome
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /En amour, vous rejouez toujours le même scénario/i,
    )
    await commencerLeTest(user)

    // 2. ProgressBar visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText(/Question 1 sur 30/)).toBeInTheDocument()

    // 3. Phase typage : on clique 20 fois sur l'option A
    await repondreToutTypage(user, 'A')

    // 4. Phase intensité : on clique 6 fois sur valeur 3
    await repondreToutIntensite(user, 3)

    // 5. Phase contexte : on clique 4 fois sur la 1ère option de chaque liste
    await repondreContexte(user, 0)

    // 6. Écran de capture (NOUVEAU sprint 2)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Votre profil arrive par email/i,
    )
    await passerLecranCapture(user)

    // 7. Page résultat allégée (niveau 1 seul + bloc email)
    expect(screen.getByTestId('result-preview')).toBeInTheDocument()
    expect(screen.getByText(/Votre profil dominant/i)).toBeInTheDocument()
    expect(screen.getByText(/La suite arrive par email/i)).toBeInTheDocument()
    expect(screen.getByText(/Verifiez vos messages/i)).toBeInTheDocument()
  }, 30000)

  it("bouton 'Recommencer' réinitialise le parcours", async () => {
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreToutTypage(user, 'A')
    await repondreToutIntensite(user, 1)
    await repondreContexte(user, 0)
    await passerLecranCapture(user, 'cyrille+e2e-recommence@cyrillenovou.com')
    expect(screen.getByTestId('result-preview')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /recommencer/i }))
    // Welcome de nouveau
    expect(
      screen.getByRole('heading', { level: 1, name: /En amour, vous rejouez toujours le même scénario/i }),
    ).toBeInTheDocument()
  }, 30000)

  it('même si fetch échoue, la page résultat allégée s\'affiche (file d\'attente localStorage)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreToutTypage(user, 'A')
    await repondreToutIntensite(user, 3)
    await repondreContexte(user, 0)
    await passerLecranCapture(user, 'cyrille+e2e-network@cyrillenovou.com')
    expect(screen.getByTestId('result-preview')).toBeInTheDocument()
    // Note de retry visible
    expect(screen.getByTestId('result-retry-note')).toBeInTheDocument()
    // Queue localStorage contient la capture
    const queue = JSON.parse(localStorage.getItem('tsa.pending-captures') ?? '[]')
    expect(queue).toHaveLength(1)
  }, 30000)
})
