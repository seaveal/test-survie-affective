import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SuiteDuBilan } from '../src/rv/ResultatRV'
import { lireProgression } from '../src/api/client'

describe('Suite du bilan selon une identité vérifiée', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/retrouvez-vous')
    window.h3cContact = () => new URLSearchParams(window.location.search).get('c') || undefined
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => { vi.unstubAllGlobals(); delete window.h3cContact })
  it('ne lit aucun statut à partir de l’adresse saisie ou du jeton local', () => {
    localStorage.setItem('rv.reprise', 'jeton-de-cycle')
    render(<SuiteDuBilan />)
    expect(screen.getByTestId('suite-bilan-email')).toBeInTheDocument()
    expect(screen.queryByTestId('rdv-bouton')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
    localStorage.clear()
  })
  it.each(['rdv', 'programme'] as const)('affiche %s après lecture du jeton email', async (suite) => {
    window.history.replaceState({}, '', '/retrouvez-vous?c=h1.courriel')
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ suite }), { status: 200 }))
    render(<SuiteDuBilan />)
    expect(screen.getByRole('status')).toHaveTextContent('Nous retrouvons')
    const bouton = await screen.findByTestId(suite === 'rdv' ? 'rdv-bouton' : 'programme-bouton')
    expect(bouton.getAttribute('href')).toContain('/api/rv-suite?c=h1.courriel')
    expect(bouton).toHaveAttribute('referrerpolicy', 'no-referrer')
    if (suite === 'programme') expect(screen.queryByTestId('rdv-bouton')).toBeNull()
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/api/rv-orientation?c=h1.courriel')
  })
  it('n’affiche pas de RDV par défaut quand la vérification échoue', async () => {
    window.history.replaceState({}, '', '/retrouvez-vous?c=h1.invalide')
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 404 }))
    render(<SuiteDuBilan />)
    await screen.findByTestId('suite-bilan-email')
    expect(screen.queryByTestId('rdv-bouton')).toBeNull()
  })
  it('la reprise email du bilan sélectionne le jeu rv', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ termine: true })))
    await lireProgression({ c: 'h1.courriel', jeu: 'rv' })
    await waitFor(() => expect(vi.mocked(fetch).mock.calls[0][0]).toContain('&jeu=rv'))
  })
})
