import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from './ProgressBar'

describe('<ProgressBar>', () => {
  it('rend "Question X sur Y" avec les bonnes valeurs', () => {
    render(<ProgressBar courant={5} total={25} />)
    expect(screen.getByText('Question 5 sur 25')).toBeInTheDocument()
  })

  it('a un role progressbar avec aria-valuenow / aria-valuemax', () => {
    render(<ProgressBar courant={10} total={25} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '10')
    expect(bar).toHaveAttribute('aria-valuemax', '25')
    expect(bar).toHaveAttribute('aria-valuemin', '1')
  })

  it('largeur de la barre proportionnelle (10/25 = 40%)', () => {
    const { container } = render(<ProgressBar courant={10} total={25} />)
    const fill = container.querySelector('[data-testid="progress-fill"]')
    expect(fill).toBeInTheDocument()
    const style = (fill as HTMLElement).style.width
    // Floating tolerated
    expect(style).toMatch(/^40(\.0+)?%$/)
  })

  it('borne courant à [1, total]', () => {
    const { rerender } = render(<ProgressBar courant={0} total={25} />)
    expect(screen.getByText('Question 1 sur 25')).toBeInTheDocument()
    rerender(<ProgressBar courant={50} total={25} />)
    expect(screen.getByText('Question 25 sur 25')).toBeInTheDocument()
  })
})
