import { ArtworkCard } from '@/components/artwork-card'
import type { ArtworkWithImages } from '@/types/database'

interface ArtworkGridProps {
  artworks: ArtworkWithImages[]
}

export function ArtworkGrid({ artworks }: ArtworkGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-[12px] uppercase tracking-[0.18em] text-warm-muted">
          No works found
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((artwork, i) => (
        <ArtworkCard key={artwork.id} artwork={artwork} index={i} />
      ))}
    </div>
  )
}
