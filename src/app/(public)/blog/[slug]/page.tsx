import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/database'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Wolfgang Finger`,
    description: post.excerpt ?? undefined,
  }
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_published', true)
  return (data ?? []).map(({ slug }) => ({ slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-14 py-12 md:py-16">

      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-warm-muted hover:text-ink transition-colors group mb-14"
      >
        <span className="h-px w-6 bg-warm-muted group-hover:w-10 group-hover:bg-ink transition-all duration-300" />
        Journal
      </Link>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-start">

        {/* Left: metadata sidebar */}
        <div className="lg:sticky lg:top-8">
          <div className="section-rule mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted shrink-0">
              Journal
            </span>
          </div>
          {post.published_at && (
            <time className="block text-[10px] uppercase tracking-[0.16em] text-warm-muted mb-3">
              {formatDate(post.published_at)}
            </time>
          )}
          <h1 className="font-display italic text-[clamp(20px,2.5vw,28px)] text-ink leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-[12px] text-warm-muted leading-relaxed border-l-2 border-warm-border pl-4">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Right: article body */}
        <article>
          <div
            className="prose prose-sm max-w-none leading-relaxed
              prose-headings:font-display prose-headings:font-normal prose-headings:italic prose-headings:text-ink
              prose-p:text-warm-muted prose-p:text-[13px]
              prose-a:text-ink prose-a:underline prose-a:underline-offset-4 prose-a:decoration-warm-border
              prose-blockquote:border-warm-border prose-blockquote:text-ink prose-blockquote:font-display prose-blockquote:italic
              prose-strong:text-ink prose-strong:font-medium"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  )
}
