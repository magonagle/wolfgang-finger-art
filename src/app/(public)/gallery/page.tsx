'use client'

import { useState, useEffect } from 'react'
import { ArtworkGrid } from '@/components/artwork-grid'
import { GALLERY_FILTERS } from '@/lib/mediums'
import type { ArtworkWithImages, Medium } from '@/types/database'

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<ArtworkWithImages[]>([])
  const [filter, setFilter] = useState<Medium | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = filter !== 'all' ? `?medium=${filter}` : ''
    fetch(`/api/artworks${params}`)
      .then(r => r.json())
      .then(data => setArtworks(data.artworks ?? []))
      .finally(() => setLoading(false))
  }, [filter])

  const filtered =
    filter === 'all' ? artworks : artworks.filter(a => a.medium === filter)

  const activeNum = GALLERY_FILTERS.find(f => f.value === filter)?.num ?? '01'

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
              Gallery
            </h1>
          </div>
          {/* Active filter number — updates instantly on tab change */}
          <p className="font-display italic text-[clamp(28px,5vw,60px)] text-warm-border/80 leading-none mb-1 transition-all duration-200">
            {activeNum}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-warm-border pb-5">
          {GALLERY_FILTERS.map(({ label, value, num }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              data-active={filter === value}
              className="filter-tab text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors duration-200 flex items-center gap-1.5"
            >
              <span className="text-[9px] text-warm-border">{num}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-warm-border/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <ArtworkGrid artworks={filtered} />
      )}
    </div>
  )
}
