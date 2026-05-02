import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

/**
 * Test e2e du parcours complet : welcome → 30 questions → page résultat.
 * Pas de mock : on consomme les vraies données src/data/* via les composants.
 */

async function commencerLeTest(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /commencer le test/i }))
}

async function repondreToutTypage(
  user: ReturnType<typeof userEvent.setup>,
  optionId: string,
) {
  for (let i = 0; i < 20; i++) {
    // À chaque question, le bouton avec aria-pressed=false est ce qu'on choisit
    const boutons = screen.getAllByRole('button')
    const cible = boutons.find(
      (b) =>
        b.textContent?.length &&
        b.textContent.length > 5 &&
        b.getAttribute('aria-pressed') !== null,
    )
    expect(cible, `tour ${i + 1}, bouton typage trouvé`).toBeDefined()
    // Re-récupère par option.id : on cherche dans la liste rendue le i-ième
    // bouton de typage qui correspond à `optionId`. Plus simple : on clique
    // sur le bouton dont le contenu textuel est le 1er, le 2e, le 3e, ou le 4e
    // selon optionId. On va plutôt cliquer le bouton à la position A/B/C/D.
    const idx = ['A', 'B', 'C', 'D'].indexOf(optionId)
    const tousLesBoutonsAriaPressed = boutons.filter(
      (b) => b.getAttribute('aria-pressed') !== null,
    )
    expect(tousLesBoutonsAriaPressed).toHaveLength(4)
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
  // 4 questions de contexte : on clique sur le i-ième bouton de chaque liste.
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

describe('e2e : parcours complet', () => {
  it("Welcome → 30 questions → page résultat affichée", async () => {
    const user = userEvent.setup()
    render(<App />)

    // 1. Welcome
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Pourquoi vous choisissez toujours les mêmes/i,
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

    // 6. Page résultat
    expect(screen.getByText(/profil dominant/i)).toBeInTheDocument()
    expect(screen.getByText(/Les 7 symptômes que vous reconnaissez/i)).toBeInTheDocument()
    expect(screen.getByText(/Votre prochain pas/i)).toBeInTheDocument()
    // 7 symptômes attendus
    const headings = screen.getAllByRole('heading')
    const titreSymptomes = headings.find((h) =>
      /7 symptômes/i.test(h.textContent ?? ''),
    )
    expect(titreSymptomes).toBeDefined()
    const list = titreSymptomes!.parentElement!.querySelector('ol')
    expect(list).toBeTruthy()
    expect(within(list as HTMLElement).getAllByRole('listitem')).toHaveLength(7)
  }, 30000)

  it("bouton 'Recommencer' réinitialise le parcours", async () => {
    const user = userEvent.setup()
    render(<App />)
    await commencerLeTest(user)
    await repondreToutTypage(user, 'A')
    await repondreToutIntensite(user, 1)
    await repondreContexte(user, 0)
    expect(screen.getByText(/Votre prochain pas/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /recommencer/i }))
    // Welcome de nouveau
    expect(
      screen.getByRole('heading', { level: 1, name: /Pourquoi vous choisissez/i }),
    ).toBeInTheDocument()
  }, 30000)
})
