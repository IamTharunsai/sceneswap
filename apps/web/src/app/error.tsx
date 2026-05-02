'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="text-h1 font-syne text-text-primary mb-3">Something went wrong</h1>
      <p className="text-text-secondary mb-2 max-w-sm">{error.message}</p>
      <p className="text-text-muted text-sm mb-8">If this keeps happening, contact support.</p>
      <button onClick={reset} className="btn-primary">
        Try Again
      </button>
    </div>
  )
}
