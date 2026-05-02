import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LikertCard } from './LikertCard'
import type { QuestionIntensite } from '../domain/types'

const question: QuestionIntensite = {
  id: 21,
  type: 'intensite',
  enonce: 'À quelle fréquence ?',
  options: [
    { valeur: 1, texte: 'Jamais' },
    { valeur: 2, texte: 'Parfois' },
    { valeur: 3, texte: 'Régulièrement' },
    { valeur: 4, texte: 'Souvent' },
    { valeur: 5, texte: 'Toujours' },
  ],
}

describe('<LikertCard>', () => {
  it('affiche les 5 options Likert avec valeur et texte', () => {
    render(<LikertCard question={question} onChoisir={() => {}} />)
    for (const v of [1, 2, 3, 4, 5]) {
      expect(screen.getByText(String(v))).toBeInTheDocument()
    }
    expect(screen.getByText('Jamais')).toBeInTheDocument()
    expect(screen.getByText('Toujours')).toBeInTheDocument()
  })

  it('appelle onChoisir avec la valeur 1..5 au clic', async () => {
    const user = userEvent.setup()
    const onChoisir = vi.fn()
    render(<LikertCard question={question} onChoisir={onChoisir} />)
    await user.click(screen.getByRole('button', { name: /Régulièrement/i }))
    expect(onChoisir).toHaveBeenCalledWith(3)
  })

  it("affiche l'énoncé en heading", () => {
    render(<LikertCard question={question} onChoisir={() => {}} />)
    expect(screen.getByRole('heading')).toHaveTextContent(/À quelle fréquence/)
  })

  it('valeurChoisie : aria-pressed=true sur la valeur sélectionnée', () => {
    render(<LikertCard question={question} onChoisir={() => {}} valeurChoisie={4} />)
    expect(screen.getByRole('button', { name: /Souvent/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
