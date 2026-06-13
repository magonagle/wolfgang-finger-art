import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, getShippingCost } from '@/lib/stripe'

interface CartItemPayload {
  artworkId: string
  quantity: number
}

export async function POST(request: Request) {
  const body = await request.json()
  const items: CartItemPayload[] = body.items

  if (!items?.length) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch all artworks in one query
  const ids = items.map(i => i.artworkId)
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('*')
    .in('id', ids)

  if (error || !artworks?.length) {
    return NextResponse.json({ error: 'Artworks not found' }, { status: 400 })
  }

  const lineItems = items.flatMap(cartItem => {
    const artwork = artworks.find(a => a.id === cartItem.artworkId)
    if (!artwork || artwork.is_sold) return []

    return [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: artwork.title,
            metadata: { artwork_id: artwork.id },
          },
          unit_amount: Math.round(artwork.price * 100),
        },
        quantity: cartItem.quantity,
      },
    ]
  })

  if (!lineItems.length) {
    return NextResponse.json({ error: 'No available items' }, { status: 400 })
  }

  // Determine shipping cost — use the highest rate among cart items.
  // Per-artwork rate takes priority over the medium-based fallback.
  const maxShipping = Math.max(
    ...items.map(cartItem => {
      const artwork = artworks.find(a => a.id === cartItem.artworkId)
      if (!artwork) return 0
      return artwork.shipping_cost != null
        ? Math.round(artwork.shipping_cost * 100)
        : getShippingCost(artwork.category)
    })
  )

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['US'] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: maxShipping, currency: 'usd' },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 14 },
          },
        },
      },
    ],
    success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/cart`,
    metadata: {
      artwork_ids: ids.join(','),
    },
  })

  return NextResponse.json({ url: session.url })
}
