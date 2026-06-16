import { useState, type FormEvent } from 'react'
import type { CaptureValues } from '../api/client'
import { normaliserTelephone } from '../domain/phone'

interface Props {
  onSubmit: (values: CaptureValues) => void
  envoiEnCours?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CaptureScreen({ onSubmit, envoiEnCours = false }: Props) {
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [consMkt, setConsMkt] = useState(true)
  const [consSms, setConsSms] = useState(false)
  const [consSante, setConsSante] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const normalise = email.trim().toLowerCase()
    if (!EMAIL_RE.test(normalise)) {
      setErreur('Merci de saisir un email valide.')
      return
    }
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
        'Pour recevoir les SMS, indiquez un numero de mobile valide (ex : 06 12 34 56 78). Ce champ reste optionnel.',
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
      consentementDonneesSante: consSante,
      consentementSms: smsOptIn,
    })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="text-center">
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Derniere etape
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl">Votre profil arrive par email</h1>
      </header>

      <p
        className="text-base leading-relaxed"
        style={{ color: 'var(--h3c-texte-secondaire)' }}
      >
        Vous venez de repondre aux trente questions. Indiquez ou recevoir le detail
        complet de votre profil, vos sept symptomes, votre feuille de route, et
        votre cadeau.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-xl p-6"
        style={{ background: 'var(--h3c-fond-card)' }}
        data-testid="capture-screen"
      >
        <label htmlFor="capture-email" className="flex flex-col gap-2 text-sm">
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
            className="rounded-md border bg-white px-3 py-2 text-base"
            style={{ borderColor: 'var(--h3c-bordure)' }}
          />
        </label>

        <label htmlFor="capture-prenom" className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Prenom (optionnel)</span>
          <input
            id="capture-prenom"
            type="text"
            autoComplete="given-name"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="rounded-md border bg-white px-3 py-2 text-base"
            style={{ borderColor: 'var(--h3c-bordure)' }}
          />
        </label>

        <label htmlFor="capture-telephone" className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Mobile (optionnel)</span>
          <input
            id="capture-telephone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            aria-describedby="capture-telephone-aide"
            className="rounded-md border bg-white px-3 py-2 text-base"
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

        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Vos consentements</legend>

          <label
            htmlFor="cap-cons-mkt"
            className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
          >
            <input
              id="cap-cons-mkt"
              type="checkbox"
              checked={consMkt}
              onChange={(e) => setConsMkt(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              J'accepte de recevoir mon profil et les emails suivants.
            </span>
          </label>

          <label
            htmlFor="cap-cons-sms"
            className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
          >
            <input
              id="cap-cons-sms"
              type="checkbox"
              checked={consSms}
              onChange={(e) => setConsSms(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              Recevez aussi vos rappels et declics par SMS. J'accepte de recevoir
              des SMS de Cyrille Novou et je peux me desinscrire a tout moment.
            </span>
          </label>

          <label
            htmlFor="cap-cons-sante"
            className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
          >
            <input
              id="cap-cons-sante"
              type="checkbox"
              checked={consSante}
              onChange={(e) => setConsSante(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              J'accepte que mes reponses sur l'etat emotionnel soient conservees
              de facon securisee, pour personnaliser mes contenus.
            </span>
          </label>
        </fieldset>

        {erreur && (
          <p
            id="capture-erreur"
            role="alert"
            className="text-sm"
            style={{ color: 'var(--h3c-alerte, #b91c1c)' }}
          >
            {erreur}
          </p>
        )}

        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Vos donnees sont stockees sur un serveur en France, chiffrees pour la
          partie sensible. Vous pouvez demander la suppression a tout moment en
          repondant a un email.
        </p>

        <button
          type="submit"
          disabled={envoiEnCours}
          className="rounded-md px-6 py-3 text-base font-medium transition disabled:opacity-50"
          style={{
            background: 'var(--h3c-accent-principal, #b89e5d)',
            color: '#fff',
          }}
        >
          {envoiEnCours ? 'Envoi en cours...' : 'Recevoir mon profil'}
        </button>
      </form>
    </main>
  )
}
