import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ArtworkCard } from '@/components/artwork-card'
import { getPublicImageUrl } from '@/lib/utils'
import type { ArtworkWithImages } from '@/types/database'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Wolfgang Finger — Artist',
  description: 'Original paintings, sculpture, and flamework art by Wolfgang Finger.',
}

async function getFeaturedArtworks(): Promise<ArtworkWithImages[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(4)
  return data ?? []
}

async function getHeroArtwork(): Promise<ArtworkWithImages | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .eq('is_hero', true)
    .limit(1)
    .single()
  return data ?? null
}

export default async function HomePage() {
  const [featured, hero] = await Promise.all([getFeaturedArtworks(), getHeroArtwork()])

  const heroPrimary =
    hero?.artwork_images?.find(i => i.is_primary) ?? hero?.artwork_images?.[0]
  const heroImageUrl = heroPrimary ? getPublicImageUrl(heroPrimary.storage_path) : null

  return (
    <div>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      {heroImageUrl && hero ? (
        /* ── Photo hero — dark, full-bleed image ── */
        <section className="relative h-[55vh] md:h-[92vh] min-h-[400px] md:min-h-[560px] overflow-hidden" style={{ backgroundColor: '#19160E' }}>
          <Image
            src={heroImageUrl}
            alt={heroPrimary?.alt_text ?? hero.title}
            fill
            className="object-cover opacity-80"
            priority
            sizes="100vw"
          />
          {/* Gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          {/* Text — pinned bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-14 pb-10 md:pb-20">
            <div className="anim-fade-up">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/60 mb-4 md:mb-5">
                Wolfgang Finger
              </p>
              <h1 className="font-display text-white leading-[0.95]">
                <span className="block text-[clamp(42px,10vw,130px)] font-normal">
                  Paintings,
                </span>
                <span className="block text-[clamp(42px,10vw,130px)] font-normal italic">
                  Sculpture &amp;
                </span>
                <span className="block text-[clamp(42px,10vw,130px)] font-normal">
                  Flamework
                </span>
              </h1>
            </div>
            <div className="anim-fade-up delay-300 mt-7 md:mt-10 flex items-center gap-8">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-white/80 hover:text-white transition-colors group"
              >
                <span className="block h-px w-8 bg-white/60 group-hover:w-12 transition-all duration-300" />
                View Gallery
              </Link>
              <Link
                href="/shop"
                className="text-[11px] uppercase tracking-[0.18em] text-white/50 hover:text-white/80 transition-colors"
              >
                Shop
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="anim-fade-in delay-500 absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 [writing-mode:vertical-lr]">Scroll</p>
            <div className="h-8 w-px bg-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/60 animate-[slideDown_2s_ease_infinite]" />
            </div>
          </div>
        </section>
      ) : (
        /* ── Typographic hero — shown when no featured artwork yet ── */
        <section className="relative h-[55vh] md:h-[92vh] min-h-[400px] md:min-h-[560px] border-b border-warm-border flex flex-col justify-between px-6 md:px-14 pt-16 pb-10 md:pb-20">
          <p className="text-[10px] uppercase tracking-[0.22em] text-warm-muted">
            Wolfgang Finger
          </p>

          <div>
            <h1 className="font-display text-ink leading-[0.95] mb-8 md:mb-10">
              <span className="block text-[clamp(42px,10vw,130px)] font-normal">
                Paintings,
              </span>
              <span className="block text-[clamp(42px,10vw,130px)] font-normal italic">
                Sculpture &amp;
              </span>
              <span className="block text-[clamp(42px,10vw,130px)] font-normal">
                Flamework
              </span>
            </h1>

            <div className="flex items-center gap-8">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-ink group"
              >
                <span className="block h-px w-8 bg-ink group-hover:w-12 transition-all duration-300" />
                View Gallery
              </Link>
              <Link
                href="/shop"
                className="text-[11px] uppercase tracking-[0.18em] text-warm-muted hover:text-ink transition-colors"
              >
                Shop
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Artist statement ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 md:px-14 py-14 md:py-24 lg:py-32">
        <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">
          {/* Left: catalog label */}
          <div className="section-rule">
            <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted shrink-0">
              01 &nbsp; Practice
            </span>
          </div>

          {/* Right: statement */}
          <div>
            <p className="font-display italic text-[clamp(20px,3vw,32px)] text-ink leading-relaxed mb-8">
              A lifelong devotion to the hand-made — across paint, wood, and flame.
            </p>
            <p className="text-sm text-warm-muted leading-relaxed max-w-xl">
              South Jersey artist Wolfgang Finger works in painting, wood carving, and flamework.
              Rooted in a stone mason&rsquo;s respect for material, his practice spans
              from intimate flamework objects to monumental carved sculpture. Each piece
              begins and ends with direct contact between hand and material.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
            >
              <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
              Biography
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured works ─────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 md:px-14 pb-14 md:pb-28">
          {/* Section header */}
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center gap-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted">
                02
              </span>
              <div className="h-px w-12 bg-warm-border" />
              <h2 className="font-display italic text-2xl text-ink">
                Selected Works
              </h2>
            </div>
            <Link
              href="/gallery"
              className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
            >
              All works
              <span className="h-px w-5 bg-warm-muted group-hover:w-8 group-hover:bg-ink transition-all duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((artwork, i) => (
              <ArtworkCard key={artwork.id} artwork={artwork} index={i} />
            ))}
          </div>

          <div className="mt-12 md:hidden text-center">
            <Link
              href="/gallery"
              className="text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors"
            >
              View all works
            </Link>
          </div>
        </section>
      )}

      {/* ── Documentary teaser ─────────────────────────────────────────── */}
      <section className="border-t border-warm-border">
        <div className="mx-auto max-w-7xl px-6 md:px-14 py-14 md:py-24 lg:py-32">
          <div className="grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16 lg:gap-24 items-center">

            {/* Left: text */}
            <div className="space-y-6">
              <div className="section-rule">
                <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted shrink-0">
                  03 &nbsp; Film
                </span>
              </div>
              <h2 className="font-display italic text-[clamp(24px,3.5vw,44px)] text-ink leading-tight">
                In the Studio
              </h2>
              <p className="text-sm text-warm-muted leading-relaxed max-w-xs">
                A short documentary on Wolfgang&rsquo;s practice — his materials,
                his process, and a lifetime of making things by hand.
              </p>
              <Link
                href="/about#film"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
              >
                <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
                Watch the film
              </Link>
            </div>

            {/* Right: thumbnail */}
            <Link
              href="/about#film"
              className="group relative block aspect-video overflow-hidden bg-stone-100"
              aria-label="Watch the documentary"
            >
              <Image
                src="https://img.youtube.com/vi/tq4czEYfxjw/maxresdefault.jpg"
                alt="Wolfgang Finger — documentary"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              {/* Vignette */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full border border-white/70 bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-5 w-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Acquire CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-warm-border">
        <div className="mx-auto max-w-7xl px-6 md:px-14 py-14 md:py-24 lg:py-32">
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-4">
                04 &nbsp; Acquire
              </p>
              <h2 className="font-display text-[clamp(36px,6vw,72px)] leading-tight text-ink">
                Original works,<br />
                <span className="italic">crafted by hand</span>
              </h2>
            </div>
            <div>
              <p className="text-sm text-warm-muted leading-relaxed mb-8 max-w-sm">
                Original works available directly from the studio,
                shipped worldwide.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-ink group"
              >
                <span className="h-px w-8 bg-ink group-hover:w-14 transition-all duration-300" />
                Browse the shop
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative rule */}
        <div className="pointer-events-none absolute right-6 md:right-14 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3" aria-hidden="true">
          <div className="h-24 w-px bg-warm-border/50" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-warm-border/60 [writing-mode:vertical-lr]">04</span>
          <div className="h-24 w-px bg-warm-border/50" />
        </div>
      </section>
    </div>
  )
}
