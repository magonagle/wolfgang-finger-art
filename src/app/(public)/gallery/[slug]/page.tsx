import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { formatPrice, getPublicImageUrl } from '@/lib/utils'
import { AddToCartButton } from './_components/add-to-cart-button'
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artwork = await getArtwork(slug)
  if (!artwork) return {}

  const primaryImage = artwork.artwork_images?.find(i => i.is_primary) ?? artwork.artwork_images?.[0]
  const imageUrl = primaryImage ? getPublicImageUrl(primaryImage.storage_path) : undefined

  return {
    title: artwork.title,
    description: artwork.description ?? `${artwork.title} — ${artwork.medium} by Wolfgang Finger`,
    openGraph: {
      title: artwork.title,
      description: artwork.description ?? undefined,
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

  const sortedImages = [...(artwork.artwork_images ?? [])].sort(
    (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order
  )
  const primaryImage = sortedImages[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    description: artwork.description,
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

      <div className="mx-auto max-w-7xl px-6 md:px-14 py-12 md:py-16">

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
            {primaryImage ? (
              <div className="relative bg-parchment">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={getPublicImageUrl(primaryImage.storage_path)}
                    alt={primaryImage.alt_text ?? artwork.title}
                    fill
                    className="object-contain object-top p-4"
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] bg-warm-border/30 flex items-center justify-center">
                <span className="text-[11px] uppercase tracking-widest text-warm-muted">No image</span>
              </div>
            )}

            {/* Additional images */}
            {sortedImages.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {sortedImages.slice(1).map(img => (
                  <div
                    key={img.id}
                    className="relative aspect-square bg-warm-border/20 overflow-hidden cursor-pointer group"
                  >
                    <Image
                      src={getPublicImageUrl(img.storage_path)}
                      alt={img.alt_text ?? artwork.title}
                      fill
                      className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            )}
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
              <p className="text-[13px] text-warm-muted leading-relaxed mb-8 border-l-2 border-warm-border pl-4">
                {artwork.description}
              </p>
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
                    Shipping calculated at checkout. Originals ship insured.
                  </p>

                  {/* Inquire link — only shown for available works */}
                  <div className="mt-8 pt-6 border-t border-warm-border">
                    <Link
                      href={`/contact?subject=${encodeURIComponent(`Inquiry: ${artwork.title}`)}`}
                      className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-warm-muted hover:text-ink transition-colors group"
                    >
                      <span className="h-px w-5 bg-warm-muted group-hover:w-8 group-hover:bg-ink transition-all duration-300" />
                      Inquire about this work
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
