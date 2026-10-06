import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { CaptureValues } from '../api/client'

// Textes de l'écran de l'email, posé après la 3e réponse (livraison 2), validés
// par Cyrille le 2026-10-06 (TEXTES-entonnoir, pièce A2), mot pour mot.
const TEXTES_CAPTURE = {
  surtitre: 'Votre profil offert par email',
  titre: 'Où voulez-vous recevoir votre profil ?',
  phrase:
    'Votre email permet de vous envoyer votre profil complet et de sauvegarder vos réponses pour reprendre plus tard. Votre masque s’affichera à l’écran à la fin du Test de Survie Affective.',
  bouton: 'Sauvegarder et continuer',
  sousBouton: 'Profil complet et séance de descente dans le corps offerts. Sans carte bancaire.',
} as const

interface Props {
  onSubmit: (values: CaptureValues) => void
  envoiEnCours?: boolean
  /** Refus de l'API (422, 410) : message affiché, l'email est redemandé. */
  erreurServeur?: string | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Champ fautif : il porte seul aria-invalid et le lien vers le message. */
type ChampFautif = 'email' | 'mkt'

export function CaptureScreen({ onSubmit, envoiEnCours = false, erreurServeur = null }: Props) {
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  // Consentement marketing : case DECOCHEE par defaut.
  //
  // Une case pre-cochee ne vaut pas acte positif clair (RGPD recital 32, CJUE
  // Planet49 C-673/17). Ce vice-la n'appelle aucun arbitrage : il est corrige.
  //
  // Le SECOND vice — conditionner la remise du profil a l'opt-in, contraire a
  // l'art. 7.4 — n'est PAS corrige ici, et c'est deliberé. Le lever coute des
  // leads, donc c'est une decision de Cyrille (audit 2026-08-09, rang 3 et
  // decision 2). Le garde ci-dessous reste donc en place.
  //
  // Il DOIT rester tant que la decision n'est pas rendue : son jumeau serveur
  // `require_marketing_consent` (tsa-api models.py) refuse `false` par un 422.
  // Retirer le garde ici sans retirer celui-la ne decouple rien — cela remplace
  // un message clair par un echec dur, et le visiteur n'obtient plus de profil
  // du tout. Les deux se levent ensemble, ou pas du tout.
  const [consMkt, setConsMkt] = useState(false)
  const [erreur, setErreur] = useState<{ champ: ChampFautif; message: string } | null>(null)
  const boutonRef = useRef<HTMLButtonElement>(null)

  // Un message d'erreur allonge le formulaire : on ramène le bouton à l'écran
  // (et le message, qui le précède juste au-dessus). Absent de jsdom, d'où `?.`.
  useEffect(() => {
    if (erreur || erreurServeur) boutonRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [erreur, erreurServeur])

  const signaler = (champ: ChampFautif) =>
    erreur?.champ === champ
      ? { 'aria-invalid': true as const, 'aria-describedby': 'capture-erreur' }
      : {}

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const normalise = email.trim().toLowerCase()
    if (!EMAIL_RE.test(normalise)) {
      setErreur({ champ: 'email', message: 'Merci de saisir un email valide.' })
      return
    }
    // Garde tenu en accord avec le validateur serveur, qui refuse `false` par
    // un 422 (cf. le commentaire de `consMkt`). Un message ici vaut mieux qu'un
    // echec dur la-bas. Les deux tombent ensemble le jour de la decision.
    if (!consMkt) {
      setErreur({
        champ: 'mkt',
        message: "Le consentement marketing est requis pour recevoir votre profil par email.",
      })
      return
    }
    setErreur(null)
    onSubmit({
      email: normalise,
      prenom: prenom.trim(),
      consentementMarketing: consMkt,
    })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-2 px-4 py-2 md:gap-6 md:px-6 md:py-10">
      <header className="text-center">
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {TEXTES_CAPTURE.surtitre}
        </p>
        <h1 className="mt-1 text-xl md:mt-2 md:text-4xl">{TEXTES_CAPTURE.titre}</h1>
      </header>

      <p
        className="text-[0.8125rem] leading-snug md:text-base md:leading-relaxed"
        style={{ color: 'var(--h3c-texte-secondaire)' }}
      >
        {TEXTES_CAPTURE.phrase}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-xl px-3 py-2 md:gap-5 md:p-6"
        style={{ background: 'var(--h3c-fond-card)' }}
        data-testid="capture-screen"
      >
        <label htmlFor="capture-email" className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            Email <span aria-hidden="true">*</span>
          </span>
          <input
            id="capture-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...signaler('email')}
            className="rounded-md border bg-white px-3 py-1.5 text-base md:py-2"
            style={{ borderColor: 'var(--h3c-bordure)' }}
          />
        </label>

        <label htmlFor="capture-prenom" className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Prénom (facultatif)</span>
          <input
            id="capture-prenom"
            type="text"
            autoComplete="given-name"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="rounded-md border bg-white px-3 py-1.5 text-base md:py-2"
            style={{ borderColor: 'var(--h3c-bordure)' }}
          />
        </label>

        <fieldset className="flex flex-col gap-2 md:gap-3">
          <legend className="sr-only">Vos consentements</legend>

          <label
            htmlFor="cap-cons-mkt"
            className="flex cursor-pointer items-start gap-3 text-sm leading-snug md:leading-relaxed"
          >
            <input
              id="cap-cons-mkt"
              type="checkbox"
              checked={consMkt}
              onChange={(e) => setConsMkt(e.target.checked)}
              aria-required="true"
              {...signaler('mkt')}
              className="mt-1 h-4 w-4"
            />
            <span>
              J'accepte de recevoir les emails de Cyrille Novou : ses textes, ses
              séances guidées et ses propositions d'accompagnement. Je peux me
              désinscrire en un clic, en bas de chaque email.
            </span>
          </label>

          {/* Art. 7.4 : la gratuité du consentement doit être visible à l'écran,
              pas seulement vraie dans le code. */}
          <p
            className="text-xs leading-snug md:leading-relaxed"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
          >
            Votre profil et votre cadeau vous sont envoyés par email : cochez
            cette case pour les recevoir. Vous pouvez vous désinscrire à tout
            moment, en un clic, depuis n'importe lequel de ces emails.
          </p>
        </fieldset>

        {(erreur ?? erreurServeur) && (
          <p
            id="capture-erreur"
            role="alert"
            className="text-sm"
            style={{ color: 'var(--h3c-alerte, #b91c1c)' }}
          >
            {erreur?.message ?? erreurServeur}
          </p>
        )}

        {/* Sur téléphone, la mention de stockage passe sous le bouton
            (`order-last`) pour garder le bouton d'envoi à l'écran. */}
        <p
          className="order-last text-xs leading-snug md:order-none md:leading-relaxed"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Vos données sont stockées sur un serveur en France. Vous pouvez
          demander leur suppression à tout moment en répondant à un email.
        </p>

        <button
          type="submit"
          disabled={envoiEnCours}
          ref={boutonRef}
          className="tsa-cta-terracotta scroll-mb-12 rounded-md md:scroll-mb-0 px-6 py-3 text-base font-medium text-white transition disabled:opacity-50"
          data-testid="capture-envoyer"
        >
          {envoiEnCours ? 'Envoi en cours...' : TEXTES_CAPTURE.bouton}
        </button>

        {/* Juste sous le bouton ; sur téléphone, la mention de stockage
            (`order-last`) vient après. */}
        <p
          className="text-center text-xs leading-snug md:text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
          data-testid="capture-sous-bouton"
        >
          {TEXTES_CAPTURE.sousBouton}
        </p>
      </form>
    </main>
  )
}
