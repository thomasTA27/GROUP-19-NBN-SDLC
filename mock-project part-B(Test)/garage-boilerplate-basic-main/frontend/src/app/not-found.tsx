import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-6xl font-bold text-zinc-200 dark:text-zinc-700">404</h1>
      <p className="text-xl font-semibold">Page not found</p>
      <p className="text-zinc-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black"
      >
        Go home
      </Link>
    </main>
  )
}
