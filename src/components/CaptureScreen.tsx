import { useState, type FormEvent } from 'react'
import type { CaptureValues } from '../api/client'
import { normaliserTelephone } from '../domain/phone'

// Textes de l'écran de l'email, posé après la 3e réponse (livraison 2,
// 2026-10-06). Regroupés ici pour être remplacés d'un bloc une fois validés.
const TEXTES_CAPTURE = {
  surtitre: 'Votre profil offert par email',
  titre: 'Où voulez-vous recevoir votre profil ?',
  phrase:
    'Votre email permet de vous envoyer votre profil complet et de sauvegarder vos réponses pour reprendre plus tard. Votre masque s’affichera à l’écran à la fin du Test de Survie Affective.',
  bouton: 'Sauvegarder et continuer',
  sousBouton: 'Profil complet et séance de descente dans le corps offerts. Sans carte bancaire.',
}

interface Props {
  onSubmit: (values: CaptureValues) => void
  envoiEnCours?: boolean
  /** Refus de l'API (422, 410) : message affiché, l'email est redemandé. */
  erreurServeur?: string | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CaptureScreen({ onSubmit, envoiEnCours = false, erreurServeur = null }: Props) {
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
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
  const [consSms, setConsSms] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const normalise = email.trim().toLowerCase()
    if (!EMAIL_RE.test(normalise)) {
      setErreur('Merci de saisir un email valide.')
      return
    }
    // Garde tenu en accord avec le validateur serveur, qui refuse `false` par
    // un 422 (cf. le commentaire de `consMkt`). Un message ici vaut mieux qu'un
    // echec dur la-bas. Les deux tombent ensemble le jour de la decision.
    if (!consMkt) {
      setErreur("Le consentement marketing est requis pour recevoir votre profil par email.")
      return
    }
    // SMS : entierement optionnel. Le consentement n'est valable qu'avec un
    // numero valide. On ne bloque JAMAIS la livraison des resultats sur le
    // numero ; seul le cas "case SMS cochee + numero invalide" demande une
    // correction explicite (sinon le consentement serait sans objet).
    const telE164 = normaliserTelephone(telephone)
    if (consSms && telE164 === null) {
      setErreur(
        'Pour recevoir les SMS, indiquez un numéro de mobile valide (ex : 06 12 34 56 78). Ce champ reste facultatif.',
      )
      return
    }
    const smsOptIn = consSms && telE164 !== null
    setErreur(null)
    onSubmit({
      email: normalise,
      prenom: prenom.trim(),
      telephone: smsOptIn ? telE164 : undefined,
      consentementMarketing: consMkt,
      consentementSms: smsOptIn,
    })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-2 px-4 py-3 md:gap-6 md:px-6 md:py-10">
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
        className="flex flex-col gap-2 rounded-xl p-3 md:gap-5 md:p-6"
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
            aria-invalid={erreur ? 'true' : 'false'}
            aria-describedby={erreur ? 'capture-erreur' : undefined}
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

        {/* Mobile et SMS : facultatifs, repliés par défaut (2026-10-06) pour que
            le bouton d'envoi tienne dans l'écran d'un téléphone. */}
        <details className="text-sm" data-testid="capture-mobile">
          <summary className="cursor-pointer font-medium">
            Ajouter mon mobile (facultatif)
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <label htmlFor="capture-telephone" className="flex flex-col gap-1">
              <span className="sr-only">Mobile</span>
              <input
                id="capture-telephone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="06 12 34 56 78"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                aria-describedby="capture-telephone-aide"
                className="rounded-md border bg-white px-3 py-1.5 text-base md:py-2"
                style={{ borderColor: 'var(--h3c-bordure)' }}
              />
              <span
                id="capture-telephone-aide"
                className="text-xs"
                style={{ color: 'var(--h3c-texte-secondaire)' }}
              >
                Pour vos rappels par SMS. Format : 06 12 34 56 78 ou +33 6 12 34 56 78.
              </span>
            </label>
            <label
              htmlFor="cap-cons-sms"
              className="flex cursor-pointer items-start gap-3 leading-snug"
            >
              <input
                id="cap-cons-sms"
                type="checkbox"
                checked={consSms}
                onChange={(e) => setConsSms(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                Recevez aussi vos rappels et déclics par SMS. J'accepte de recevoir
                des SMS de Cyrille Novou et je peux me désinscrire à tout moment.
              </span>
            </label>
          </div>
        </details>

        {(erreur ?? erreurServeur) && (
          <p
            id="capture-erreur"
            role="alert"
            className="text-sm"
            style={{ color: 'var(--h3c-alerte, #b91c1c)' }}
          >
            {erreur ?? erreurServeur}
          </p>
        )}

        <p
          className="text-xs leading-snug md:leading-relaxed"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Vos données sont stockées sur un serveur en France. Vous pouvez
          demander leur suppression à tout moment en répondant à un email.
        </p>

        <button
          type="submit"
          disabled={envoiEnCours}
          className="tsa-cta-terracotta rounded-md px-6 py-3 text-base font-medium text-white transition disabled:opacity-50"
          data-testid="capture-envoyer"
        >
          {envoiEnCours ? 'Envoi en cours...' : TEXTES_CAPTURE.bouton}
        </button>
        <p className="text-center text-xs" style={{ color: 'var(--h3c-texte-secondaire)' }}>
          {TEXTES_CAPTURE.sousBouton}
        </p>
      </form>
    </main>
  )
}
