import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-syne font-bold text-lime">⬡</span>
          <span className="text-xl font-syne font-bold text-text-primary">SceneSwap</span>
        </Link>
      </nav>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}
