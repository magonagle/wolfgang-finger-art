import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-warm-border bg-parchment">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

          {/* Brand */}
          <div>
            <p className="font-display text-[13px] tracking-[0.22em] uppercase text-ink mb-1">
              Wolfgang Finger
            </p>
            <p className="text-[11px] text-warm-muted tracking-wide">
              Paintings · Wood Carvings · Flamework
            </p>
          </div>

          {/* Nav */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-7 gap-y-2">
              {[
                { href: '/gallery',  label: 'Gallery' },
                { href: '/shop',     label: 'Shop' },
                { href: '/about',    label: 'About' },
{ href: '/contact',  label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[11px] uppercase tracking-[0.12em] text-warm-muted hover:text-ink transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <p className="text-[11px] tracking-wide text-warm-muted/70">
            &copy; {new Date().getFullYear()} Wolfgang Finger
          </p>
        </div>
      </div>
    </footer>
  )
}
