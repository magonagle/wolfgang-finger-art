'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatPrice, getPublicImageUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { ArtworkWithImages } from '@/types/database'

/* ── Delete button ─────────────────────────────────────────────────────── */
function DeleteButton({ artworkId, artworkTitle }: { artworkId: string; artworkTitle: string }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete "${artworkTitle}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/artworks/${artworkId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      // Let parent remove the row via onDelete
      document.dispatchEvent(new CustomEvent('artwork-deleted', { detail: { id: artworkId } }))
    } catch {
      alert('Could not delete artwork. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-400 hover:text-red-700 disabled:opacity-40 transition-colors"
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  )
}

/* ── Individual sortable row ───────────────────────────────────────────── */
function SortableRow({ artwork }: { artwork: ArtworkWithImages }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artwork.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? ('relative' as const) : undefined,
    zIndex: isDragging ? 10 : undefined,
    background: isDragging ? '#fafaf9' : undefined,
  }

  const thumb =
    artwork.artwork_images?.find(i => i.is_primary) ??
    artwork.artwork_images?.[0]

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-stone-50">
      {/* Drag handle */}
      <td className="px-3 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 transition-colors touch-none select-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="4" cy="3" r="1.2" />
            <circle cx="10" cy="3" r="1.2" />
            <circle cx="4" cy="7" r="1.2" />
            <circle cx="10" cy="7" r="1.2" />
            <circle cx="4" cy="11" r="1.2" />
            <circle cx="10" cy="11" r="1.2" />
          </svg>
        </button>
      </td>

      {/* Thumbnail */}
      <td className="px-4 py-3">
        <div className="relative h-12 w-10 bg-stone-100 overflow-hidden shrink-0">
          {thumb && (
            <Image
              src={getPublicImageUrl(thumb.storage_path)}
              alt={artwork.title}
              fill
              className="object-cover"
              sizes="40px"
            />
          )}
        </div>
      </td>

      <td className="px-4 py-3 text-stone-900 font-medium">{artwork.title}</td>
      <td className="px-4 py-3 text-stone-500 capitalize">{artwork.medium}</td>
      <td className="px-4 py-3 text-stone-700">{formatPrice(artwork.price)}</td>
      <td className="px-4 py-3">
        {artwork.is_sold ? (
          <Badge variant="sold">Sold</Badge>
        ) : (
          <Badge variant="success">Available</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/artworks/${artwork.id}/edit`}
            className="text-xs text-stone-400 hover:text-stone-900 underline"
          >
            Edit
          </Link>
          <DeleteButton artworkId={artwork.id} artworkTitle={artwork.title} />
        </div>
      </td>
    </tr>
  )
}

/* ── Sortable list ─────────────────────────────────────────────────────── */
interface SortableArtworksProps {
  initialArtworks: ArtworkWithImages[]
}

export function SortableArtworks({ initialArtworks }: SortableArtworksProps) {
  const [artworks, setArtworks] = useState(
    [...initialArtworks].sort((a, b) => a.sort_order - b.sort_order)
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Listen for artwork-deleted events dispatched by DeleteButton
  useEffect(() => {
    function handleArtworkDeleted(e: Event) {
      const { id } = (e as CustomEvent<{ id: string }>).detail
      setArtworks(prev => prev.filter(a => a.id !== id))
    }
    document.addEventListener('artwork-deleted', handleArtworkDeleted)
    return () => document.removeEventListener('artwork-deleted', handleArtworkDeleted)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = artworks.findIndex(a => a.id === active.id)
      const newIndex = artworks.findIndex(a => a.id === over.id)
      const reordered = arrayMove(artworks, oldIndex, newIndex)

      // Optimistic update
      setArtworks(reordered)
      setSaveError(null)
      setSaving(true)

      try {
        const res = await fetch('/api/admin/artworks/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: reordered.map((a, i) => ({ id: a.id, sort_order: i })),
          }),
        })
        if (!res.ok) throw new Error('Failed to save order')
      } catch {
        setSaveError('Could not save order — try again')
        setArtworks(artworks) // revert
      } finally {
        setSaving(false)
      }
    },
    [artworks]
  )

  return (
    <div>
      {/* Status strip */}
      <div className="h-6 mb-3 text-right">
        {saving && <span className="text-xs text-stone-400">Saving…</span>}
        {saveError && <span className="text-xs text-red-500">{saveError}</span>}
      </div>

      {/* DndContext must wrap the table from outside — it renders a div internally
          which is invalid HTML inside <table>. SortableContext renders no DOM
          element so it can safely sit inside <tbody>. */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {['', '', 'Title', 'Medium', 'Price', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <SortableContext
              items={artworks.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {artworks.map(artwork => (
                  <SortableRow key={artwork.id} artwork={artwork} />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>

      <p className="mt-3 text-xs text-stone-400">
        Drag rows to reorder. Order is reflected in the gallery and shop.
      </p>
    </div>
  )
}
