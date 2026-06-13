import Image from 'next/image'
import Link from 'next/link'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { formatPrice, getPublicImageUrl, stripHtml } from '@/lib/utils'
import { getShippingCost } from '@/lib/stripe'
import { AddToCartButton } from './_components/add-to-cart-button'
import { ImageGallery } from './_components/image-gallery'
import type { ArtworkWithImages } from '@/types/database'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

async function getArtwork(slug: string): Promise<ArtworkWithImages | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .eq('slug', slug)
    .single()
  return data ?? null
}

interface ArtworkNav {
  slug: string
  title: string
  medium: string
  year_created: number | null
  thumb: string | null
}

async function getAdjacentArtworks(currentId: string): Promise<{ prev: ArtworkNav | null; next: ArtworkNav | null }> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('artworks')
    .select('id, slug, title, medium, year_created, artwork_images(storage_path, is_primary, sort_order)')
    .order('sort_order', { ascending: true })

  if (!data || data.length < 2) return { prev: null, next: null }

  const index = data.findIndex(a => a.id === currentId)
  if (index === -1) return { prev: null, next: null }

  const toNav = (a: typeof data[number]): ArtworkNav => {
    const images = (a.artwork_images ?? []) as { storage_path: string; is_primary: boolean; sort_order: number }[]
    const primary = images.find(i => i.is_primary) ?? images.sort((x, y) => x.sort_order - y.sort_order)[0]
    return {
      slug: a.slug,
      title: a.title,
      medium: a.medium,
      year_created: a.year_created,
      thumb: primary ? getPublicImageUrl(primary.storage_path) : null,
    }
  }

  const prevIndex = (index - 1 + data.length) % data.length
  const nextIndex = (index + 1) % data.length

  return {
    prev: toNav(data[prevIndex]),
    next: toNav(data[nextIndex]),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artwork = await getArtwork(slug)
  if (!artwork) return {}

  const primaryImage = artwork.artwork_images?.find(i => i.is_primary) ?? artwork.artwork_images?.[0]
  const imageUrl = primaryImage ? getPublicImageUrl(primaryImage.storage_path) : undefined

  const plainDescription = artwork.description
    ? stripHtml(artwork.description)
    : `${artwork.title} — ${artwork.medium} by Wolfgang Finger`

  return {
    title: artwork.title,
    description: plainDescription,
    openGraph: {
      title: artwork.title,
      description: plainDescription,
      images: imageUrl ? [{ url: imageUrl, alt: primaryImage?.alt_text ?? artwork.title }] : [],
    },
  }
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase.from('artworks').select('slug')
  return (data ?? []).map(({ slug }) => ({ slug }))
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params
  const artwork = await getArtwork(slug)
  if (!artwork) notFound()

  const { prev, next } = await getAdjacentArtworks(artwork.id)

  const shippingCents = artwork.shipping_cost != null
    ? Math.round(artwork.shipping_cost * 100)
    : getShippingCost(artwork.medium)
  const shippingDisplay = formatPrice(shippingCents / 100)

  const sortedImages = [...(artwork.artwork_images ?? [])].sort(
    (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order
  )
  const primaryImage = sortedImages[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    description: artwork.description ? stripHtml(artwork.description) : undefined,
    artMedium: artwork.medium,
    width: artwork.dimensions,
    dateCreated: artwork.year_created?.toString(),
    offers: {
      '@type': 'Offer',
      price: artwork.price,
      priceCurrency: 'USD',
      availability: artwork.is_sold
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    },
    creator: {
      '@type': 'Person',
      name: 'Wolfgang Finger',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* pb-24 clears the sticky nav bar at the bottom */}
      <div className="mx-auto max-w-7xl px-6 md:px-14 py-12 md:py-16 pb-24 md:pb-28">

        {/* Back link */}
        <Link
          href="/gallery"
          className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-warm-muted hover:text-ink transition-colors group mb-14"
        >
          <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
          Gallery
        </Link>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_420px] lg:gap-20 xl:gap-28">

          {/* ── Left: image column ─────────────────────────────────────── */}
          <div>
            <ImageGallery images={sortedImages} artworkTitle={artwork.title} />
          </div>

          {/* ── Right: wall label + purchase ───────────────────────────── */}
          <div className="lg:pt-4 flex flex-col">

            {/* Medium tag */}
            <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-4">
              {artwork.medium}  ·  Original Work
            </p>

            {/* Title */}
            <h1 className="font-display italic text-[clamp(28px,4vw,46px)] leading-tight text-ink mb-8">
              {artwork.title}
            </h1>

            {/* Catalog specifications */}
            <div className="border-t border-warm-border pt-6 mb-8">
              <dl className="space-y-3">
                {artwork.year_created && (
                  <div className="flex justify-between">
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-warm-muted">Year</dt>
                    <dd className="text-[12px] text-ink">{artwork.year_created}</dd>
                  </div>
                )}
                {artwork.dimensions && (
                  <div className="flex justify-between">
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-warm-muted">Dimensions</dt>
                    <dd className="text-[12px] text-ink">{artwork.dimensions}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-warm-muted">Medium</dt>
                  <dd className="text-[12px] text-ink capitalize">{artwork.medium}</dd>
                </div>
              </dl>
            </div>

            {/* Description */}
            {artwork.description && (
              <div
                className="artwork-description text-[13px] text-warm-muted leading-relaxed mb-8 border-l-2 border-warm-border pl-4"
                dangerouslySetInnerHTML={{ __html: artwork.description }}
              />
            )}

            {/* Price + CTA — pushed to bottom on desktop */}
            <div className="mt-auto border-t border-warm-border pt-8">
              {artwork.is_sold ? (
                /* Sold state — no button, no inquire */
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-500/60 shrink-0" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-warm-muted">
                    This work has been sold
                  </p>
                </div>
              ) : (
                /* Available state */
                <>
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-warm-muted">Price</span>
                    <span className="font-display text-[clamp(22px,3vw,32px)] text-ink">
                      {formatPrice(artwork.price)}
                    </span>
                  </div>

                  <AddToCartButton artwork={artwork} />

                  <p className="mt-4 text-[10px] text-warm-muted tracking-wide">
                    Shipping: {shippingDisplay} · Within the US. Originals ship insured.
                  </p>

                  {/* Inquire links */}
                  <div className="mt-8 pt-6 border-t border-warm-border space-y-4">
                    <Link
                      href={`/contact?subject=${encodeURIComponent(`I'm interested in "${artwork.title}" and would like more information. Please get in touch with me at your convenience.`)}`}
                      className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-warm-muted hover:text-ink transition-colors group"
                    >
                      <span className="h-px w-5 bg-warm-muted group-hover:w-8 group-hover:bg-ink transition-all duration-300" />
                      Inquire about this work
                    </Link>
                    <div>
                      <p className="text-[10px] text-warm-muted tracking-wide mb-1">Outside the US?</p>
                      <Link
                        href={`/contact?subject=${encodeURIComponent(`I'm interested in purchasing "${artwork.title}" and would like a shipping quote for delivery outside the United States.`)}`}
                        className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-warm-muted hover:text-ink transition-colors group"
                      >
                        <span className="h-px w-5 bg-warm-muted group-hover:w-8 group-hover:bg-ink transition-all duration-300" />
                        Contact us for a shipping quote
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Prev / Next navigation — sticky footer ────────────────────── */}
      {(prev || next) && (
        <nav
          aria-label="Browse artworks"
          className="fixed bottom-0 left-0 right-0 z-40 bg-parchment border-t border-warm-border shadow-[0_-4px_24px_rgba(25,22,14,0.06)]"
        >
          <div className="mx-auto max-w-7xl px-6 md:px-14">
            <div className="grid grid-cols-2">

              {/* Previous */}
              {prev ? (
                <Link
                  href={`/gallery/${prev.slug}`}
                  className="group flex items-center gap-3 md:gap-4 py-4 pr-4 md:pr-6 border-r border-warm-border hover:bg-cream transition-colors duration-300"
                >
                  {/* Arrow */}
                  <span className="shrink-0 text-warm-muted group-hover:text-ink transition-colors duration-300">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M13 4L7 10L13 16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>

                  {/* Thumbnail */}
                  {prev.thumb && (
                    <div className="relative h-10 w-10 shrink-0 bg-warm-border/20 overflow-hidden hidden sm:block">
                      <Image
                        src={prev.thumb}
                        alt={prev.title}
                        fill
                        className="object-contain p-0.5 transition-transform duration-500 group-hover:scale-105"
                        sizes="40px"
                      />
                    </div>
                  )}

                  {/* Label + title */}
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-warm-muted mb-0.5">Previous</p>
                    <p className="font-display italic text-[13px] md:text-[15px] text-ink leading-snug truncate group-hover:text-warm-muted transition-colors duration-300">
                      {prev.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-warm-muted mt-0.5 capitalize hidden sm:block">
                      {prev.medium}{prev.year_created ? `, ${prev.year_created}` : ''}
                    </p>
                  </div>
                </Link>
              ) : (
                <div /> /* empty cell to preserve grid */
              )}

              {/* Next */}
              {next ? (
                <Link
                  href={`/gallery/${next.slug}`}
                  className="group flex items-center justify-end gap-3 md:gap-4 py-4 pl-4 md:pl-6 hover:bg-cream transition-colors duration-300"
                >
                  {/* Label + title */}
                  <div className="min-w-0 text-right">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-warm-muted mb-0.5">Next</p>
                    <p className="font-display italic text-[13px] md:text-[15px] text-ink leading-snug truncate group-hover:text-warm-muted transition-colors duration-300">
                      {next.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-warm-muted mt-0.5 capitalize hidden sm:block">
                      {next.medium}{next.year_created ? `, ${next.year_created}` : ''}
                    </p>
                  </div>

                  {/* Thumbnail */}
                  {next.thumb && (
                    <div className="relative h-10 w-10 shrink-0 bg-warm-border/20 overflow-hidden hidden sm:block">
                      <Image
                        src={next.thumb}
                        alt={next.title}
                        fill
                        className="object-contain p-0.5 transition-transform duration-500 group-hover:scale-105"
                        sizes="40px"
                      />
                    </div>
                  )}

                  {/* Arrow */}
                  <span className="shrink-0 text-warm-muted group-hover:text-ink transition-colors duration-300">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M7 4L13 10L7 16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              ) : (
                <div />
              )}

            </div>
          </div>
        </nav>
      )}
    </>
  )
}
