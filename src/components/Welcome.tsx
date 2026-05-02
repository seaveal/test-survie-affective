interface Props {
  onCommencer: () => void
}

export function Welcome({ onCommencer }: Props) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="mb-4 text-2xl leading-tight md:text-4xl">
        Pourquoi vous choisissez toujours les mêmes
      </h1>
      <p
        className="mb-12 text-base md:text-lg"
        style={{ color: 'var(--h3c-texte-secondaire)' }}
      >
        Le test qui révèle votre stratégie de survie affective et l'intensité
        de votre schéma
      </p>
      <button
        type="button"
        onClick={onCommencer}
        className="rounded-lg px-8 py-4 text-base font-medium text-white shadow-md transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          background: 'var(--h3c-accent-primaire)',
        }}
      >
        Commencer le test
      </button>
      <p
        className="mt-6 text-sm"
        style={{ color: 'var(--h3c-texte-secondaire)' }}
      >
        30 questions. 5 minutes. Confidentiel. Résultat immédiat.
      </p>
    </main>
  )
}
