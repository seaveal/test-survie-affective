import { flushPendingCaptures, rejouerFinsRv } from '../api/client'
import { useEffect, useState } from 'react'
import { lireLivraison, type Delivery } from '../api/setting'

export function ResultDelivery({ game, busy, refused }: { game: 'tsa' | 'rv'; busy: boolean; refused: boolean }) {
  const [delivery, setDelivery] = useState<Delivery | null>(() => lireLivraison(game))
  const [retrying, setRetrying] = useState(false)
  async function retry() {
    setRetrying(true)
    try { await (game === 'tsa' ? flushPendingCaptures() : rejouerFinsRv()) } finally { setRetrying(false) }
  }
  useEffect(() => {
    const update = (event: Event) => {
      const { game: incoming, value } = (event as CustomEvent<{ game: string; value: Delivery | null }>).detail
      if (incoming === game) setDelivery(value)
    }
    window.addEventListener('setting-delivery', update)
    return () => window.removeEventListener('setting-delivery', update)
  }, [game])
  return <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-10">
    <h1 className="text-3xl">Recevez votre résultat sur WhatsApp</h1>
    {refused ? <p role="alert">Votre test n’a pas pu être enregistré. Revenez à l’étape précédente pour vérifier vos informations.</p>
      : delivery ? <>
        <p>Votre test est enregistré. Ouvrez WhatsApp puis envoyez le message prérempli pour recevoir votre lien personnel.</p>
        <a className="rounded-lg px-5 py-4 text-center" style={{ background: 'var(--h3c-accent-terracotta)', color: '#fff' }} href={delivery.whatsapp_url} rel="noreferrer">Recevoir mon résultat sur WhatsApp</a>
        <p>Le lien reste valable 24 heures. Vous pourrez le renouveler gratuitement, sans limite, depuis le même numéro, jusqu’au {new Date(delivery.retained_until * 1000).toLocaleDateString('fr-FR')}.</p>
        <p>L’envoi du résultat ne vous inscrit pas à des relances commerciales. Votre numéro sert à cette livraison ; aucun consentement SMS n’est ajouté.</p>
      </> : <><p role="status">{busy ? 'Enregistrement en cours…' : 'Votre test n’est pas encore enregistré sur le serveur. Gardez cette page et retrouvez une connexion pour réessayer. Aucun résultat n’a encore été envoyé.'}</p>{!busy && <button type="button" className="rounded-lg border px-4 py-3" disabled={retrying} onClick={() => void retry()}>{retrying ? 'Nouvelle tentative…' : 'Réessayer l’enregistrement'}</button>}</>}
  </main>
}
