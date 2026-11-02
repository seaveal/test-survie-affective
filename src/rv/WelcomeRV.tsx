import { DisclaimerFooter } from '../components/DisclaimerFooter'
import { TEXTES_RV } from './textes'

const T = TEXTES_RV.accueil

function Bouton({ emplacement, onClick }: { emplacement: 'haut' | 'bas', onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`cta-${emplacement}`}
      className="tsa-cta-terracotta rounded-lg px-10 py-4 text-base font-medium text-white shadow-md md:text-lg"
    >
      {T.bouton}
    </button>
  )
}

/** Accueil du bilan : la question du carton de fin de vidéo en titre, mot pour mot (PAGE-ACCUEIL.md). */
export function WelcomeRV({ onCommencer }: { onCommencer: () => void }) {
  const secondaire = { color: 'var(--h3c-texte-secondaire)' }
  return (
    <>
      <main
        className="mx-auto w-full max-w-3xl px-5 pb-10 pt-10 sm:px-6 md:px-8 md:pt-14"
        style={{ color: 'var(--h3c-texte-principal)' }}
      >
        <section className="flex flex-col items-center text-center">
          <p
            className="mb-3 text-xs uppercase md:text-sm"
            style={{
              color: 'var(--h3c-accent-terracotta)',
              fontFamily: 'var(--font-eyebrow)',
              fontWeight: 500,
              letterSpacing: '0.14em',
            }}
          >
            {T.surtitre}
          </p>
          <h1
            className="mx-auto mb-5 max-w-2xl text-3xl leading-tight sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-titre)', fontWeight: 500 }}
          >
            {T.titre}
          </h1>
          <p className="mb-3 max-w-xl text-base md:text-lg">{T.sousTitre}</p>
          <p className="mb-8 max-w-xl text-base md:text-lg">{T.demande}</p>
          <Bouton emplacement="haut" onClick={onCommencer} />
          <p className="mt-4 max-w-md text-sm leading-relaxed" style={secondaire}>
            {T.sousBouton}
          </p>
        </section>

        <section className="mx-auto mt-12 flex max-w-xl flex-col gap-4 text-base leading-relaxed">
          {T.corps.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }} data-testid="dimensions">
            {T.dimensions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <h2 className="mt-4 text-xl">{T.apresTitre}</h2>
          <p>{T.apres}</p>
        </section>

        <div className="mt-10 flex flex-col items-center text-center">
          <p className="mb-5 max-w-xl text-base md:text-lg">{T.demandeBas}</p>
          <Bouton emplacement="bas" onClick={onCommencer} />
          <p className="mt-6 max-w-xl text-sm" style={secondaire}>
            {T.prudence}
          </p>
        </div>
      </main>
      <DisclaimerFooter nomTest={TEXTES_RV.nomTest} />
    </>
  )
}
