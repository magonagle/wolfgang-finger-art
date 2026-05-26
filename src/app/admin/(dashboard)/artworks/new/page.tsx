import type { Metadata } from 'next'
import { ArtworkForm } from '@/components/admin/artwork-form'

export const metadata: Metadata = { title: 'New Artwork' }

export default function NewArtworkPage() {
  return (
    <div>
      <h1 className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-8">Add Artwork</h1>
      <ArtworkForm />
    </div>
  )
}
