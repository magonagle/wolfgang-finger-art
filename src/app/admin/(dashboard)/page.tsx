import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [artworksRes, ordersRes, messagesRes] = await Promise.all([
    supabase.from('artworks').select('id, is_sold', { count: 'exact' }),
    supabase.from('orders').select('id, total, status, created_at, customer_name, customer_email').order('created_at', { ascending: false }).limit(10),
    supabase.from('contact_messages').select('id, is_read', { count: 'exact' }).eq('is_read', false),
  ])

  const totalArtworks = artworksRes.count ?? 0
  const availableArtworks = artworksRes.data?.filter(a => !a.is_sold).length ?? 0
  const recentOrders = ordersRes.data ?? []
  const unreadMessages = messagesRes.count ?? 0
  const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)

  return (
    <div>
      <h1 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10 sm:grid-cols-4">
        {[
          { label: 'Total Works', value: totalArtworks },
          { label: 'Available', value: availableArtworks },
          { label: 'Total Revenue', value: formatPrice(totalRevenue) },
          {
            label: 'Unread Messages',
            value: unreadMessages,
            href: '/admin/messages',
            alert: unreadMessages > 0,
          },
        ].map(({ label, value, href, alert }) => (
          <div
            key={label}
            className={`bg-white border p-5 ${alert ? 'border-amber-300' : 'border-stone-200'}`}
          >
            <p className="text-xs text-stone-400 mb-1">{label}</p>
            {href ? (
              <Link href={href} className="text-2xl font-light text-stone-900 hover:text-stone-600">
                {value}
              </Link>
            ) : (
              <p className="text-2xl font-light text-stone-900">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-wide text-stone-400">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-stone-400 hover:text-stone-700 underline">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-stone-400 py-6">No orders yet.</p>
        ) : (
          <div className="bg-white border border-stone-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {['Date', 'Customer', 'Total', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-stone-500 text-xs">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-stone-900">{order.customer_name ?? order.customer_email}</td>
                    <td className="px-4 py-3 text-stone-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-stone-500 capitalize">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
