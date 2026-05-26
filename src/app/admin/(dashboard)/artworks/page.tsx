import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'
import type { ArtworkWithImages } from '@/types/database'
import { SortableArtworks } from './_components/sortable-artworks'

export const metadata: Metadata = { title: 'Artworks' }

export default async function AdminArtworksPage() {
  const supabase = await createClient()
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .order('sort_order', { ascending: true })

  const list: ArtworkWithImages[] = artworks ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-sm uppercase tracking-[0.2em] text-stone-500">Artworks</h1>
        <Link href="/admin/artworks/new">
          <Button size="sm">Add Artwork</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="text-stone-400 text-sm py-10">No artworks yet.</p>
      ) : (
        <SortableArtworks initialArtworks={list} />
      )}
    </div>
  )
}
