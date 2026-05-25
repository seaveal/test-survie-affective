import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Welcome } from './Welcome'

describe('<Welcome> (page d\'accueil enrichie 2026-05-24)', () => {
  describe('Hero', () => {
    it('affiche l\'eyebrow "Test de survie affective"', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/test de survie affective/i),
      ).toBeInTheDocument()
    })

    it('affiche le H1 "En amour, vous rejouez toujours le même scénario"', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent(/en amour, vous rejouez toujours le même scénario/i)
    })

    it('affiche le sous-titre du hero', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /le test qui met un nom sur votre schéma, et mesure à quel point il vous tient/i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche la ligne "30 questions. 5 minutes. Gratuit. Confidentiel."', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /30 questions.*5 minutes.*Gratuit.*Confidentiel/i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche le visuel boucle (SVG décoratif accessible)', () => {
      render(<Welcome onCommencer={() => {}} />)
      const svg = screen.getByRole('img', {
        name: /une silhouette répétée quatre fois en écho/i,
      })
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Boutons "Commencer le test"', () => {
    it('a au moins un bouton "Commencer le test"', () => {
      render(<Welcome onCommencer={() => {}} />)
      const boutons = screen.getAllByRole('button', {
        name: /commencer le test/i,
      })
      expect(boutons.length).toBeGreaterThanOrEqual(1)
    })

    it('a exactement DEUX boutons "Commencer le test" (hero + CTA final)', () => {
      render(<Welcome onCommencer={() => {}} />)
      const boutons = screen.getAllByRole('button', {
        name: /commencer le test/i,
      })
      expect(boutons).toHaveLength(2)
    })

    it('les DEUX boutons appellent onCommencer au clic', async () => {
      const user = userEvent.setup()
      const onCommencer = vi.fn()
      render(<Welcome onCommencer={onCommencer} />)
      const boutons = screen.getAllByRole('button', {
        name: /commencer le test/i,
      })
      await user.click(boutons[0])
      await user.click(boutons[1])
      expect(onCommencer).toHaveBeenCalledTimes(2)
    })

    it('le premier bouton est focusable au clavier', () => {
      render(<Welcome onCommencer={() => {}} />)
      const boutons = screen.getAllByRole('button', {
        name: /commencer le test/i,
      })
      boutons[0].focus()
      expect(boutons[0]).toHaveFocus()
    })
  })

  describe('Section "Le miroir"', () => {
    it('affiche le titre "Le miroir"', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', { name: /^le miroir$/i }),
      ).toBeInTheDocument()
    })

    it('affiche le texte "Sauf en amour"', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.getByText(/sauf en amour/i)).toBeInTheDocument()
    })
  })

  describe('Section "Le retournement"', () => {
    it('affiche le titre "Le retournement"', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', { name: /^le retournement$/i }),
      ).toBeInTheDocument()
    })

    it('mentionne la blessure de l\'abandon', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/une seule blessure : l'abandon/i),
      ).toBeInTheDocument()
    })
  })

  describe('Section "Les 4 profils"', () => {
    it('mentionne les 4 profils par leur nom complet', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.getByText(/le mendiant de luxe/i)).toBeInTheDocument()
      expect(screen.getByText(/le sauveur épuisé/i)).toBeInTheDocument()
      expect(screen.getByText(/le contrôleur anxieux/i)).toBeInTheDocument()
      expect(screen.getByText(/le fantôme relationnel/i)).toBeInTheDocument()
    })

    it('affiche les 4 phrases d\'archetype', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/vous performez pour mériter l'amour/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /vous vous rendez indispensable pour qu'on reste/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /vous serrez si fort que vous repoussez ceux que vous voulez garder/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/vous partez avant qu'on vous quitte/i),
      ).toBeInTheDocument()
    })
  })

  describe('Section "Ce que le test vous donne" (4 livrables)', () => {
    it('annonce les 4 livrables à la fin des 30 questions', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /votre profil dominant, et votre profil secondaire s'il existe/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /l'intensité de votre schéma aujourd'hui : surface, modéré ou profond/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /les 7 symptômes que vous vivez, lus à travers votre profil/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /votre prochain pas, une feuille de route adaptée à votre cas/i,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Section "Preuve sociale"', () => {
    it('mentionne 39 000 Instagram et 47 000 YouTube', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/39\s?000.*instagram.*47\s?000.*youtube/i),
      ).toBeInTheDocument()
    })

    it('nomme Cyrille Novou', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.getByText(/cyrille novou/i)).toBeInTheDocument()
    })
  })

  describe('Section "CTA final"', () => {
    it('affiche "Vous avez tout compris. Rien n\'a changé."', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', {
          name: /vous avez tout compris\. rien n'a changé\./i,
        }),
      ).toBeInTheDocument()
    })

    it('affiche "Comprendre ne suffit pas."', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/comprendre ne suffit pas/i),
      ).toBeInTheDocument()
    })

    it('affiche la signature "La tête comprend. Le corps répare."', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/la tête comprend\. le corps répare\./i),
      ).toBeInTheDocument()
    })
  })

  describe('Garde-fous contractuels', () => {
    it('NE MENTIONNE PAS le cadeau / 20 descentes (réservé email)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.queryByText(/20 descentes/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/cadeau/i)).not.toBeInTheDocument()
    })
  })
})
