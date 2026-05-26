import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ArtworkForm } from '@/components/admin/artwork-form'
import type { ArtworkWithImages } from '@/types/database'

export const metadata: Metadata = { title: 'Edit Artwork' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArtworkPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .eq('id', id)
    .single()

  const artwork = data as ArtworkWithImages | null
  if (!artwork) notFound()

  return (
    <div>
      <h1 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-8">
        Edit — {artwork.title}
      </h1>
      <ArtworkForm artwork={artwork} />
    </div>
  )
}
