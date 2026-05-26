import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderStatus, OrderWithItems } from '@/types/database'

export const metadata: Metadata = { title: 'Order Detail' }

const statusVariant: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'error' | 'default'> = {
  pending: 'warning',
  paid: 'success',
  shipped: 'default',
  delivered: 'neutral',
  cancelled: 'error',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, artwork:artworks(*))')
    .eq('id', id)
    .single()

  const order = data as OrderWithItems | null
  if (!order) notFound()

  const addr = order.shipping_address

  return (
    <div className="max-w-2xl">
      <h1 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-8">Order Detail</h1>

      <div className="bg-white border border-stone-200 p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-stone-400 mb-1">{formatDate(order.created_at)}</p>
            <p className="font-medium text-stone-900">{order.customer_name ?? '—'}</p>
            <p className="text-sm text-stone-500">{order.customer_email}</p>
          </div>
          <Badge variant={statusVariant[order.status as OrderStatus]}>
            {order.status}
          </Badge>
        </div>

        {/* Shipping */}
        {addr && (
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">Ship to</p>
            <address className="not-italic text-sm text-stone-600 leading-relaxed">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
              {addr.city}, {addr.state} {addr.postal_code}<br />
              {addr.country}
            </address>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-400 mb-3">Items</p>
          <div className="space-y-3">
            {order.order_items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-700">
                  {item.artwork.title}
                  {item.quantity > 1 && <span className="text-stone-400"> × {item.quantity}</span>}
                </span>
                <span className="text-stone-900">{formatPrice(item.price_at_purchase * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-stone-100 pt-4 space-y-1">
          <div className="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-600">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between font-medium text-stone-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.stripe_payment_intent && (
          <p className="text-xs text-stone-400">
            Payment intent: {order.stripe_payment_intent}
          </p>
        )}
      </div>
    </div>
  )
}
