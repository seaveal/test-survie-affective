import { ResultPreview } from './components/ResultPreview'
import type { ProfilId } from './domain/types'

const demande = new URLSearchParams(window.location.search).get('profil')
const profils: ProfilId[] = ['mendiant', 'sauveur', 'controleur', 'fantome']
const profil = profils.find((p) => p === demande) ?? 'mendiant'

// Aucun formulaire, aucune file d'envoi, aucun résultat personnel.
export default function ApercuResultat() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <ResultPreview resultat={{ profilDominant: profil }} envoiReussi apercu />
      <p className="px-6 pb-12 text-center">
        <a className="text-sm underline" href="/">Faire le test</a>
      </p>
    </main>
  )
}
