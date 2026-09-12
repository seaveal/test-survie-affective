import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

  it("annonce la durée en trois semaines, jamais en quinze jours", () => {
    const { container } = render(<KitVsl url="" />)
    const texte = container.textContent ?? ''

    expect(texte).toMatch(/trois semaines/)
    expect(texte).not.toMatch(/quinze jours|15 jours/)
  })
})
