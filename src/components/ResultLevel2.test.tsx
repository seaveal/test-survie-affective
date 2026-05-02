import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultLevel2 } from './ResultLevel2'
import type { Resultat } from '../domain/types'

const r: Resultat = {
  profilDominant: 'mendiant',
  profilSecondaire: null,
  scoreProfils: { mendiant: 60, sauveur: 0, controleur: 0, fantome: 0 },
  intensite: 'modere',
  scoreIntensite: 18,
  statutLivre: 'pas_lu',
  situation: 'celibat_long',
  etatEmotionnel: 'fonctionnel',
  pretAAgir: 'incertain',
}

describe('<ResultLevel2> — 7 symptômes', () => {
  it('affiche un titre et la liste des 7 symptômes', () => {
    render(<ResultLevel2 resultat={r} />)
    expect(screen.getByRole('heading')).toHaveTextContent(/7 symptômes/i)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(7)
  })

  it("les 7 symptômes du profil mendiant sont présents (quête de regard, etc.)", () => {
    render(<ResultLevel2 resultat={r} />)
    expect(screen.getByText(/quête de regard/i)).toBeInTheDocument()
    expect(screen.getByText(/honte de soi/i)).toBeInTheDocument()
  })
})
