'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { CartItem, ArtworkWithImages } from '@/types/database'

interface CartContextValue {
  items: CartItem[]
  addItem: (artwork: ArtworkWithImages) => void
  removeItem: (artworkId: string) => void
  updateQuantity: (artworkId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'wf_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(artwork: ArtworkWithImages) {
    setItems(prev => {
      // All works are originals — max qty 1 per piece
      if (prev.find(i => i.artwork.id === artwork.id)) return prev
      return [...prev, { artwork, quantity: 1 }]
    })
  }

  function removeItem(artworkId: string) {
    setItems(prev => prev.filter(i => i.artwork.id !== artworkId))
  }

  function updateQuantity(artworkId: string, quantity: number) {
    if (quantity < 1) {
      removeItem(artworkId)
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.artwork.id === artworkId ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce(
    (sum, i) => sum + i.artwork.price * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
