import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from './ProgressBar'

describe('<ProgressBar>', () => {
  it('rend "Question X sur Y" avec les bonnes valeurs', () => {
    render(<ProgressBar courant={5} total={30} />)
    expect(screen.getByText('Question 5 sur 30')).toBeInTheDocument()
  })

  it('a un role progressbar avec aria-valuenow / aria-valuemax', () => {
    render(<ProgressBar courant={10} total={30} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '10')
    expect(bar).toHaveAttribute('aria-valuemax', '30')
    expect(bar).toHaveAttribute('aria-valuemin', '1')
  })

  it('largeur de la barre proportionnelle (10/30 ≈ 33%)', () => {
    const { container } = render(<ProgressBar courant={10} total={30} />)
    const fill = container.querySelector('[data-testid="progress-fill"]')
    expect(fill).toBeInTheDocument()
    const style = (fill as HTMLElement).style.width
    // Floating tolerated
    expect(style).toMatch(/^33\.\d+%$/)
  })

  it('borne courant à [1, total]', () => {
    const { rerender } = render(<ProgressBar courant={0} total={30} />)
    expect(screen.getByText('Question 1 sur 30')).toBeInTheDocument()
    rerender(<ProgressBar courant={50} total={30} />)
    expect(screen.getByText('Question 30 sur 30')).toBeInTheDocument()
  })
})
