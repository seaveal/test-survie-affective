import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResultPreview } from './ResultPreview'
import type { Resultat } from '../domain/types'

const RESULTAT: Resultat = {
  profilDominant: 'mendiant',
  profilSecondaire: null,
  scoreProfils: { mendiant: 20, sauveur: 10, controleur: 10, fantome: 10 },
  intensite: 'profond',
  scoreIntensite: 24,
  statutLivre: 'pas_lu',
  situation: 'couple_difficile',
  pretAAgir: 'maintenant',
}

describe('attente du rapport', () => {
  it('affiche la vignette de Cyrille en tête, vente ouverte ou fermée', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi />)
    const vignette = screen.getByRole('img', { name: 'Cyrille Novou' })
    expect(vignette).toHaveAttribute('src', '/portrait-cyrille.jpg')
    expect(vignette.closest('picture')?.querySelector('source')).toHaveAttribute('srcset', '/portrait-cyrille.webp')
  })

  it('annonce une dizaine de minutes après réception de la demande', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi />)
    expect(screen.getByRole('heading', {name: 'Votre rapport arrive dans une dizaine de minutes'})).toBeInTheDocument()
  })

  it('ne promet pas un rapport en route lorsque la demande est restée hors ligne', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi={false} />)
    expect(screen.getByTestId('result-retry-note')).toHaveTextContent('Revenez sur le test')
    expect(screen.queryByRole('heading', {name: 'Votre rapport arrive dans une dizaine de minutes'})).toBeNull()
  })
})

// Seconde proposition (décision Cyrille du 2026-10-09) : qui a laissé la case vide à
// l'écran de l'email se voit reproposer la suite, en un clic, sous le rapport.
describe('<ResultPreview> — seconde proposition de la suite par email', () => {
  it('sans accepterSuite (case cochée, ou aperçu), rien ne s’affiche', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi />)
    expect(screen.queryByTestId('suite-par-email')).toBeNull()
  })

  it('un clic pose le consentement et le dit', async () => {
    const accepter = vi.fn().mockResolvedValue(true)
    render(<ResultPreview resultat={RESULTAT} envoiReussi accepterSuite={accepter} />)
    expect(screen.getByText(/textes de Cyrille Novou/i)).toBeInTheDocument()
    expect(screen.getByText(/désinscription en un clic/i)).toBeInTheDocument()
    await act(async () => { fireEvent.click(screen.getByTestId('suite-accepter')) })
    expect(accepter).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('suite-ok')).toBeInTheDocument()
    expect(screen.queryByTestId('suite-accepter')).toBeNull()
  })

  it('un refus du serveur laisse le bouton et affiche une erreur', async () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi
                          accepterSuite={vi.fn().mockResolvedValue(false)} />)
    await act(async () => { fireEvent.click(screen.getByTestId('suite-accepter')) })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('suite-accepter')).toBeInTheDocument()
  })

  it('pas avant que le Test soit reçu par le serveur', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi={false}
                          accepterSuite={vi.fn()} />)
    expect(screen.queryByTestId('suite-par-email')).toBeNull()
  })
})

// Décision Cyrille du 18/10/2026 : l'appel de trente minutes est la SEULE proposition de la
// page de résultat ; le kit (vidéo et bloc) en est retiré.
describe('<ResultPreview> — bloc rendez-vous, seule proposition', () => {
  it('propose l’appel de trente minutes vers le lien court suivi rdv-test', () => {
    const { container } = render(<ResultPreview resultat={RESULTAT} envoiReussi />)
    const bouton = screen.getByTestId('rdv-bouton')
    expect(bouton.getAttribute('href')).toBe('https://h3c.fr/rdv-test')
    expect(bouton.textContent).toBe('Réserver mon appel de 30 minutes')
    expect(container.textContent).not.toMatch(/youcanbook/i)
  })

  it('aucun kit sur la page : ni vidéo, ni bloc, ni lien vers la caisse du kit', () => {
    const { container } = render(<ResultPreview resultat={RESULTAT} envoiReussi />)
    expect(container.querySelector('[data-testid="kit-vsl"]')).toBeNull()
    expect(container.querySelector('[data-testid="kit-bloc"]')).toBeNull()
    expect(container.querySelector('a[href*="kit-test-profil"]')).toBeNull()
    expect(container.textContent).not.toMatch(/kit de démarrage|48 €/)
  })

  it('l’aperçu (exemple de résultat) montre aussi le bloc rendez-vous', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi apercu />)
    expect(screen.getByTestId('rdv-bouton')).toBeTruthy()
  })
})
