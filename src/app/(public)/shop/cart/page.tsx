'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/cart'
import { formatPrice, getPublicImageUrl } from '@/lib/utils'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            artworkId: i.artwork.id,
            quantity: i.quantity,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to create checkout session')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  /* ── Empty state ─────────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-14 py-24 md:py-32">
        <div className="max-w-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-6">Cart</p>
          <p className="font-display italic text-[clamp(28px,4vw,44px)] text-ink leading-none mb-8">
            Empty.
          </p>
          <div className="h-px w-12 bg-warm-border mb-8" />
          <p className="text-[12px] text-warm-muted mb-10">No works selected yet.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-ink group"
          >
            <span className="h-px w-8 bg-ink group-hover:w-14 transition-all duration-300" />
            Browse the Shop
          </Link>
        </div>
      </div>
    )
  }

  /* ── Cart with items ─────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-14 py-16 md:py-20">

      {/* Header */}
      <div className="mb-14">
        <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-3">
          Wolfgang Finger
        </p>
        <div className="flex items-end justify-between">
          <h1 className="font-display italic text-[clamp(36px,6vw,72px)] leading-none text-ink">
            Cart
          </h1>
          <p className="font-display italic text-[clamp(28px,4vw,52px)] text-warm-border/80 leading-none mb-1">
            {String(items.length).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-16">

        {/* ── Line items ─────────────────────────────────────────────── */}
        <div>
          {items.map(({ artwork, quantity }) => {
            const primaryImage =
              artwork.artwork_images?.find(i => i.is_primary) ?? artwork.artwork_images?.[0]
            const imageUrl = primaryImage ? getPublicImageUrl(primaryImage.storage_path) : null

            return (
              <div
                key={artwork.id}
                className="flex gap-6 py-8 border-b border-warm-border first:border-t first:border-warm-border"
              >
                {/* Thumbnail */}
                <Link href={`/gallery/${artwork.slug}`} className="shrink-0">
                  <div className="relative h-28 w-[84px] bg-warm-border/20 overflow-hidden group">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={primaryImage?.alt_text ?? artwork.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="84px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-[9px] uppercase tracking-wider text-warm-muted">—</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/gallery/${artwork.slug}`}
                      className="font-display italic text-[15px] text-ink hover:text-warm-muted transition-colors"
                    >
                      {artwork.title}
                    </Link>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-warm-muted">
                      {artwork.category}  ·  Original
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mt-3">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-warm-muted">1 of 1</span>

                    <button
                      onClick={() => removeItem(artwork.id)}
                      className="text-[10px] uppercase tracking-[0.12em] text-warm-muted hover:text-ink transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  <p className="font-display text-[15px] text-ink">
                    {formatPrice(artwork.price)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Order summary ──────────────────────────────────────────── */}
        <div>
          <div className="border border-warm-border p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-8">
              Order Summary
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[12px]">
                <span className="text-warm-muted uppercase tracking-[0.12em]">Subtotal</span>
                <span className="text-ink font-display">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-warm-muted uppercase tracking-[0.12em]">Shipping</span>
                <span className="text-warm-muted italic font-display">At checkout</span>
              </div>
            </div>

            <div className="border-t border-warm-border pt-6 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted">Total</span>
                <span className="font-display text-[clamp(20px,3vw,28px)] text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[10px] text-warm-muted mt-1">+ shipping</p>
            </div>

            {error && (
              <p className="text-[11px] text-red-500 tracking-wide mb-4">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className={[
                'w-full flex items-center justify-center gap-3',
                'h-12 text-[11px] uppercase tracking-[0.18em]',
                'transition-all duration-200 active:scale-[0.98]',
                loading
                  ? 'border border-warm-border text-warm-muted cursor-not-allowed'
                  : 'border border-ink text-ink hover:bg-ink hover:text-parchment',
              ].join(' ')}
            >
              {loading ? (
                'Redirecting…'
              ) : (
                <>
                  <span className="h-px w-4 bg-current opacity-60" />
                  Proceed to Checkout
                </>
              )}
            </button>

            <p className="mt-4 text-[10px] text-center text-warm-muted leading-relaxed">
              Secure checkout via Stripe. Originals ship insured.
            </p>
          </div>

          {/* Continue shopping */}
          <div className="mt-6 text-center">
            <Link
              href="/gallery"
              className="text-[10px] uppercase tracking-[0.16em] text-warm-muted hover:text-ink transition-colors"
            >
              ← Continue browsing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
