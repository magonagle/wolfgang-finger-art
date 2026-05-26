import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, getPublicImageUrl } from '@/lib/utils'
import type { ArtworkWithImages } from '@/types/database'

interface ArtworkCardProps {
  artwork: ArtworkWithImages
  /** Stagger index for entry animation */
  index?: number
}

export function ArtworkCard({ artwork, index = 0 }: ArtworkCardProps) {
  const primaryImage =
    artwork.artwork_images?.find(img => img.is_primary) ?? artwork.artwork_images?.[0]
  const imageUrl = primaryImage ? getPublicImageUrl(primaryImage.storage_path) : null

  const delay = Math.min(index * 80, 400)

  return (
    <Link
      href={`/gallery/${artwork.slug}`}
      className="group block anim-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-parchment overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={primaryImage?.alt_text ?? artwork.title}
            fill
            className="object-contain object-bottom p-2 transition-transform duration-700 group-hover:scale-[1.045]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[11px] uppercase tracking-widest text-warm-muted">
              No image
            </span>
          </div>
        )}

      </div>

      {/* Metadata — museum wall-label style */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display italic text-[15px] leading-snug text-ink group-hover:text-warm-muted transition-colors duration-300">
            {artwork.title}
          </h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-warm-muted">
            {artwork.medium}
            {artwork.year_created ? `, ${artwork.year_created}` : ''}
          </p>
        </div>
        <div className="shrink-0 pt-1.5 flex items-center gap-1.5">
          {artwork.is_sold ? (
            <>
              <span className="h-2 w-2 rounded-full bg-red-500/70 shrink-0" />
              <span className="text-[9px] uppercase tracking-[0.18em] text-warm-muted">Sold</span>
            </>
          ) : (
            <p className="font-display text-[13px] text-ink">{formatPrice(artwork.price)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
