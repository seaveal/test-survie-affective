import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ResultDelivery } from './ResultDelivery'
import { garderLivraison } from '../api/setting'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })
it('does not promise a saved result before server acknowledgement', () => {
  render(<ResultDelivery game="tsa" busy={false} refused={false} />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.getByText(/n’est pas encore enregistré/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Réessayer/ })).toBeInTheDocument()
})
it('offers only WhatsApp after a durable response and explains expiration', () => {
  garderLivraison('rv', { state: 'saved', delivery: 'whatsapp', whatsapp_url: 'https://wa.me/123?text=MON%20RESULTAT%20synthetic', retained_until: Date.now()/1000 + 86400, access_hours: 24 })
  render(<ResultDelivery game="rv" busy={false} refused={false} />)
  expect(screen.getByRole('link').getAttribute('href')).toContain('https://wa.me/')
  expect(screen.getByText(/24 heures/)).toBeInTheDocument()
  expect(screen.getByText(/ne vous inscrit pas/)).toBeInTheDocument()
})
it('shows a refusal without a delivery link', () => {
  render(<ResultDelivery game="tsa" busy={false} refused={true} />)
  expect(screen.getByRole('alert')).toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})
