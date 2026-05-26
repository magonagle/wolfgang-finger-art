import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, getPublicImageUrl } from '@/lib/utils'
import type { Metadata } from 'next'
import type { ArtworkWithImages } from '@/types/database'

export const metadata: Metadata = { title: 'Artworks' }

export default async function AdminArtworksPage() {
  const supabase = await createClient()
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .order('created_at', { ascending: false })

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
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {['', 'Title', 'Medium', 'Price', 'Status', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {list.map(artwork => {
                const thumb =
                  artwork.artwork_images?.find(i => i.is_primary) ??
                  artwork.artwork_images?.[0]
                return (
                  <tr key={artwork.id}>
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-10 bg-stone-100 overflow-hidden">
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
                      <Link
                        href={`/admin/artworks/${artwork.id}/edit`}
                        className="text-xs text-stone-400 hover:text-stone-900 underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
