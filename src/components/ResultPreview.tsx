// ResultPreview — écran de résultat réduit au nom du profil seul.
//
// Décision Bloc 2 (2026-05-25, mission corrections-parcours-bloc2) :
// l'écran affiche désormais uniquement le nom du profil dominant + une phrase
// d'invitation + le bloc "le rapport arrive par email" + DisclaimerFooter.
//
// Retiré de l'écran (vs. version 2026-05-22) : description, intensité, modulateur,
// ambassadeur. Tout le rapport part en email via le template Brevo `test_email_resultat`.
//
// Les composants ResultLevel1/2/3 sont conservés dans le code (tests passent)
// mais ne sont plus rendus dans le parcours principal.

import { useEffect, useRef, useState } from 'react'
import { getProfil } from '../domain/result'
import type { Resultat } from '../domain/types'
import { DisclaimerFooter } from './DisclaimerFooter'
import { KIT_VIDEO } from '../kitVideo'

interface Props {
  resultat: Pick<Resultat, 'profilDominant'>
  envoiReussi: boolean
  apercu?: boolean
  envoiEnCours?: boolean
}

// Une valeur vide explicite permet de désactiver la vidéo. Sinon : montage validé.
const VSL_KIT_URL: string = import.meta.env.VITE_VSL_KIT_URL ?? KIT_VIDEO.url

// Le bouton de découverte apparaît après six minutes de lecture. Une surcharge
// facultative permet de changer ce délai (temps à l’écran pour un iframe tiers).
const VSL_KIT_BOUTON_APRES_S: string =
  import.meta.env.VITE_VSL_KIT_BOUTON_APRES_S ?? String(KIT_VIDEO.buttonAfter)

export function KitVsl({
  url = VSL_KIT_URL,
  boutonApresS = VSL_KIT_BOUTON_APRES_S,
}: {
  url?: string
  boutonApresS?: string
}) {
  const delai = Number.parseFloat(boutonApresS) || 0
  const [boutonVisible, setBoutonVisible] = useState(!url || delai <= 0)
  const [erreurVideo, setErreurVideo] = useState(false)
  const fichierVideo = /\.mp4(?:[?#]|$)/i.test(url)
  const lecteur = useRef<HTMLIFrameElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [lectureBloquee, setLectureBloquee] = useState(false)

  useEffect(() => {
    if (!fichierVideo || !video.current) return
    let actif = true
    video.current.play().catch(() => { if (actif) setLectureBloquee(true) })
    return () => { actif = false }
  }, [url, fichierVideo])

  const lancerLecture = () => {
    video.current?.play().then(() => setLectureBloquee(false))
      .catch(() => setLectureBloquee(true))
  }

  // La lecture réelle d'un iframe tiers n'est pas lisible par le navigateur : le
  // compte part du moment où le lecteur entre dans l'écran, pas du chargement de
  // la page.
  useEffect(() => {
    const cible = lecteur.current
    if (fichierVideo || boutonVisible || !cible) return
    let minuteur: ReturnType<typeof setTimeout>
    const partir = () => {
      minuteur = setTimeout(() => setBoutonVisible(true), delai * 1000)
    }
    const io = new IntersectionObserver((entrees) => {
      if (!entrees[0].isIntersecting) return
      io.disconnect()
      partir()
    })
    io.observe(cible)
    return () => {
      io.disconnect()
      clearTimeout(minuteur)
    }
  }, [boutonVisible, delai, fichierVideo])

  return (
    <section
      className="mx-3 mb-6 rounded-xl p-3 sm:mx-6 sm:p-6"
      style={{
        background: 'var(--h3c-fond-card)',
        borderLeft: '4px solid var(--h3c-accent-primaire)',
      }}
      data-testid="kit-vsl"
    >
      <h2 className="text-xl">En attendant, regardez cette vidéo</h2>
      <p className="mt-4 text-base leading-relaxed">
        Découvrez pourquoi il ne suffit pas de comprendre ses schémas pour sortir
        de la dépendance affective, et comment faire un premier pas concret.
      </p>

      {url && fichierVideo ? (
        <>
          <video
            src={url}
            poster={url === KIT_VIDEO.url ? KIT_VIDEO.poster : undefined}
            ref={video}
            autoPlay
            disablePictureInPicture
            disableRemotePlayback
            onClick={lancerLecture}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                lancerLecture()
              }
            }}
            tabIndex={0}
            onPlay={() => setLectureBloquee(false)}
            playsInline
            preload="metadata"
            aria-label="Le Kit de démarrage — vidéo de Cyrille Novou"
            className="mt-4 block w-full rounded-lg"
            style={{ aspectRatio: '1 / 1', background: '#FAF8F5' }}
            data-testid="kit-vsl-lecteur"
            onTimeUpdate={(event) => {
              if (event.currentTarget.currentTime >= delai) setBoutonVisible(true)
            }}
            onEnded={() => setBoutonVisible(true)}
            onError={() => setErreurVideo(true)}
          >
            <a href={url}>Ouvrir la vidéo</a>
          </video>
          {lectureBloquee && !erreurVideo && (
            <p className="mt-3 text-sm" role="status">
              Touchez la vidéo pour lancer la lecture.
            </p>
          )}
          {erreurVideo && (
            <p role="status" className="mt-3 text-sm">
              La vidéo n’a pas pu démarrer. <a className="underline" href={url}>Ouvrir la vidéo</a>.
            </p>
          )}
        </>
      ) : url ? (
        <iframe
          ref={lecteur}
          src={url}
          title="Le Kit de démarrage"
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="mt-4 block w-full rounded-lg"
          style={{ aspectRatio: '16 / 9', border: 0 }}
          data-testid="kit-vsl-lecteur"
        />
      ) : null}

      {boutonVisible ? (
        <div data-testid="kit-achat">
          <p className="mt-3 text-base font-medium leading-relaxed">
            Le tarif est de 48&nbsp;€.
          </p>

          <a
            href="https://h3c.fr/kit-test-profil"
            className="mt-5 block rounded-lg px-6 py-4 text-center text-base font-medium text-white shadow-md transition hover:scale-[1.02]"
            style={{ background: 'var(--h3c-accent-primaire)' }}
          >
            Je découvre le KIT
          </a>
        </div>
      ) : null}
    </section>
  )
}

export function ResultPreview({ resultat, envoiReussi, apercu = false, envoiEnCours = false }: Props) {
  const profil = getProfil(resultat.profilDominant)

  return (
    <article className="mx-auto flex max-w-2xl flex-col" data-testid="result-preview">
      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12 text-center">
        {/* Vignette de Cyrille (exigence Cyrille, pages v2 du 30/09) : ronde, ~110 px,
            anneau terracotta. Portrait servi depuis public/. */}
        <picture className="mx-auto block">
          <source srcSet="/portrait-cyrille.webp" type="image/webp" />
          <img
            src="/portrait-cyrille.jpg"
            width={110}
            height={110}
            alt="Cyrille Novou"
            decoding="async"
            className="block rounded-full object-cover"
            style={{
              width: 110,
              height: 110,
              border: '3px solid #fff',
              boxShadow: '0 0 0 3px var(--h3c-accent-terracotta), 0 4px 12px rgba(0,0,0,.08)',
            }}
            data-testid="vignette-cyrille"
          />
        </picture>
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {apercu ? 'Exemple de résultat' : 'Votre profil'}
        </p>
        <h1 className="text-3xl md:text-4xl">{profil.nom}</h1>
        <p
          className="mt-2 text-base"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {apercu ? 'Aperçu de la page affichée après le test.' : 'La suite arrive dans votre email.'}
        </p>
      </section>

      <section
        className="mx-6 mb-6 rounded-xl p-6"
        style={{
          background: 'var(--h3c-fond-card)',
          borderLeft: '4px solid var(--h3c-accent-secondaire)',
        }}
      >
        <h2 className="text-xl">{envoiReussi || apercu ? 'Votre rapport arrive dans une dizaine de minutes' : 'Votre demande est en cours d’envoi'}</h2>
        <p className="mt-3 text-base leading-relaxed">
          Vous recevrez par email le détail de votre profil, votre feuille de route
          et votre séance guidée offerte.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {apercu ? 'Cet aperçu utilise un profil d’exemple et ne déclenche aucun envoi.' : 'Pensez à vérifier vos spams si vous ne trouvez pas le message.'}
        </p>
        {!envoiReussi && !envoiEnCours && (
          <p
            role="status"
            className="mt-4 text-sm"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
            data-testid="result-retry-note"
          >
            Votre demande est conservée sur cet appareil. Revenez sur le test avec
            une connexion pour la transmettre ; votre rapport sera ensuite envoyé
            dans une dizaine de minutes.
          </p>
        )}
      </section>

      {/* C5-05 (audit cycle 5) — LE BLOC D'ACHAT NE PART PAS EN LIGNE QUAND LA
          VENTE EST FERMÉE. Il était rendu sans condition : pendant toute la fenêtre
          de rejeu (vente fermée), cette page proposait « Je commence, 48 € » vers une
          page /kit qui n'a aucun chemin d'achat. Les pages du livre ont leurs
          sentinelles pour cette raison exacte (C2-11) ; le front du Test n'avait rien.
          `VITE_KIT_VENTE_OUVERTE` est posée au BUILD par le script de mise en
          production, à OUVRIR_LA_VENTE="oui" seulement. Lue ici telle quelle, et non
          derrière une constante : Vite la replie, et tout le bloc — bouton et lien de
          caisse compris — DISPARAÎT du bundle quand elle est vide, ce qu'un grep
          prouve (mémoire `test-sa-spa-greper-le-bundle`). */}
      {import.meta.env.VITE_KIT_VENTE_OUVERTE ? <KitVsl /> : null}

      <DisclaimerFooter />
    </article>
  )
}
