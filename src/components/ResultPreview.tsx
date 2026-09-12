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

export function KitVsl({ url = VSL_KIT_URL }: { url?: string }) {
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
        Le Kit de démarrage, ce sont ces trois semaines. Chaque matin, une séance
        guidée pour descendre dans votre corps, moins d'une demi-heure. Les
        dimanches soir, une libération en direct. Le mercredi soir, vos questions.
      </p>
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
