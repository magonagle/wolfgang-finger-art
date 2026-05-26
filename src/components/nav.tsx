'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/cart'
import { useState, useEffect } from 'react'

const links = [
  { href: '/gallery',  label: 'Gallery' },
  { href: '/shop',     label: 'Shop' },
  { href: '/about',    label: 'About' },
  // { href: '/blog',     label: 'Journal' },  // suppressed until ready
  { href: '/contact',  label: 'Contact' },
]

export function Nav() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-parchment/95 backdrop-blur-md border-b border-warm-border'
          : 'bg-transparent border-b border-warm-border/60'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10 h-16">

        {/* Logo */}
        <Link
          href="/"
          className="font-display text-[13px] tracking-[0.22em] uppercase text-ink"
        >
          Wolfgang Finger
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  data-active={active}
                  className={`nav-link text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 ${
                    active ? 'text-ink' : 'text-warm-muted hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right: Cart + mobile toggle */}
        <div className="flex items-center gap-5">
          <Link
            href="/shop/cart"
            className="nav-link relative flex items-center text-warm-muted hover:text-ink transition-colors duration-200"
            aria-label={itemCount > 0 ? `Cart — ${itemCount} item${itemCount > 1 ? 's' : ''}` : 'Cart'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink text-[8px] font-medium text-parchment leading-none">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] group"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-5 bg-ink transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-px bg-ink transition-all duration-300 ${menuOpen ? 'opacity-0 w-5' : 'w-3.5'}`} />
            <span className={`block h-px w-5 bg-ink transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          menuOpen ? 'max-h-80 border-t border-warm-border' : 'max-h-0'
        } bg-parchment`}
      >
        <ul className="flex flex-col px-6 py-6 gap-5">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
