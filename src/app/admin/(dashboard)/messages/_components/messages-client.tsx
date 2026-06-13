'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import type { ContactMessage } from '@/types/database'

interface Props {
  messages: ContactMessage[]
}

export function MessagesClient({ messages: initial }: Props) {
  const [messages, setMessages] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = messages.filter(m => !m.is_read).length
  const visible = filter === 'unread' ? messages.filter(m => !m.is_read) : messages

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  async function markAllRead() {
    const unread = messages.filter(m => !m.is_read)
    await Promise.all(unread.map(m =>
      fetch(`/api/admin/messages/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      })
    ))
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
  }

  async function deleteMessage(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  if (messages.length === 0) {
    return <p className="text-stone-400 text-sm py-10">No messages yet.</p>
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 border transition-colors ${filter === 'all' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-xs px-3 py-1.5 border transition-colors ${filter === 'unread' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2"
          >
            Mark all as read
          </button>
        )}
      </div>

      {visible.length === 0 && (
        <p className="text-stone-400 text-sm py-10">No unread messages.</p>
      )}

      <div className="space-y-3">
        {visible.map(msg => (
          <div
            key={msg.id}
            className={`bg-white border p-5 ${!msg.is_read ? 'border-amber-300' : 'border-stone-200'}`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-medium text-stone-900">{msg.name}</p>
                <p className="text-xs text-stone-400">{msg.email}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-xs text-stone-400">{formatDate(msg.created_at)}</p>
                <div className="flex items-center justify-end gap-3">
                  {!msg.is_read && (
                    <button
                      onClick={() => markRead(msg.id)}
                      className="text-xs text-amber-600 hover:text-amber-800 underline"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="text-xs text-red-400 hover:text-red-700 underline"
                  >
                    Delete
                  </button>
                </div>
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
    </div>
  )
}
