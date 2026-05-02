import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultLevel3 } from './ResultLevel3'
import type { Resultat } from '../domain/types'

const baseResultat: Resultat = {
  profilDominant: 'fantome',
  profilSecondaire: null,
  scoreProfils: { mendiant: 0, sauveur: 0, controleur: 0, fantome: 60 },
  intensite: 'modere',
  scoreIntensite: 18,
  statutLivre: 'pas_lu',
  situation: 'celibat_long',
  etatEmotionnel: 'fonctionnel',
  pretAAgir: 'incertain',
}

describe('<ResultLevel3> — Roadmap + CTA', () => {
  it('affiche les 3 pas et l\'exercice corporel', () => {
    render(<ResultLevel3 resultat={baseResultat} />)
    expect(screen.getByText(/cette semaine/i)).toBeInTheDocument()
    expect(screen.getByText(/ce mois/i)).toBeInTheDocument()
    expect(screen.getByText(/3 mois/i)).toBeInTheDocument()
    expect(screen.getByText(/exercice corporel/i)).toBeInTheDocument()
  })

  it('CTA principal pas_lu → URL livre', () => {
    render(<ResultLevel3 resultat={baseResultat} />)
    const cta = screen.getByRole('link', { name: /commander le livre/i })
    expect(cta).toHaveAttribute('href', expect.stringMatching(/livre/i))
  })

  it('CTA principal lu_complet → URL appel', () => {
    const r = { ...baseResultat, statutLivre: 'lu_complet' as const }
    render(<ResultLevel3 resultat={r} />)
    const cta = screen.getByRole('link', { name: /appel stratégique/i })
    expect(cta).toHaveAttribute('href', expect.stringMatching(/appel/i))
  })

  it("affiche les chapitres recommandés si lecteur (lu_partiel ou lu_complet)", () => {
    const r = { ...baseResultat, statutLivre: 'lu_partiel' as const }
    render(<ResultLevel3 resultat={r} />)
    expect(screen.getByRole('heading', { name: /chapitres/i })).toBeInTheDocument()
  })

  it("ne mentionne pas 'chapitres à relire' si pas_lu", () => {
    render(<ResultLevel3 resultat={baseResultat} />)
    expect(screen.queryByText(/chapitres à relire/i)).not.toBeInTheDocument()
  })
})
