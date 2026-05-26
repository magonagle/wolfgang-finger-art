import Link from 'next/link'

// Auth is enforced by src/proxy.ts — unauthenticated requests to /admin/*
// (except /admin/login) are redirected before reaching this layout.

const navLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/artworks', label: 'Artworks' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/messages', label: 'Messages' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/admin"
            className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-900"
          >
            WF Admin
          </Link>
          <nav>
            <ul className="flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <form action="/api/admin/logout" method="POST">
                  <button
                    type="submit"
                    className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
      </main>
    </div>
  )
}
