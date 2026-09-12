import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { KitVsl } from './ResultPreview'

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
