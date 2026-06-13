'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/database'

const statusVariant: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'error' | 'default'> = {
  pending: 'warning',
  paid: 'success',
  shipped: 'default',
  delivered: 'neutral',
  cancelled: 'error',
}

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

interface Props {
  orderId: string
  initialStatus: OrderStatus
  initialTracking: string | null
}

export function OrderActions({ orderId, initialStatus, initialTracking }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [tracking, setTracking] = useState(initialTracking ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_number: tracking || null }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      router.refresh()
    }
  }

  const isDirty = status !== initialStatus || tracking !== (initialTracking ?? '')

  return (
    <div className="border border-stone-200 bg-white p-6 space-y-5">
      <p className="text-xs uppercase tracking-wide text-stone-400">Update order</p>

      <div className="flex items-center gap-3">
        <Badge variant={statusVariant[status]}>{status}</Badge>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value as OrderStatus); setSaved(false) }}
          className="text-sm border border-stone-200 bg-white px-2 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-stone-400">
          Tracking number
        </label>
        <input
          type="text"
          value={tracking}
          onChange={e => { setTracking(e.target.value); setSaved(false) }}
          placeholder="e.g. 9400111899223456789012"
          className="border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-stone-300"
        />
        <p className="text-[11px] text-stone-400">
          When status is set to Shipped and a tracking number is entered, the customer receives a shipping confirmation email.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || !isDirty}
          className="px-4 py-2 text-xs uppercase tracking-wide bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-xs text-green-600">Saved</span>}
      </div>
    </div>
  )
}
