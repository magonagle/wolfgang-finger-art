import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Wolfgang Finger',
  description: 'Biography and practice of South Jersey artist Wolfgang Finger — painter, wood carver, and flamework artist.',
}

export default function AboutPage() {
  return (
    <div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 md:px-14 pt-16 pb-20">
        <div className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-3">
            Wolfgang Finger
          </p>
          <h1 className="font-display italic text-[clamp(36px,7vw,80px)] leading-none text-ink">
            Biography
          </h1>
        </div>

        {/* ── Main grid ──────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-start">

          {/* Left: catalog sidebar */}
          <div className="space-y-10">
            <div className="section-rule">
              <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted shrink-0">
                01 &nbsp; Practice
              </span>
            </div>

            {/* Studio note */}
            <div className="border-l-2 border-warm-border pl-5 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-warm-muted">Studio</p>
              <p className="text-[12px] text-ink leading-relaxed">
                South Harrison Township, New Jersey
              </p>
            </div>

            {/* Quick facts */}
            <dl className="space-y-4">
              {[
                { label: 'Media', value: 'Painting, Wood Carving, Flamework' },
                { label: 'Works', value: 'Original pieces only' },
                { label: 'Press', value: 'NBC10 Philadelphia, Rowan University' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-warm-muted mb-0.5">{label}</dt>
                  <dd className="text-[12px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <Link
              href="/contact"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
            >
              <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
              Contact
            </Link>
          </div>

          {/* Right: biography */}
          <div>
            {/* Pull quote */}
            <p className="font-display italic text-[clamp(18px,2.5vw,26px)] text-ink leading-relaxed mb-10 pb-10 border-b border-warm-border">
              &ldquo;A love of art is just something I was born with.&rdquo;
            </p>

            {/* Body */}
            <div className="space-y-6 text-[13px] text-warm-muted leading-relaxed max-w-2xl">
              <p>
                Wolfgang Finger is a South Jersey artist whose family emigrated from East Germany
                when he was a boy, eventually settling in Philadelphia where he largely learned
                English and developed his early relationship with craft and making.
              </p>

              <p>
                Originally trained as a stone mason, Finger spent decades building alongside
                his other pursuits — soccer player, coach, and once a professional roller derby
                player — before dedicating himself fully to the visual arts. It was a transition
                driven less by career calculation than by something more fundamental: a lifelong
                compulsion toward making things with his hands.
              </p>

              <p>
                His practice now spans three distinct mediums. The paintings explore surface and
                color, built up in careful layers. The wood carvings — his most labor-intensive
                work — are deeply naturalistic, shaped from American and exotic hardwoods over
                months of patient effort. A hand-carved great horned owl, rendered in Louisiana
                tupelo, was donated to Rowan University in 2023 after months of work; works of
                this scale and finish regularly command $30,000 or more.
              </p>

              <p>
                The flamework pieces occupy a third register entirely. Inspired by South Jersey
                neighbor and world-renowned glass artist{' '}
                <a
                  href="https://www.paulstankard.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2 decoration-warm-border hover:decoration-ink transition-colors"
                >
                  Paul Stankard
                </a>
                , Finger works with flame
                and molten glass to produce small, jewel-like objects of intense color. He works
                closely with fellow glass artist{' '}
                <a
                  href="https://davidgraeber.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2 decoration-warm-border hover:decoration-ink transition-colors"
                >
                  David Graeber
                </a>
                , a frequent collaborator whose own practice has deepened his engagement with the
                medium. His 5&thinsp;&times;&thinsp;5 foot stained glass work depicting macaws and orchids
                demonstrates the range of scale the medium allows.
              </p>

              <p>
                His work has been featured in regional newspapers, national magazine articles,
                and on NBC10 Philadelphia. He has exhibited at the Pitman Gallery and Art Center
                and in numerous private collections across the region.
              </p>
            </div>

            {/* Navigation links */}
            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
              >
                <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
                View Gallery
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
              >
                <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
                Shop
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
              >
                <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Film ───────────────────────────────────────────────────────── */}
      <div id="film" className="border-t border-warm-border">
        <div className="mx-auto max-w-7xl px-6 md:px-14 py-16 md:py-24">

          <div className="grid md:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-start">

            {/* Left: label + caption */}
            <div className="space-y-8">
              <div className="section-rule">
                <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted shrink-0">
                  02 &nbsp; Film
                </span>
              </div>
              <p className="font-display italic text-[clamp(16px,2vw,22px)] text-ink leading-relaxed">
                In the Studio
              </p>
              <p className="text-[12px] text-warm-muted leading-relaxed">
                A short documentary exploring Wolfgang&rsquo;s practice — the
                materials, the process, and what it means to spend a lifetime
                making things by hand.
              </p>
              <a
                href="https://www.youtube.com/watch?v=tq4czEYfxjw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-warm-muted hover:text-ink transition-colors group"
              >
                <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
                Watch on YouTube
              </a>
            </div>

            {/* Right: embed */}
            <div className="relative aspect-video w-full bg-stone-100">
              <iframe
                src="https://www.youtube-nocookie.com/embed/tq4czEYfxjw"
                title="Wolfgang Finger — documentary"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Closing accent ─────────────────────────────────────────────── */}
      <div className="border-t border-warm-border">
        <div className="mx-auto max-w-7xl px-6 md:px-14 py-16">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted">
              02 &nbsp; Works
            </p>
            <Link
              href="/gallery"
              className="font-display italic text-[clamp(20px,3vw,32px)] text-warm-border/80 hover:text-ink transition-colors duration-300"
            >
              Gallery →
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
