import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ArtworkGrid } from '@/components/artwork-grid'
import type { ArtworkWithImages } from '@/types/database'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Shop — Wolfgang Finger',
  description: 'Original works available to collectors directly from the studio.',
}

async function getAvailableArtworks(): Promise<ArtworkWithImages[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function ShopPage() {
  const artworks = await getAvailableArtworks()

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-14 py-16 md:py-20">

      {/* Page header */}
      <div className="mb-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-3">
              Wolfgang Finger
            </p>
            <h1 className="font-display italic text-[clamp(36px,7vw,80px)] leading-none text-ink">
              Shop
            </h1>
          </div>
          {/* Available count */}
          {artworks.length > 0 && (
            <p className="font-display italic text-[clamp(28px,5vw,60px)] text-warm-border/80 leading-none mb-1">
              {String(artworks.length).padStart(2, '0')}
            </p>
          )}
        </div>

        {/* Sub-header */}
        <div className="mt-8 flex items-center justify-between border-b border-warm-border pb-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-warm-muted">
            Available Works
          </p>
          <Link
            href="/gallery"
            className="text-[10px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors"
          >
            Full Gallery →
          </Link>
        </div>
      </div>

      {artworks.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display italic text-[clamp(20px,3vw,32px)] text-warm-muted mb-4">
            Check back soon.
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-warm-muted mb-10">
            No works currently available
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-ink group"
          >
            <span className="h-px w-8 bg-ink group-hover:w-14 transition-all duration-300" />
            Enquire about upcoming works
          </Link>
        </div>
      ) : (
        <ArtworkGrid artworks={artworks} />
      )}
    </div>
  )
}
