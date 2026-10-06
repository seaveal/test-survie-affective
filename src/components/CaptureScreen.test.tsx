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
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
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
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@h3c.life' }),
    )
  })

  // Correctif RGPD-VX34 (audit emailing 2026-08-09). Deux vices avaient ete
  // releves ; UN SEUL est corrige ici, et la distinction compte :
  //   - case marketing PRE-COCHEE (recital 32 / CJUE Planet49) : corrige, elle
  //     part decochee. Aucun arbitrage n'etait requis, c'est un vice pur.
  //   - refus BLOQUANT la remise du profil (art. 7.4) : NON corrige. Le lever
  //     coute des leads, donc c'est une decision de Cyrille (rang 3, decision 2),
  //     et son jumeau serveur `require_marketing_consent` refuse `false` par un
  //     422. Les deux gardes se levent ensemble, ou pas du tout.
  // Les tests qui suivent verrouillent cet etat exact, des deux cotes.

  it('la case des emails part décochée', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const mktCheckbox = screen.getByLabelText(/emails de Cyrille Novou/i) as HTMLInputElement
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
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
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
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit.mock.calls[0][0]).toEqual({
      email: 'a@b.fr',
      prenom: '',
      consentementMarketing: true,
    })
  })

  it('textes validés le 2026-10-06 (A2, variante fin de Test)', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    expect(screen.getByText('Votre profil offert par email')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /^Où voulez-vous recevoir votre profil \?$/,
    )
    expect(
      screen.getByText(
        "Vous avez répondu aux 25 questions. Indiquez votre email pour recevoir votre profil complet. Votre masque s'affichera à l'écran après cette étape.",
      ),
    ).toBeInTheDocument()
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

  it('refus du marketing : le submit est bloque, en accord avec le validateur serveur', async () => {
    // Le decouplage (remettre le profil malgre un refus, art. 7.4) est une
    // decision de Cyrille, pas un correctif : il coute des leads. Tant qu'elle
    // n'est pas rendue, le garde reste, et il DOIT rester : son jumeau serveur
    // `require_marketing_consent` refuse `false` par un 422. Le retirer ici seul
    // remplacerait un message lisible par un echec dur, sans profil du tout.
    // Le jour de la decision, les deux tombent ensemble et ce banc s'inverse.
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await user.type(emailInput, 'a@b.fr')
    // la case marketing est laissee vide : c'est le refus
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('acceptation du marketing : la case cochee remonte consentementMarketing=true', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ consentementMarketing: true }),
    )
  })

  it("l'ecran dit vrai sur ce que la case conditionne", () => {
    // Le texte ne doit RIEN promettre que le garde dement : tant que le refus
    // bloque, ecrire « cette case ne conditionne rien » serait un mensonge a
    // l'utilisateur. Ce banc verrouille l'accord entre le dire et le faire.
    render(<CaptureScreen onSubmit={vi.fn()} />)
    expect(screen.getByText(/cochez\s+cette case pour les recevoir/i)).toBeInTheDocument()
    expect(screen.queryByText(/ne conditionne rien/i)).not.toBeInTheDocument()
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
    const mkt = screen.getByLabelText(/emails de cyrille novou/i)
    const etat = () =>
      [email, mkt].map((el) => `${el.getAttribute('aria-invalid')}|${el.getAttribute('aria-describedby') ?? ''}`)

    expect(mkt).toHaveAttribute('aria-required', 'true')
    // Email malformé (validation native contournée : on teste notre garde)
    await user.type(email, 'x@y')
    fireEvent.submit(screen.getByTestId('capture-screen'))
    expect(etat()).toEqual(['true|capture-erreur', 'null|'])
    // Case marketing décochée
    await user.type(email, '.fr')
    fireEvent.submit(screen.getByTestId('capture-screen'))
    expect(etat()).toEqual(['null|', 'true|capture-erreur'])
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'capture-erreur')
  })

  it("bouton d'envoi : classe terracotta partagée, aucune couleur en dur", () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const bouton = screen.getByTestId('capture-envoyer')
    expect(bouton).toHaveClass('tsa-cta-terracotta')
    expect(bouton.getAttribute('style') ?? '').not.toMatch(/#[0-9a-f]{3,8}|rgb|background/i)
  })
})
