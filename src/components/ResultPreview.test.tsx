import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KitVsl, ResultPreview } from './ResultPreview'
import type { Resultat } from '../domain/types'

// Le bloc VSL du kit doit rendre correctement AVANT que la vidéo soit tournée :
// texte et bouton présents, et aucun emplacement de lecteur (ni iframe, ni
// placeholder visible). Une fois l'URL renseignée, le lecteur apparaît sans que
// rien d'autre bouge.
describe('<KitVsl> — bloc kit sur la page de livraison du profil', () => {
  it("sans URL de VSL : pas de lecteur, mais le texte et le bouton restent", () => {
    const { container } = render(<KitVsl url="" />)

    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.queryByTestId('kit-vsl-lecteur')).toBeNull()
    expect(screen.getByText(/Le tarif est de 48/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Je commence, 48/ }),
    ).toHaveAttribute('href', 'https://h3c.fr/kit-test-profil')
  })

  it('avec une URL de VSL : le lecteur est rendu, le texte et le bouton restent', () => {
    render(<KitVsl url="https://exemple.test/vsl-kit" />)

    const lecteur = screen.getByTestId('kit-vsl-lecteur')
    expect(lecteur).toHaveAttribute('src', 'https://exemple.test/vsl-kit')
    expect(screen.getByText(/Le tarif est de 48/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Je commence, 48/ }),
    ).toHaveAttribute('href', 'https://h3c.fr/kit-test-profil')
  })

  // Le bouton d'achat passe sous la vidéo : il n'apparaît qu'après le délai posé
  // à la main pour cette VSL. Sans lecteur ou sans délai, rien ne change.
  it('sans délai : le bouton est là dès le premier rendu, lecteur ou pas', () => {
    render(<KitVsl url="https://exemple.test/vsl-kit" boutonApresS="" />)

    expect(screen.getByTestId('kit-achat')).toBeInTheDocument()
    expect(screen.getByTestId('kit-vsl-lecteur')).toBeInTheDocument()
  })

  it('sans lecteur : un délai posé ne retire jamais le bouton', () => {
    render(<KitVsl url="" boutonApresS="600" />)

    expect(screen.getByTestId('kit-achat')).toBeInTheDocument()
  })

  it("avec un délai de 5 s : le bouton n'est pas là, puis il est là", () => {
    vi.useFakeTimers()
    try {
      render(<KitVsl url="https://exemple.test/vsl-kit" boutonApresS="5" />)

      expect(screen.getByTestId('kit-vsl-lecteur')).toBeInTheDocument()
      expect(screen.queryByTestId('kit-achat')).toBeNull()
      expect(screen.queryByText(/Le tarif est de 48/)).toBeNull()

      act(() => void vi.advanceTimersByTime(4999))
      expect(screen.queryByTestId('kit-achat')).toBeNull()

      act(() => void vi.advanceTimersByTime(1))
      expect(screen.getByTestId('kit-achat')).toBeInTheDocument()
      expect(screen.getByText(/Le tarif est de 48/)).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /Je commence, 48/ }),
      ).toHaveAttribute('href', 'https://h3c.fr/kit-test-profil')
    } finally {
      vi.useRealTimers()
    }
  })

  it("annonce la durée en trois semaines, jamais en quinze jours", () => {
    const { container } = render(<KitVsl url="" />)
    const texte = container.textContent ?? ''

    expect(texte).toMatch(/trois semaines/)
    expect(texte).not.toMatch(/quinze jours|15 jours/)
  })
})

// C5-05 — la vente fermée ne met AUCUN chemin d'achat sur la page de livraison du
// profil : le bloc n'est pas rendu du tout. `VITE_KIT_VENTE_OUVERTE` est posée au
// build par le script de mise en production, à OUVRIR_LA_VENTE="oui" seulement.
const RESULTAT: Resultat = {
  profilDominant: 'mendiant',
  profilSecondaire: null,
  scoreProfils: { mendiant: 20, sauveur: 10, controleur: 10, fantome: 10 },
  intensite: 'profond',
  scoreIntensite: 24,
  statutLivre: 'pas_lu',
  situation: 'couple_difficile',
  etatEmotionnel: 'tendu',
  pretAAgir: 'maintenant',
}

describe('bloc kit et état de la vente', () => {
  function rendre(valeur: string) {
    vi.stubEnv('VITE_KIT_VENTE_OUVERTE', valeur)
    return render(<ResultPreview resultat={RESULTAT} envoiReussi />)
  }

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('vente fermée (variable absente) : aucun bloc kit, aucun lien vers la caisse', () => {
    rendre('')

    expect(screen.queryByTestId('kit-vsl')).toBeNull()
    expect(screen.queryByText(/Je commence, 48/)).toBeNull()
  })

  it('vente ouverte : le bloc kit et son bouton sont là', () => {
    rendre('oui')

    expect(screen.getByTestId('kit-vsl')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Je commence, 48/ }),
    ).toHaveAttribute('href', 'https://h3c.fr/kit-test-profil')
  })
})
