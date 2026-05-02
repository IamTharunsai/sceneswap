import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-8xl font-mono text-lime mb-4">404</p>
      <h1 className="text-h1 font-syne text-text-primary mb-3">Page not found</h1>
      <p className="text-text-secondary mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        Go Home →
      </Link>
    </div>
  )
}
