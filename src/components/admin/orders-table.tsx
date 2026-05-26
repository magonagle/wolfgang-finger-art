'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/database'

interface OrdersTableProps {
  orders: Order[]
}

const statusVariant: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'error' | 'default'> = {
  pending: 'warning',
  paid: 'success',
  shipped: 'default',
  delivered: 'neutral',
  cancelled: 'error',
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders)

  async function updateStatus(id: string, status: OrderStatus) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)))
    }
  }

  if (orders.length === 0) {
    return <p className="py-12 text-center text-sm text-stone-400">No orders yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200">
            {['Date', 'Customer', 'Total', 'Status', ''].map(h => (
              <th key={h} className="pb-3 pr-6 text-left text-xs font-medium uppercase tracking-wide text-stone-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map(order => (
            <tr key={order.id}>
              <td className="py-3 pr-6 text-stone-600">{formatDate(order.created_at)}</td>
              <td className="py-3 pr-6">
                <p className="text-stone-900">{order.customer_name ?? '—'}</p>
                <p className="text-xs text-stone-400">{order.customer_email}</p>
              </td>
              <td className="py-3 pr-6 text-stone-900">{formatPrice(order.total)}</td>
              <td className="py-3 pr-6">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[order.status as OrderStatus]}>
                    {order.status}
                  </Badge>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                    className="text-xs border border-stone-200 bg-white px-1.5 py-0.5 text-stone-700 focus:outline-none"
                  >
                    {(['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-xs text-stone-500 hover:text-stone-900 underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
