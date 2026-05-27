'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart'
import type { ArtworkWithImages } from '@/types/database'

interface Props {
  artwork: ArtworkWithImages
}

export function AddToCartButton({ artwork }: Props) {
  const { addItem, items } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const router = useRouter()

  const isInCart = items.some(i => i.artwork.id === artwork.id)

  const label = artwork.is_sold
    ? 'Sold'
    : isInCart
    ? 'Checkout'
    : justAdded
    ? 'Added'
    : 'Add to Cart'

  function handleClick() {
    if (artwork.is_sold) return
    if (isInCart) {
      router.push('/shop/cart')
      return
    }
    addItem(artwork)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      disabled={artwork.is_sold}
      className={[
        'w-full flex items-center justify-center gap-3',
        'text-[11px] uppercase tracking-[0.18em]',
        'h-12 transition-all duration-300',
        artwork.is_sold
          ? 'border border-warm-border text-warm-muted cursor-not-allowed'
          : isInCart
          ? 'bg-ink text-parchment border border-ink hover:opacity-80'
          : justAdded
          ? 'border border-ink bg-ink text-parchment'
          : 'border border-ink text-ink hover:bg-ink hover:text-parchment active:scale-[0.98]',
      ].join(' ')}
    >
      {!artwork.is_sold && !justAdded && <span className="h-px w-4 bg-current opacity-60" />}
      {label}
      {isInCart && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7h10M8 3l4 4-4 4" />
        </svg>
      )}
    </button>
  )
}
