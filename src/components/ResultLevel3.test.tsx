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

  // Bloc 2 (2026-05-25) : CTA aplati, livre retiré du parcours. Tous les statuts
  // basculent sur le même chemin cadeau-descente + appel YCBM.
  it('CTA principal cadeau-first (identique pour les 3 statutLivre)', () => {
    for (const statut of ['pas_lu', 'lu_partiel', 'lu_complet'] as const) {
      const r = { ...baseResultat, statutLivre: statut }
      const { unmount } = render(<ResultLevel3 resultat={r} />)
      const cta = screen.getByRole('link', { name: /ouvrir mon email/i })
      expect(cta, `principal/${statut}`).toHaveAttribute('href', '#')
      unmount()
    }
  })

  it('CTA secondaire pointe vers YCBM réel (identique pour les 3 statutLivre)', () => {
    for (const statut of ['pas_lu', 'lu_partiel', 'lu_complet'] as const) {
      const r = { ...baseResultat, statutLivre: statut }
      const { unmount } = render(<ResultLevel3 resultat={r} />)
      const cta = screen.getByRole('link', { name: /découvrir le séminaire/i })
      expect(cta, `secondaire/${statut}`).toHaveAttribute(
        'href',
        expect.stringMatching(/h3c\.fr\/solution/i),
      )
      unmount()
    }
  })

  it("ne mentionne plus 'chapitres à relire' (livre gelé par flag LIVRE_DISPONIBLE=false par défaut)", () => {
    // Tous les statuts désormais : pas d'affichage chapitres tant que VITE_LIVRE_DISPONIBLE=true non activé.
    for (const statut of ['pas_lu', 'lu_partiel', 'lu_complet'] as const) {
      const r = { ...baseResultat, statutLivre: statut }
      const { unmount } = render(<ResultLevel3 resultat={r} />)
      expect(screen.queryByText(/chapitres à relire/i), `chapitres/${statut}`).not.toBeInTheDocument()
      unmount()
    }
  })
})
