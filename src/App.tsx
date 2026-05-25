import { useEffect } from 'react'
import { flushPendingCaptures } from './api/client'
import { CaptureScreen } from './components/CaptureScreen'
import { ContextCard } from './components/ContextCard'
import { LikertCard } from './components/LikertCard'
import { ProgressBar } from './components/ProgressBar'
import { QuestionCard } from './components/QuestionCard'
import { ResultPreview } from './components/ResultPreview'
import { Welcome } from './components/Welcome'
import { useTestState } from './hooks/useTestState'

function App() {
  const s = useTestState()

  // Au mount : retente les captures qui auraient echoue precedemment (queue localStorage)
  useEffect(() => {
    void flushPendingCaptures()
  }, [])

  if (s.etape === 'welcome') {
    return <Welcome onCommencer={s.commencer} />
  }

  if (s.etape === 'questions') {
    const q = s.questionCourante
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-8">
        <ProgressBar courant={s.indexCourant + 1} total={30} />
        {q.type === 'typage' && (
          <QuestionCard
            question={q}
            onChoisir={s.repondreTypage}
            valeurChoisie={s.reponses.typage[q.id]}
          />
        )}
        {q.type === 'intensite' && (
          <LikertCard
            question={q}
            onChoisir={s.repondreIntensite}
            valeurChoisie={s.reponses.intensite[q.id]}
          />
        )}
        {q.type === 'contexte' && (
          <ContextCard
            question={q}
            onChoisir={s.repondreContexte}
            valeurChoisie={
              s.reponses.contexte[q.champCible as keyof typeof s.reponses.contexte] as string
            }
          />
        )}
        {s.indexCourant > 0 && (
          <button
            type="button"
            onClick={s.retour}
            className="self-start rounded-md px-4 py-2 text-sm transition hover:underline"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
          >
            ← Question précédente
          </button>
        )}
      </main>
    )
  }

  if (s.etape === 'capture') {
    return (
      <CaptureScreen
        onSubmit={(values) => {
          void s.soumettreCapture(values)
        }}
        envoiEnCours={s.envoiEnCours}
      />
    )
  }

  // etape === 'resultat' : affichage allege (niveau 1 seul + bloc email)
  if (!s.resultat) return null
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <ResultPreview resultat={s.resultat} envoiReussi={s.envoiReussi} />
      <div className="px-6 pb-12 pt-4 text-center">
        <button
          type="button"
          onClick={s.recommencer}
          className="text-sm underline"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Recommencer le test
        </button>
      </div>
      <footer
        className="border-t px-6 py-8 text-center text-sm leading-relaxed"
        style={{
          borderColor: 'var(--h3c-bordure)',
          color: 'var(--h3c-texte-secondaire)',
        }}
      >
        L'enfant abandonné en vous n'a pas besoin de comprendre.
        <br />
        Il a besoin de recevoir.
      </footer>
    </main>
  )
}

export default App
