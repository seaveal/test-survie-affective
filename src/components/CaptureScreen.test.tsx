import { render, screen } from '@testing-library/react'
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
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@h3c.life' }),
    )
  })

  it('marketing coche par defaut, sante decoche par defaut', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const mktCheckbox = screen.getByLabelText(/recevoir mon profil et les emails/i) as HTMLInputElement
    const santeCheckbox = screen.getByLabelText(/etat emotionnel/i) as HTMLInputElement
    expect(mktCheckbox.checked).toBe(true)
    expect(santeCheckbox.checked).toBe(false)
  })

  it("refus consentement sante n'empeche pas le submit (test reste passable)", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await user.type(emailInput, 'a@b.fr')
    // sante reste decoche par defaut
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        consentementDonneesSante: false,
        consentementMarketing: true,
      }),
    )
  })

  it('refus consentement marketing bloque le submit (canal email = livraison V1)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await user.type(emailInput, 'a@b.fr')
    await user.click(screen.getByLabelText(/recevoir mon profil et les emails/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('bouton desactive et libelle change quand envoiEnCours=true', () => {
    render(<CaptureScreen onSubmit={vi.fn()} envoiEnCours />)
    const btn = screen.getByRole('button', { name: /envoi en cours/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  // Mission 2026-06-16 — capture mobile + consentement SMS

  it('SMS decoche par defaut, champ mobile optionnel', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const sms = screen.getByLabelText(/rappels et declics par sms/i) as HTMLInputElement
    expect(sms.checked).toBe(false)
    expect(screen.getByLabelText(/mobile/i)).toBeInTheDocument()
  })

  it('capte le mobile + consentement SMS et normalise en E.164', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.type(screen.getByLabelText(/mobile/i), '06 12 34 56 78')
    await user.click(screen.getByLabelText(/rappels et declics par sms/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ telephone: '+33612345678', consentementSms: true }),
    )
  })

  it('numero sans consentement SMS coche : numero ignore, opt-in false', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.type(screen.getByLabelText(/mobile/i), '06 12 34 56 78')
    // case SMS volontairement laissee decochee
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ telephone: undefined, consentementSms: false }),
    )
  })

  it('consentement SMS coche + numero invalide : bloque le submit (resultats jamais conditionnes mais consentement sans objet)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.type(screen.getByLabelText(/mobile/i), '123')
    await user.click(screen.getByLabelText(/rappels et declics par sms/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('sans numero ni case SMS : submit OK, opt-in false (numero non requis)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.fr')
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ telephone: undefined, consentementSms: false }),
    )
  })
})
