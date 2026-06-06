import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Welcome } from './Welcome'

describe('<Welcome> v3 — refonte design 2026-05-29 (visage → masque + 4 cartes)', () => {
  describe('Hero', () => {
    it('affiche l\'eyebrow "Test de survie affective" (distinct du disclaimer footer qui mentionne aussi "Le Test de survie affective et le programme Régénération...")', () => {
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

    it('affiche le bloc autorisation - 1re ligne (un masque parmi quatre)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Derrière chaque scénario qui se répète, il y a un masque parmi quatre\./i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche le bloc autorisation - rafale 4 profils (Mendiant. Sauveur. Contrôleur. Fantôme.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/Mendiant\. Sauveur\. Contrôleur\. Fantôme\./i),
      ).toBeInTheDocument()
    })

    it('affiche le bloc autorisation - paragraphe autorisations (derrière ce masque, ressentir, décevoir, poser une limite, ou prendre de la place)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Et derrière ce masque, une autorisation que vous n'avez jamais reçue.*ressentir, décevoir, poser une limite, ou prendre de la place\./i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche la promesse test 1re phrase (Le test ne vous donnera pas une compréhension de plus.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Le test ne vous donnera pas une compréhension de plus\./i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche la promesse test 2e phrase (Il vous donnera un nom, un masque, et la prochaine action.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Il vous donnera un nom, un masque, et la prochaine action\./i,
        ),
      ).toBeInTheDocument()
    })

    it('affiche le nouveau visuel MasquesHero (SVG décoratif accessible, 4 masques alignés)', () => {
      render(<Welcome onCommencer={() => {}} />)
      const svg = screen.getByRole('img', {
        name: /quatre masques alignés, du plus pâle au plus net/i,
      })
      expect(svg).toBeInTheDocument()
    })

    it('NE contient PLUS le visuel BoucleHero (silhouette répétée)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByRole('img', {
          name: /silhouette répétée quatre fois en écho/i,
        }),
      ).not.toBeInTheDocument()
    })

    it('NE contient PLUS le sous-titre V2.1 ("révèle ce qui vous empêche d\'en sortir")', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/révèle ce qui vous empêche d'en sortir/i),
      ).not.toBeInTheDocument()
    })

    it('NE contient PLUS la formulation V2.3 ("interdictions pilote vos relations")', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/interdictions pilote vos relations/i),
      ).not.toBeInTheDocument()
    })

    it('NE contient PLUS la formulation V2.4 ("lequel de ces visages vous habite")', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/lequel de ces visages vous habite/i),
      ).not.toBeInTheDocument()
    })
  })

  describe('Bloc 4 cartes masques (centre de gravité visuel)', () => {
    it('affiche les 4 cartes masques en role="list"', () => {
      render(<Welcome onCommencer={() => {}} />)
      const liste = screen.getByRole('list', { name: /quatre masques du test/i })
      expect(liste).toBeInTheDocument()
      // Scope la recherche à la liste des masques (d'autres role="list"
      // coexistent : Caractéristiques du test + Communauté).
      const { getAllByRole } = within(liste)
      expect(getAllByRole('listitem')).toHaveLength(4)
    })

    it('affiche le nom canonique MENDIANT DE LUXE (issu de profils.ts)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', { level: 2, name: /^mendiant de luxe$/i }),
      ).toBeInTheDocument()
    })

    it('affiche le nom canonique SAUVEUR ÉPUISÉ (issu de profils.ts)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', { level: 2, name: /^sauveur épuisé$/i }),
      ).toBeInTheDocument()
    })

    it('affiche le nom canonique CONTRÔLEUR ANXIEUX (issu de profils.ts)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /^contrôleur anxieux$/i,
        }),
      ).toBeInTheDocument()
    })

    it('affiche le nom canonique FANTÔME RELATIONNEL (issu de profils.ts)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /^fantôme relationnel$/i,
        }),
      ).toBeInTheDocument()
    })

    it('affiche la phrase de tension Mendiant (Vous brillez. Vous performez. Vous excellez.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/Vous brillez\. Vous performez\. Vous excellez\./i),
      ).toBeInTheDocument()
    })

    it('affiche la phrase de tension Sauveur (Vous donnez. Vous aidez. Vous sauvez.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/Vous donnez\. Vous aidez\. Vous sauvez\./i),
      ).toBeInTheDocument()
    })

    it('affiche la phrase de tension Contrôleur (Vous anticipez. Vous vérifiez. Vous contrôlez.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/Vous anticipez\. Vous vérifiez\. Vous contrôlez\./i),
      ).toBeInTheDocument()
    })

    it('affiche la phrase de tension Fantôme (Vous disparaissez. Vous vous effacez. Vous fuyez.)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /Vous disparaissez\. Vous vous effacez\. Vous fuyez\./i,
        ),
      ).toBeInTheDocument()
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

  describe('Preuve sociale et meta CTA', () => {
    it('affiche la ligne caractéristiques (30 questions, 5 minutes, gratuit, confidentiel)', () => {
      render(<Welcome onCommencer={() => {}} />)
      const liste = screen.getByRole('list', {
        name: /caractéristiques du test/i,
      })
      expect(liste).toBeInTheDocument()
      // Scope sur la liste pour éviter collision avec DisclaimerFooter
      // (qui mentionne "gratuit" pour le 3114).
      expect(liste).toHaveTextContent(/30 questions/i)
      expect(liste).toHaveTextContent(/5 minutes/i)
      expect(liste).toHaveTextContent(/gratuit/i)
      expect(liste).toHaveTextContent(/confidentiel/i)
    })

    it('affiche la preuve sociale 3 réseaux (39 000 IG, 47 000 YT, 13 000 FB)', () => {
      render(<Welcome onCommencer={() => {}} />)
      const liste = screen.getByRole('list', { name: /communauté/i })
      expect(liste).toBeInTheDocument()
      expect(liste).toHaveTextContent(/39\s?000/)
      expect(liste).toHaveTextContent(/47\s?000/)
      expect(liste).toHaveTextContent(/13\s?000/)
      expect(liste).toHaveTextContent(/instagram/i)
      expect(liste).toHaveTextContent(/youtube/i)
      expect(liste).toHaveTextContent(/facebook/i)
    })

    it('affiche la 2e ligne de preuve sociale "+ 700 témoignages"', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(
          /En cinq ans, plus de 700 femmes et hommes ont écrit pour la même raison\. La vôtre y est sans doute aussi\./i,
        ),
      ).toBeInTheDocument()
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

  describe('Garde-fous : substitution visage → masque (mission 2026-05-29)', () => {
    it('NE contient PLUS "il y a un visage parmi quatre" (remplacé par "un masque parmi quatre")', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/il y a un visage parmi quatre/i),
      ).not.toBeInTheDocument()
    })

    it('NE contient PLUS "derrière ce visage" (remplacé par "derrière ce masque")', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/derrière ce visage/i),
      ).not.toBeInTheDocument()
    })

    it('NE contient PLUS "un nom, un visage, et la prochaine action" (remplacé par "un nom, un masque, ...")', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByText(/un nom, un visage, et la prochaine action/i),
      ).not.toBeInTheDocument()
    })
  })

  describe('Garde-fous contractuels (anti-régression du raccourcissement)', () => {
    it('NE MENTIONNE PAS le cadeau / 20 descentes (réservé email)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.queryByText(/20 descentes/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/cadeau/i)).not.toBeInTheDocument()
    })

    it('NE contient plus les sections de vente supprimées (miroir, retournement)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.queryByRole('heading', { name: /^le miroir$/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: /^le retournement$/i }),
      ).not.toBeInTheDocument()
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

    it('MENTIONNE « Cyrille NOVOU » dans le bandeau auteur sous le H1 (SEO E-E-A-T, renverse la decision V2 redesign 2026-05-26 par decision Cyrille 2026-06-06)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(screen.getByText(/cyrille novou/i)).toBeInTheDocument()
    })

    it('MENTIONNE le titre du livre « Vous avez tout compris. Rien n\'a changé. » dans le bandeau auteur (SEO branded 2026-06-06)', () => {
      render(<Welcome onCommencer={() => {}} />)
      expect(
        screen.getByText(/vous avez tout compris\.\s*rien n['’]a changé\./i),
      ).toBeInTheDocument()
    })

    it('NE réintroduit AUCUN terme banni Règle 12 dans la copy marketing (le DisclaimerFooter est exempt car requis par la loi 1985)', () => {
      render(<Welcome onCommencer={() => {}} />)
      // Scope strict : le <main> (la copy commerciale) — pas le <footer>
      // disclaimer, qui DOIT citer "psychothérapie au sens de la loi 1985"
      // et "psychothérapeute reconnu ARS" pour disqualifier le programme
      // de ces catégories réglementées (Règle 12 / repositionnement coaching).
      const main = screen.getByRole('main')
      const text = main.textContent ?? ''
      expect(text).not.toMatch(/thérapie/i)
      expect(text).not.toMatch(/thérapeut/i)
      expect(text).not.toMatch(/diagnostic/i)
      expect(text).not.toMatch(/guérir/i)
      expect(text).not.toMatch(/guérison/i)
      expect(text).not.toMatch(/trauma/i)
      expect(text).not.toMatch(/(^|\s)patient(\s|$|s)/i)
    })

    it('respecte la charte voix v2 : aucun tiret cadratin et aucun point-virgule', () => {
      const { container } = render(<Welcome onCommencer={() => {}} />)
      const text = container.textContent ?? ''
      expect(text).not.toMatch(/—/)
      expect(text).not.toMatch(/;/)
    })
  })
})
