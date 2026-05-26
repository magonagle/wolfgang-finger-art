'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import type { ContactMessage } from '@/types/database'

interface Props {
  messages: ContactMessage[]
}

export function MessagesClient({ messages: initial }: Props) {
  const [messages, setMessages] = useState(initial)

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    })
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, is_read: true } : m)))
  }

  if (messages.length === 0) {
    return <p className="text-stone-400 text-sm py-10">No messages yet.</p>
  }

  return (
    <div className="space-y-3">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`bg-white border p-5 ${!msg.is_read ? 'border-amber-300' : 'border-stone-200'}`}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="font-medium text-stone-900">{msg.name}</p>
              <p className="text-xs text-stone-400">{msg.email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-stone-400">{formatDate(msg.created_at)}</p>
              {!msg.is_read && (
                <button
                  onClick={() => markRead(msg.id)}
                  className="mt-1 text-xs text-amber-600 hover:text-amber-800 underline"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
            {msg.message}
          </p>

          <a
            href={`mailto:${msg.email}?subject=Re: Your message to Wolfgang Finger`}
            className="mt-3 inline-block text-xs text-stone-400 hover:text-stone-700 underline underline-offset-4"
          >
            Reply via email
          </a>
        </div>
      ))}
    </div>
  )
}
