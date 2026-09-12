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

interface Props {
  resultat: Resultat
  envoiReussi: boolean
}

// VSL du kit (mission kit evergreen §9) : une seule constante de config.
// Renseigner VITE_VSL_KIT_URL le jour où la vidéo est tournée. Vide = pas de
// lecteur, le texte et le bouton restent. Aucun emplacement visible entre-temps.
export const VSL_KIT_URL: string = import.meta.env.VITE_VSL_KIT_URL ?? ''

// Délai avant l'apparition du bouton d'achat et de son prix, en secondes.
// Règle de calcul : durée de la vidéo x 0,6, en secondes. Cyrille la pose à la
// main : le navigateur ne connaît pas la durée d'un lecteur tiers. Vide ou 0, ou
// VSL_KIT_URL vide (pas de lecteur) : le bouton est là tout de suite.
export const VSL_KIT_BOUTON_APRES_S: string =
  import.meta.env.VITE_VSL_KIT_BOUTON_APRES_S ?? ''

export function KitVsl({
  url = VSL_KIT_URL,
  boutonApresS = VSL_KIT_BOUTON_APRES_S,
}: {
  url?: string
  boutonApresS?: string
}) {
  const delai = Number.parseFloat(boutonApresS) || 0
  const [boutonVisible, setBoutonVisible] = useState(!url || delai <= 0)
  const lecteur = useRef<HTMLIFrameElement>(null)

  // La lecture réelle d'un iframe tiers n'est pas lisible par le navigateur : le
  // compte part du moment où le lecteur entre dans l'écran, pas du chargement de
  // la page.
  useEffect(() => {
    const cible = lecteur.current
    if (boutonVisible || !cible) return
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
  }, [boutonVisible, delai])

  return (
    <section
      className="mx-6 mb-6 rounded-xl p-6"
      style={{
        background: 'var(--h3c-fond-card)',
        borderLeft: '4px solid var(--h3c-accent-primaire)',
      }}
      data-testid="kit-vsl"
    >
      <h2 className="text-xl">Et maintenant&nbsp;?</h2>

      {url ? (
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

      <p className="mt-4 text-base leading-relaxed">
        Ce nom, votre tête vient de l'apprendre. Votre corps, lui, il le connaît
        depuis trente ans, et de tout ce que vous venez de lire, il n'a rien lu.
      </p>
      <p className="mt-3 text-base leading-relaxed">
        Cette distance ne se franchit pas en comprenant mieux, sinon vous seriez
        arrivé depuis longtemps. Elle se franchit dans le corps, et dans un
        ordre&nbsp;: ressentir, libérer, s'ouvrir à recevoir.
      </p>
      <p className="mt-3 text-base leading-relaxed">
        Le Kit de démarrage, ce sont ces trois semaines. Un jour, une action&nbsp;:
        une séance guidée pour descendre dans votre corps, à l'heure que vous
        voulez, moins d'une demi-heure. Jusqu'à deux dimanches soir, une
        libération en direct. Le mercredi soir, vos questions.
      </p>
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
            Je commence, 48&nbsp;€
          </a>
        </div>
      ) : null}
    </section>
  )
}

export function ResultPreview({ resultat, envoiReussi }: Props) {
  const profil = getProfil(resultat.profilDominant)

  return (
    <article className="mx-auto flex max-w-2xl flex-col" data-testid="result-preview">
      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12 text-center">
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Votre profil
        </p>
        <h1 className="text-3xl md:text-4xl">{profil.nom}</h1>
        <p
          className="mt-2 text-base"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          La suite arrive dans votre email.
        </p>
      </section>

      <section
        className="mx-6 mb-6 rounded-xl p-6"
        style={{
          background: 'var(--h3c-fond-card)',
          borderLeft: '4px solid var(--h3c-accent-secondaire)',
        }}
      >
        <h2 className="text-xl">Votre rapport complet est en chemin</h2>
        <p className="mt-3 text-base leading-relaxed">
          Le détail de votre profil, les sept symptômes que vous reconnaissez sans
          doute, votre feuille de route, et votre cadeau (une séance de descente dans le
          corps, guidée par ma voix) arrivent dans votre boîte.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Vérifiez vos messages dans les prochaines minutes. Pensez aux spams.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Votre cadeau reste accessible pendant 3 jours.
        </p>
        {!envoiReussi && (
          <p
            role="status"
            className="mt-4 text-sm"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
            data-testid="result-retry-note"
          >
            L'envoi est en file d'attente. Votre profil partira dès que la connexion
            sera rétablie. Vous pouvez fermer cette page.
          </p>
        )}
      </section>

      <KitVsl />

      <DisclaimerFooter />
    </article>
  )
}
