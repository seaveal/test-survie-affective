import { DisclaimerFooter } from '../components/DisclaimerFooter'
import { PageCommerciale } from '../commercial/PageCommerciale'
import { TEXTES_RV } from './textes'
export function WelcomeRV({ onCommencer }: { onCommencer: () => void }) {
  return <><main className="mx-auto w-full max-w-3xl px-5 sm:px-6"><PageCommerciale page="bilan-accueil" bouton="Commencer mon bilan" onAction={onCommencer} /></main><DisclaimerFooter nomTest={TEXTES_RV.nomTest} /></>
}
