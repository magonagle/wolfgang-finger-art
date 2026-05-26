'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/cart'

export default function SuccessPage() {
  const { clearCart } = useCart()

  // Run once on mount only — clears cart after successful purchase
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { clearCart() }, [])

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-14 py-24 md:py-32">
      <div className="max-w-lg">

        {/* Label */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-8">
          Order Confirmed
        </p>

        {/* Headline */}
        <h1 className="font-display italic text-[clamp(40px,7vw,88px)] leading-none text-ink mb-8">
          Thank you.
        </h1>

        {/* Rule */}
        <div className="h-px w-16 bg-warm-border mb-10" />

        {/* Body */}
        <div className="space-y-4 text-[13px] text-warm-muted leading-relaxed max-w-sm mb-14">
          <p>
            Your order has been received. You will get a confirmation email shortly with
            your receipt and order details.
          </p>
          <p>
            Wolfgang will be in touch with shipping information once your work is prepared
            for transit.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-x-10 gap-y-5">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-ink group"
          >
            <span className="h-px w-8 bg-ink group-hover:w-14 transition-all duration-300" />
            Continue Browsing
          </Link>
          <Link
            href="/contact"
            className="text-[11px] uppercase tracking-[0.18em] text-warm-muted hover:text-ink transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>

      {/* Decorative rule — bottom right */}
      <div className="fixed bottom-10 right-10 pointer-events-none select-none flex flex-col items-center gap-3" aria-hidden="true">
        <div className="h-16 w-px bg-warm-border/40" />
        <span className="text-[9px] uppercase tracking-[0.2em] text-warm-border/50 [writing-mode:vertical-lr]">Confirmed</span>
      </div>
    </div>
  )
}
