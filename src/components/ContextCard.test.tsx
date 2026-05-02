import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContextCard } from './ContextCard'
import type { QuestionContexte } from '../domain/types'

const question: QuestionContexte = {
  id: 27,
  type: 'contexte',
  enonce: 'Avez-vous lu le livre ?',
  champCible: 'statutLivre',
  options: [
    { id: 'A', texte: 'Oui, en entier', valeur: 'lu_complet' },
    { id: 'B', texte: 'Oui, je le lis', valeur: 'lu_partiel' },
    { id: 'C', texte: 'Non, pas encore', valeur: 'pas_lu' },
  ],
}

describe('<ContextCard>', () => {
  it('affiche énoncé + toutes les options', () => {
    render(<ContextCard question={question} onChoisir={() => {}} />)
    expect(screen.getByRole('heading')).toHaveTextContent(/Avez-vous lu le livre/)
    expect(screen.getByText('Oui, en entier')).toBeInTheDocument()
    expect(screen.getByText('Oui, je le lis')).toBeInTheDocument()
    expect(screen.getByText('Non, pas encore')).toBeInTheDocument()
  })

  it("appelle onChoisir avec la valeur sémantique de l'option (pas l'id)", async () => {
    const user = userEvent.setup()
    const onChoisir = vi.fn()
    render(<ContextCard question={question} onChoisir={onChoisir} />)
    await user.click(screen.getByRole('button', { name: /Oui, en entier/i }))
    expect(onChoisir).toHaveBeenCalledWith('lu_complet')
  })

  it('valeurChoisie : aria-pressed=true sur option correspondante', () => {
    render(
      <ContextCard
        question={question}
        onChoisir={() => {}}
        valeurChoisie="pas_lu"
      />,
    )
    expect(
      screen.getByRole('button', { name: /Non, pas encore/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
