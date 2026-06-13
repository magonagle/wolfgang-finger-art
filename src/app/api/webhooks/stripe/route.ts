import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAdminNotification } from '@/lib/email'
import { formatPrice } from '@/lib/utils'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      console.error('Webhook handler error:', err)
      return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = await createServiceClient()

  // Fetch full session with line items
  const fullSession = await getStripe().checkout.sessions.retrieve(session.id, {
    expand: ['line_items.data.price.product', 'payment_intent'],
  })
  // Cast to any to access fields that are conditionally present depending on API version
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sess = fullSession as any

  const lineItems: Stripe.LineItem[] = sess.line_items?.data ?? []
  const shippingCost = (sess.shipping_cost?.amount_total ?? 0) / 100
  const subtotal = (sess.amount_subtotal ?? 0) / 100
  const total = (sess.amount_total ?? 0) / 100

  const shippingAddress = sess.shipping_details?.address
    ? {
        line1: (sess.shipping_details.address.line1 as string) ?? '',
        line2: (sess.shipping_details.address.line2 as string | undefined) ?? undefined,
        city: (sess.shipping_details.address.city as string) ?? '',
        state: (sess.shipping_details.address.state as string) ?? '',
        postal_code: (sess.shipping_details.address.postal_code as string) ?? '',
        country: (sess.shipping_details.address.country as string) ?? '',
      }
    : null

  const paymentIntentId =
    typeof sess.payment_intent === 'string'
      ? sess.payment_intent
      : (sess.payment_intent as Stripe.PaymentIntent | null)?.id ?? null

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntentId,
      customer_email: sess.customer_details?.email ?? '',
      customer_name: sess.customer_details?.name ?? null,
      shipping_address: shippingAddress,
      subtotal,
      shipping_cost: shippingCost,
      total,
      status: 'paid',
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items and update stock
  for (const item of lineItems) {
    const product = item.price?.product as Stripe.Product | null
    const artworkId = product?.metadata?.artwork_id

    if (!artworkId) continue

    const quantity = item.quantity ?? 1
    const priceAtPurchase = (item.price?.unit_amount ?? 0) / 100

    await supabase.from('order_items').insert({
      order_id: order.id,
      artwork_id: artworkId,
      price_at_purchase: priceAtPurchase,
      quantity,
    })

    // All works are originals — mark as sold immediately
    await supabase.from('artworks').update({ is_sold: true }).eq('id', artworkId)
  }

  // Notify admin of new order
  const itemList = lineItems
    .map(item => {
      const product = item.price?.product as Stripe.Product | null
      return `<li>${product?.name ?? 'Unknown'} — ${formatPrice((item.price?.unit_amount ?? 0) / 100)}</li>`
    })
    .join('')

  const addr = order.shipping_address as Record<string, string> | null
  const addrHtml = addr
    ? `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ''}, ${addr.city}, ${addr.state} ${addr.postal_code}`
    : '—'

  await sendAdminNotification(
    `New order — ${order.customer_name ?? order.customer_email}`,
    `
      <h2 style="margin:0 0 16px">New order received</h2>
      <p><strong>Customer:</strong> ${order.customer_name ?? '—'} (${order.customer_email})</p>
      <p><strong>Ship to:</strong> ${addrHtml}</p>
      <p><strong>Items:</strong></p>
      <ul>${itemList}</ul>
      <p><strong>Subtotal:</strong> ${formatPrice(order.subtotal)}</p>
      <p><strong>Shipping:</strong> ${formatPrice(order.shipping_cost)}</p>
      <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}">View order in admin →</a></p>
      <hr />
      <p style="color:#888;font-size:12px;">wolfgangsart.com</p>
    `
  )
}
