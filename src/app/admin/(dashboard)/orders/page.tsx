import { createClient } from '@/lib/supabase/server'
import { OrdersTable } from '@/components/admin/orders-table'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Orders' }

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-8">Orders</h1>
      <div className="bg-white border border-stone-200 p-6">
        <OrdersTable orders={data ?? []} />
      </div>
    </div>
  )
}
