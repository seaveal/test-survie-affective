import { DisclaimerFooter } from './DisclaimerFooter'
import { PageCommerciale } from '../commercial/PageCommerciale'
interface Props { onCommencer: () => void }
export function Welcome({ onCommencer }: Props) {
  function lancer(emplacement: 'haut' | 'bas') {
    const suivre = window.h3cTrackPage ?? window.h3cTrack
    suivre?.('cta_commencer_test', { emplacement })
    onCommencer()
  }
  return <><main className="mx-auto w-full max-w-3xl px-5 sm:px-6"><PageCommerciale page="tsa-accueil" bouton="Découvrir mon masque" onAction={lancer} /></main><DisclaimerFooter /></>
}
