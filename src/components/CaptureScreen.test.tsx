import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CaptureScreen } from './CaptureScreen'

describe('CaptureScreen — sprint 2', () => {
  it('exige un email valide avant de continuer', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    const emailInput = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement
    await user.type(emailInput, 'not-an-email')
    await user.click(screen.getByRole('button', { name: /sauvegarder et continuer/i }))
    // onSubmit ne doit pas etre appele (la validation HTML5 native bloque le submit,
    // OU notre validator JS rejette l'email malforme).
    expect(onSubmit).not.toHaveBeenCalled()
    // L'utilisateur reste sur l'ecran capture, l'input email contient toujours la valeur saisie
    expect(screen.getByTestId('capture-screen')).toBeInTheDocument()
    expect(emailInput.value).toBe('not-an-email')
  })

  it("normalise l'email (lower + trim) avant submit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await user.type(emailInput, '  ALICE@H3C.LIFE  ')
    await user.click(screen.getByLabelText(/textes de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /sauvegarder et continuer/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@h3c.life' }),
    )
  })

  // Correctif RGPD-VX34 (audit emailing 2026-08-09) : la case part décochée
  // (considérant 32, Planet49). Depuis le 2026-10-09 (décision Cyrille, art. 7 §4),
  // elle est aussi FACULTATIVE : le profil part sans elle. Le serveur l'accepte.

  it('la case des emails part décochée', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const mktCheckbox = screen.getByLabelText(/textes de Cyrille Novou/i) as HTMLInputElement
    expect(mktCheckbox.checked).toBe(false)
  })

  // 2026-10-06 (Test à 25 questions) : la question « état émotionnel » est
  // retirée, la case « données de santé » disparaît avec elle.
  it("plus de case « données de santé » ni de champ santé dans l'envoi", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    expect(screen.queryByLabelText(/état émotionnel|etat emotionnel|santé|sante/i)).toBeNull()
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.click(screen.getByLabelText(/textes de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /sauvegarder et continuer/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('consentementDonneesSante')
  })

  // 2026-10-06 : plus de mobile ni de consentement SMS (le rappel de webinaire
  // qui les justifiait n'existe plus).
  it('ni mobile ni SMS : un seul formulaire email + prénom + une case', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { container } = render(<CaptureScreen onSubmit={onSubmit} />)
    expect(container.querySelector('details, input[type="tel"]')).toBeNull()
    expect(screen.queryByText(/mobile|sms/i)).toBeNull()
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.click(screen.getByLabelText(/textes de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /sauvegarder et continuer/i }))
    expect(onSubmit.mock.calls[0][0]).toEqual({
      email: 'a@b.fr',
      prenom: '',
      consentementMarketing: true,
    })
  })

  it('textes de l’écran posé après la 3e réponse (livraison 2)', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    expect(screen.getByText('Votre profil offert par email')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Où voulez-vous recevoir votre profil ?' })).toBeInTheDocument()
    expect(screen.getByText(/reprendre plus tard/)).toBeInTheDocument()
    expect(screen.getByTestId('capture-envoyer')).toHaveTextContent('Sauvegarder et continuer')
    expect(screen.getByText(/Sans carte bancaire\./)).toBeInTheDocument()
    expect(screen.queryByText(/trente/i)).toBeNull()
  })

  it('sous le bouton : profil et séance offerts, avant la mention de stockage', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const sous = screen.getByTestId('capture-sous-bouton')
    expect(sous).toHaveTextContent(
      /^Profil complet et séance de descente dans le corps offerts\. Sans carte bancaire\.$/,
    )
    expect(screen.getByTestId('capture-envoyer').nextElementSibling).toBe(sous)
    // Téléphone : la mention de stockage (`order-last`) passe après cette ligne.
    expect(screen.getByText(/stockées sur un serveur en France/).className).toMatch(/\border-last\b/)
    expect(sous.className).not.toMatch(/order-/)
  })

  it('aucune durée (« minutes ») dans le texte du formulaire, avec ou sans erreur', () => {
    const { container } = render(<CaptureScreen onSubmit={vi.fn()} />)
    expect(container.textContent).not.toMatch(/minute/i)
    fireEvent.submit(screen.getByTestId('capture-screen'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/minute/i)
  })

  it('case laissée vide : le submit passe, consentementMarketing=false', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.click(screen.getByRole('button', { name: /sauvegarder et continuer/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.fr', consentementMarketing: false }),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('acceptation du marketing : la case cochee remonte consentementMarketing=true', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.click(screen.getByLabelText(/textes de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /sauvegarder et continuer/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ consentementMarketing: true }),
    )
  })

  it("l'écran dit que le profil ne dépend pas de la case", () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    expect(screen.getByText(/dans tous les cas : cette case est facultative/i)).toBeInTheDocument()
    expect(screen.queryByText(/cochez\s+cette case pour les recevoir/i)).not.toBeInTheDocument()
  })

  it('bouton desactive et libelle change quand envoiEnCours=true', () => {
    render(<CaptureScreen onSubmit={vi.fn()} envoiEnCours />)
    const btn = screen.getByRole('button', { name: /envoi en cours/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('aria-invalid et le lien vers le message portent sur le champ fautif, et lui seul', async () => {
    const user = userEvent.setup()
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const email = screen.getByRole('textbox', { name: /email/i })
    const mkt = screen.getByLabelText(/textes de cyrille novou/i)
    const etat = () =>
      [email, mkt].map((el) => `${el.getAttribute('aria-invalid')}|${el.getAttribute('aria-describedby') ?? ''}`)

    expect(mkt).not.toHaveAttribute('aria-required')
    // Email malformé (validation native contournée : on teste notre garde)
    await user.type(email, 'x@y')
    fireEvent.submit(screen.getByTestId('capture-screen'))
    expect(etat()).toEqual(['true|capture-erreur', 'null|'])
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'capture-erreur')
    // La case vide n'est jamais une faute.
    await user.type(email, '.fr')
    fireEvent.submit(screen.getByTestId('capture-screen'))
    expect(etat()).toEqual(['null|', 'null|'])
  })

  it("bouton d'envoi : classe terracotta partagée, aucune couleur en dur", () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const bouton = screen.getByTestId('capture-envoyer')
    expect(bouton).toHaveClass('tsa-cta-terracotta')
    expect(bouton.getAttribute('style') ?? '').not.toMatch(/#[0-9a-f]{3,8}|rgb|background/i)
  })
})
