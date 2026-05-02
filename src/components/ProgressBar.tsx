interface Props {
  courant: number
  total: number
}

export function ProgressBar({ courant, total }: Props) {
  const clamped = Math.max(1, Math.min(courant, total))
  const pct = (clamped / total) * 100

  return (
    <div className="w-full">
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={clamped}
        aria-label={`Question ${clamped} sur ${total}`}
        className="h-1 w-full rounded-full"
        style={{ background: 'var(--h3c-bordure)' }}
      >
        <div
          data-testid="progress-fill"
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: 'var(--h3c-accent-secondaire)' }}
        />
      </div>
      <p
        className="mt-2 text-xs"
        style={{ color: 'var(--h3c-texte-secondaire)' }}
      >
        Question {clamped} sur {total}
      </p>
    </div>
  )
}
