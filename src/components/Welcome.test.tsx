import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Welcome } from './Welcome'

describe('<Welcome>', () => {
  it('affiche le titre, le sous-titre et la mention sous le bouton', () => {
    render(<Welcome onCommencer={() => {}} />)
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent(/Pourquoi vous choisissez toujours les mêmes/i)
    expect(
      screen.getByText(/stratégie de survie affective/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/30 questions.*5 minutes.*Confidentiel/i),
    ).toBeInTheDocument()
  })

  it('a un bouton "Commencer le test" qui appelle onCommencer au clic', async () => {
    const user = userEvent.setup()
    const onCommencer = vi.fn()
    render(<Welcome onCommencer={onCommencer} />)
    const bouton = screen.getByRole('button', { name: /commencer le test/i })
    await user.click(bouton)
    expect(onCommencer).toHaveBeenCalledOnce()
  })

  it('le bouton est focusable au clavier', () => {
    render(<Welcome onCommencer={() => {}} />)
    const bouton = screen.getByRole('button', { name: /commencer le test/i })
    bouton.focus()
    expect(bouton).toHaveFocus()
  })
})
