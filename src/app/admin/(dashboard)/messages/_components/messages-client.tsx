'use client'

import { useState, useMemo } from 'react'
import { formatDate } from '@/lib/utils'
import type { ContactMessage } from '@/types/database'

const PAGE_SIZE = 15

interface Props {
  messages: ContactMessage[]
}

export function MessagesClient({ messages: initial }: Props) {
  const [messages, setMessages] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const active = messages.filter(m => !m.is_archived)
  const archived = messages.filter(m => m.is_archived)
  const unreadCount = active.filter(m => !m.is_read).length

  const base =
    filter === 'archived' ? archived :
    filter === 'unread'   ? active.filter(m => !m.is_read) :
    active

  const q = search.trim().toLowerCase()
  const filtered = useMemo(() => q
    ? base.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      )
    : base,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [messages, filter, q])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function changeFilter(f: typeof filter) {
    setFilter(f)
    setPage(1)
  }

  function changeSearch(v: string) {
    setSearch(v)
    setPage(1)
  }

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  async function markAllRead() {
    await Promise.all(
      active.filter(m => !m.is_read).map(m =>
        fetch(`/api/admin/messages/${m.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true }),
        })
      )
    )
    setMessages(prev => prev.map(m => m.is_archived ? m : { ...m, is_read: true }))
  }

  async function toggleArchive(id: string, archive: boolean) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: archive }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_archived: archive } : m))
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
      {/* Search */}
      <input
        type="search"
        placeholder="Search by name, email, or message…"
        value={search}
        onChange={e => changeSearch(e.target.value)}
        className="w-full mb-5 border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex items-center gap-2">
          {(
            [
              ['all',      `All (${active.length})`],
              ['unread',   `Unread (${unreadCount})`],
              ['archived', `Archived (${archived.length})`],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => changeFilter(val)}
              className={`text-xs px-3 py-1.5 border transition-colors ${filter === val ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && filter !== 'archived' && (
          <button
            onClick={markAllRead}
            className="text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2"
          >
            Mark all as read
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-stone-400 text-sm py-10">
          {q
            ? 'No messages match your search.'
            : filter === 'unread'
            ? 'No unread messages.'
            : filter === 'archived'
            ? 'No archived messages.'
            : 'No messages yet.'}
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map(msg => (
              <div
                key={msg.id}
                className={`bg-white border p-5 ${!msg.is_read && !msg.is_archived ? 'border-amber-300' : 'border-stone-200'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium text-stone-900">{msg.name}</p>
                    <p className="text-xs text-stone-400">{msg.email}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-xs text-stone-400">{formatDate(msg.created_at)}</p>
                    <div className="flex items-center justify-end gap-3">
                      {!msg.is_read && !msg.is_archived && (
                        <button
                          onClick={() => markRead(msg.id)}
                          className="text-xs text-amber-600 hover:text-amber-800 underline"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => toggleArchive(msg.id, !msg.is_archived)}
                        className="text-xs text-stone-400 hover:text-stone-700 underline"
                      >
                        {msg.is_archived ? 'Unarchive' : 'Archive'}
                      </button>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between text-xs text-stone-500">
              <span>
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 border border-stone-200 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 border transition-colors ${p === safePage ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 hover:border-stone-400'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={safePage === totalPages}
                  className="px-3 py-1.5 border border-stone-200 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
