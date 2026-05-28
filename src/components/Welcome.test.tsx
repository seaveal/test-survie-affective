import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Welcome } from './Welcome'

describe('<Welcome> (écran d\'accueil court v2 — 2026-05-25)', () => {
  describe('Hero', () => {
    it('affiche l\'eyebrow "Test de survie affective" (exact, à distinguer du disclaimer footer qui mentionne aussi "Le Test de survie affective et le programme Régénération...")', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/^test de survie affective$/i),
      ).toBeInTheDocument()
    })

    it('affiche le H1 "En amour, vous rejouez toujours le même scénario"', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', { level: 1 }),
      ).toHaveTextContent(/en amour, vous rejouez toujours le même scénario/i)
    })

    it('affiche le bloc autorisation - 1re ligne (Derrière chaque scénario qui se répète, il y a une autorisation...)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Derrière chaque scénario qui se répète, il y a une autorisation que vous n'avez jamais reçue/i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche le bloc autorisation - ligne médiane (Ressentir. Décevoir. Poser une limite. Prendre de la place.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Ressentir\. Décevoir\. Poser une limite\. Prendre de la place\./i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche le bloc autorisation - 3e ligne (Le test vous dit laquelle de ces interdictions pilote vos relations.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Le test vous dit laquelle de ces interdictions pilote vos relations\./i,
        ),
      ).toBeInTheDocument()
    })

    it('NE contient PLUS le sous-titre V2.1 ("révèle ce qui vous empêche d\'en sortir") - remplacé par le bloc autorisation 2026-05-29', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/révèle ce qui vous empêche d'en sortir/i),
      ).not.toBeInTheDocument()
    })

    it('affiche la ligne "30 questions. 5 minutes. Gratuit. Confidentiel." (V2.1 rythme percussif)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/30 questions\. 5 minutes\. Gratuit\. Confidentiel\./i),
      ).toBeInTheDocument()
    })

    it('affiche la ligne de preuve sociale 3 réseaux (Instagram + YouTube + Facebook)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Rejoint par plus de 39\s?000.*Instagram.*47\s?000.*YouTube.*13\s?000.*Facebook/i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche la 2e ligne de preuve sociale "+ 700 RDV" (V2.1 voix client 737 RDV YCBM)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /En cinq ans, plus de 700 femmes et hommes ont écrit pour la même raison\. La vôtre y est sans doute aussi\./i,
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

  describe('Bouton "Commencer le test"', () => {
    it('a exactement UN bouton "Commencer le test" (hero seul, plus de CTA final)', () => {
      render(<Welcome onCommencer={() => {}} />)
      const boutons = screen.getAllByRole('button', {
        name: /commencer le test/i,
      })
      expect(boutons).toHaveLength(1)
    })

    it('le bouton appelle onCommencer au clic', async () => {
      const user = userEvent.setup()
      const onCommencer = vi.fn()
      render(<Welcome onCommencer={onCommencer} />)
      const bouton = screen.getByRole('button', { name: /commencer le test/i })
      await user.click(bouton)
      expect(onCommencer).toHaveBeenCalledTimes(1)
    })

    it('le bouton est focusable au clavier', () => {
      render(<Welcome onCommencer={() => {}} />)
      const bouton = screen.getByRole('button', { name: /commencer le test/i })
      bouton.focus()
      expect(bouton).toHaveFocus()
    })
  })

  describe('DisclaimerFooter Règle 12 (branché sur la route welcome)', () => {
    it('affiche le mot "Avertissement" en tête du disclaimer', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.getByText(/avertissement/i)).toBeInTheDocument()
    })

    it('rappelle que Régénération n\'est pas une psychothérapie au sens de la loi de 1985', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/loi du 25 juillet 1985/i),
      ).toBeInTheDocument()
    })

    it('mentionne le 3114 (prévention du suicide)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.getByText(/3114/)).toBeInTheDocument()
    })

    it('présente les 3 liens légaux (Mentions / CGV / Confidentialité)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('link', { name: /mentions légales/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /^cgv$/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /politique de confidentialité/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Garde-fous contractuels (anti-régression du raccourcissement)', () => {
    it('NE MENTIONNE PAS le cadeau / 20 descentes (réservé email)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.queryByText(/20 descentes/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/cadeau/i)).not.toBeInTheDocument()
    })

    it('NE contient plus les sections de vente supprimées (miroir, retournement, 4 profils)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByRole('heading', { name: /^le miroir$/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: /^le retournement$/i }),
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/le mendiant de luxe/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/le sauveur épuisé/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/le contrôleur anxieux/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/le fantôme relationnel/i)).not.toBeInTheDocument()
    })

    it('NE contient plus la signature "La tête comprend. Le corps répare."', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/la tête comprend\. le corps répare\./i),
      ).not.toBeInTheDocument()
    })

    it('NE contient plus le H2 final "Vous avez tout compris."', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByRole('heading', {
          name: /vous avez tout compris\. rien n'a changé\./i,
        }),
      ).not.toBeInTheDocument()
    })

    it('NE mentionne PAS « Cyrille Novou » nommément dans la preuve sociale (V2 redesign 2026-05-26 : preuve sociale rendue impersonnelle)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.queryByText(/cyrille novou/i)).not.toBeInTheDocument()
    })
  })
})
