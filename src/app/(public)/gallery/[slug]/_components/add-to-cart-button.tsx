'use client'

import { useState } from 'react'
import { useCart } from '@/context/cart'
import type { ArtworkWithImages } from '@/types/database'

interface Props {
  artwork: ArtworkWithImages
}

export function AddToCartButton({ artwork }: Props) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  const isInCart = items.some(i => i.artwork.id === artwork.id)
  const isDisabled = artwork.is_sold || isInCart

  const label = artwork.is_sold ? 'Sold' : isInCart ? 'In Cart' : added ? 'Added' : 'Add to Cart'

  function handleClick() {
    if (isDisabled) return
    addItem(artwork)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={[
        'w-full flex items-center justify-center gap-3',
        'text-[11px] uppercase tracking-[0.18em]',
        'h-12 transition-all duration-300',
        isDisabled
          ? 'border border-warm-border text-warm-muted cursor-not-allowed'
          : added
          ? 'border border-ink bg-ink text-parchment'
          : 'border border-ink text-ink hover:bg-ink hover:text-parchment active:scale-[0.98]',
      ].join(' ')}
    >
      {!isDisabled && !added && <span className="h-px w-4 bg-current opacity-60" />}
      {label}
    </button>
  )
}
