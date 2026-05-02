import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuestionCard } from './QuestionCard'
import type { QuestionTypage } from '../domain/types'

const question: QuestionTypage = {
  id: 1,
  type: 'typage',
  enonce: 'Énoncé de la question 1',
  options: [
    { id: 'A', texte: 'Option A', profil: 'mendiant' },
    { id: 'B', texte: 'Option B', profil: 'sauveur' },
    { id: 'C', texte: 'Option C', profil: 'controleur' },
    { id: 'D', texte: 'Option D', profil: 'fantome' },
  ],
}

describe('<QuestionCard>', () => {
  it("affiche l'énoncé et les 4 options", () => {
    render(<QuestionCard question={question} onChoisir={() => {}} />)
    expect(screen.getByRole('heading')).toHaveTextContent(/Énoncé de la question 1/)
    for (const lettre of ['A', 'B', 'C', 'D']) {
      expect(screen.getByText(`Option ${lettre}`)).toBeInTheDocument()
    }
  })

  it('appelle onChoisir avec l\'option.id au clic', async () => {
    const user = userEvent.setup()
    const onChoisir = vi.fn()
    render(<QuestionCard question={question} onChoisir={onChoisir} />)
    await user.click(screen.getByRole('button', { name: /Option C/i }))
    expect(onChoisir).toHaveBeenCalledOnce()
    expect(onChoisir).toHaveBeenCalledWith('C')
  })

  it('aria-label des options inclut le texte (accessibilité)', () => {
    render(<QuestionCard question={question} onChoisir={() => {}} />)
    expect(
      screen.getByRole('button', { name: /Option A/i }),
    ).toBeInTheDocument()
  })

  it('si valeurChoisie passée, le bouton correspondant a aria-pressed=true', () => {
    render(
      <QuestionCard question={question} onChoisir={() => {}} valeurChoisie="B" />,
    )
    expect(
      screen.getByRole('button', { name: /Option B/i }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: /Option A/i }),
    ).toHaveAttribute('aria-pressed', 'false')
  })
})
