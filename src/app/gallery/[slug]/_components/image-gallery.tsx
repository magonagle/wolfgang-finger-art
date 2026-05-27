'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ArtworkImage } from '@/types/database'
import { getPublicImageUrl } from '@/lib/utils'

interface ImageGalleryProps {
  images: ArtworkImage[]
  artworkTitle: string
}

export function ImageGallery({ images, artworkTitle }: ImageGalleryProps) {
  const [selected, setSelected] = useState(images[0])

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-warm-border/30 flex items-center justify-center">
        <span className="text-[11px] uppercase tracking-widest text-warm-muted">No image</span>
      </div>
    )
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative bg-parchment">
        <div className="relative aspect-[4/3]">
          <Image
            src={getPublicImageUrl(selected.storage_path)}
            alt={selected.alt_text ?? artworkTitle}
            fill
            className="object-contain object-top p-4 transition-opacity duration-300"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
      </div>

      {/* Thumbnail strip — only shown when there are multiple images */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map(img => (
            <button
              key={img.id}
              onClick={() => setSelected(img)}
              className={[
                'relative aspect-square overflow-hidden transition-all duration-200',
                selected.id === img.id
                  ? 'ring-1 ring-ink opacity-100'
                  : 'opacity-50 hover:opacity-80',
              ].join(' ')}
              aria-label={img.alt_text ?? artworkTitle}
              aria-pressed={selected.id === img.id}
            >
              <Image
                src={getPublicImageUrl(img.storage_path)}
                alt={img.alt_text ?? artworkTitle}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
