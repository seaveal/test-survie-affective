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

  it('les trois cases de consentement partent decochees', () => {
    render(<CaptureScreen onSubmit={vi.fn()} />)
    const mktCheckbox = screen.getByLabelText(/emails de Cyrille Novou/i) as HTMLInputElement
    const smsCheckbox = screen.getByLabelText(/rappels et declics par sms/i) as HTMLInputElement
    const santeCheckbox = screen.getByLabelText(/etat emotionnel/i) as HTMLInputElement
    expect(mktCheckbox.checked).toBe(false)
    expect(smsCheckbox.checked).toBe(false)
    expect(santeCheckbox.checked).toBe(false)
  })

  it("refus consentement sante n'empeche pas le submit (test reste passable)", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CaptureScreen onSubmit={onSubmit} />)
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await user.type(emailInput, 'a@b.fr')
    // sante reste decoche par defaut
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        consentementDonneesSante: false,
      }),
    )
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
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
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
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
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
    await user.click(screen.getByLabelText(/emails de Cyrille Novou/i))
    await user.click(screen.getByRole('button', { name: /recevoir mon profil/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ telephone: undefined, consentementSms: false }),
    )
  })
})
