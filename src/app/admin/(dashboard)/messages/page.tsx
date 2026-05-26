import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { MessagesClient } from './_components/messages-client'
import type { ContactMessage } from '@/types/database'

export const metadata: Metadata = { title: 'Messages' }

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-8">Messages</h1>
      <MessagesClient messages={(data ?? []) as ContactMessage[]} />
    </div>
  )
}
