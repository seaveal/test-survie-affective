import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultLevel1 } from './ResultLevel1'
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

describe('<ResultLevel1> — Révélation', () => {
  it('affiche le profil dominant et son ambassadeur', () => {
    render(<ResultLevel1 resultat={baseResultat} />)
    expect(screen.getByText(/profil dominant/i)).toBeInTheDocument()
    // Ambassadrice Pascale pour fantome
    expect(screen.getByText(/Pascale/i)).toBeInTheDocument()
  })

  it("affiche l'intensité (modéré ici)", () => {
    render(<ResultLevel1 resultat={baseResultat} />)
    expect(screen.getByText(/intensité/i)).toBeInTheDocument()
    expect(screen.getByText(/modér/i)).toBeInTheDocument()
  })

  it('mention du profil secondaire si présent (écart < 4)', () => {
    const r = { ...baseResultat, profilSecondaire: 'controleur' as const }
    render(<ResultLevel1 resultat={r} />)
    expect(screen.getByText(/double stratégie|secondaire|oscillez/i)).toBeInTheDocument()
  })

  it('pas de mention secondaire si profilSecondaire = null', () => {
    render(<ResultLevel1 resultat={baseResultat} />)
    expect(screen.queryByText(/double stratégie|oscillez/i)).not.toBeInTheDocument()
  })

  it('description de base du profil rendue', () => {
    render(<ResultLevel1 resultat={baseResultat} />)
    // Le profil fantome : phrase signature unique à la description de base
    expect(screen.getByText(/présent de corps, absent d'âme/i)).toBeInTheDocument()
  })

  it('modulateur d\'intensité spécifique au croisement profil×intensité', () => {
    render(<ResultLevel1 resultat={baseResultat} />)
    // Le modulateur fantome × modere mentionne "isolement" ou "fuite"
    const txt = document.body.textContent ?? ''
    expect(txt).toMatch(/fuir|fuite|isolement|relations|automatique/i)
  })
})
