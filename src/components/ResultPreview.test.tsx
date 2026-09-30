import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KitVsl, ResultPreview } from './ResultPreview'
import type { Resultat } from '../domain/types'

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
})
afterEach(() => vi.restoreAllMocks())

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
      screen.getByRole('link', { name: /Je découvre le KIT/ }),
    ).toHaveAttribute('href', 'https://h3c.fr/kit-test-profil')
  })

  it('avec une URL de VSL : le lecteur est rendu, le texte et le bouton restent', () => {
    render(<KitVsl url="https://exemple.test/vsl-kit" boutonApresS="" />)

    const lecteur = screen.getByTestId('kit-vsl-lecteur')
    expect(lecteur).toHaveAttribute('src', 'https://exemple.test/vsl-kit')
    expect(screen.getByText(/Le tarif est de 48/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Je découvre le KIT/ }),
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
        screen.getByRole('link', { name: /Je découvre le KIT/ }),
      ).toHaveAttribute('href', 'https://h3c.fr/kit-test-profil')
    } finally {
      vi.useRealTimers()
    }
  })

  it('invite à regarder la vidéo pour commencer à sortir de la dépendance affective', () => {
    render(<KitVsl url="" />)
    expect(screen.getByText(/de la dépendance affective/)).toBeInTheDocument()
  })

  it('MP4 carré : lecture intégrée et délai facultatif, sans minuteur à l’arrêt', () => {
    vi.useFakeTimers()
    try {
      render(<KitVsl />)
      const video = screen.getByTestId('kit-vsl-lecteur') as HTMLVideoElement
      expect(video.tagName).toBe('VIDEO')
      expect(video).not.toHaveAttribute('controls')
      expect(video).toHaveAttribute('playsinline')
      expect(video).toHaveAttribute('preload', 'metadata')
      expect(video).toHaveAttribute('autoplay')
      expect(video).toHaveStyle({ aspectRatio: '1 / 1' })
      expect(video.querySelector('track')).toBeNull()
      act(() => void vi.advanceTimersByTime(600000))
      expect(screen.queryByTestId('kit-achat')).toBeNull()
      fireEvent.timeUpdate(video, {target:{currentTime:359.9}})
      expect(screen.queryByTestId('kit-achat')).toBeNull()
      fireEvent.timeUpdate(video, {target:{currentTime:360}})
      expect(screen.getByTestId('kit-achat')).toBeInTheDocument()
      fireEvent.timeUpdate(video, {target:{currentTime:10}})
      expect(screen.getByTestId('kit-achat')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('une erreur vidéo propose le fichier sans révéler le bouton avant six minutes', () => {
    render(<KitVsl />)
    fireEvent.error(screen.getByTestId('kit-vsl-lecteur'))
    expect(screen.getByRole('status')).toHaveTextContent('La vidéo n’a pas pu démarrer')
    expect(screen.queryByTestId('kit-achat')).toBeNull()
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
    expect(screen.queryByText(/Je découvre le KIT/)).toBeNull()
  })

  it('vente ouverte : vidéo sans sous-titres et bouton après six minutes', () => {
    rendre('oui')

    expect(screen.getByTestId('kit-vsl')).toBeInTheDocument()
    const video = screen.getByTestId('kit-vsl-lecteur')
    expect(video.querySelector('track')).toBeNull()
    expect(screen.queryByTestId('kit-achat')).toBeNull()
    fireEvent.timeUpdate(video, {target:{currentTime:360}})
    expect(screen.getByTestId('kit-achat')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Je découvre le KIT/ }),
    ).toHaveAttribute('href', 'https://h3c.fr/kit-test-profil')
  })
})


describe('attente du rapport et démarrage de la vidéo', () => {
  it('affiche la vignette de Cyrille en tête, vente ouverte ou fermée', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi />)
    const vignette = screen.getByRole('img', { name: 'Cyrille Novou' })
    expect(vignette).toHaveAttribute('src', '/portrait-cyrille.jpg')
    expect(vignette.closest('picture')?.querySelector('source')).toHaveAttribute('srcset', '/portrait-cyrille.webp')
  })

  it('annonce une dizaine de minutes après réception de la demande', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi />)
    expect(screen.getByRole('heading', {name: 'Votre rapport arrive dans une dizaine de minutes'})).toBeInTheDocument()
  })

  it('ne promet pas un rapport en route lorsque la demande est restée hors ligne', () => {
    render(<ResultPreview resultat={RESULTAT} envoiReussi={false} />)
    expect(screen.getByTestId('result-retry-note')).toHaveTextContent('Revenez sur le test')
    expect(screen.queryByRole('heading', {name: 'Votre rapport arrive dans une dizaine de minutes'})).toBeNull()
  })

  it('permet de lancer la vidéo au toucher si le navigateur bloque le démarrage', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValueOnce(new DOMException('NotAllowed', 'NotAllowedError'))
      .mockResolvedValue()
    render(<KitVsl />)
    expect(await screen.findByText('Touchez la vidéo pour lancer la lecture.')).toBeInTheDocument()
    const video = screen.getByTestId('kit-vsl-lecteur')
    await act(async () => fireEvent.click(video))
    expect(play).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('Touchez la vidéo pour lancer la lecture.')).toBeNull()
  })
})
