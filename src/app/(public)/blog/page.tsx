import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/database'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Journal — Wolfgang Finger',
  description: 'Writing and notes from Wolfgang Finger.',
}

async function getPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  return data ?? []
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-14 py-16 md:py-20">

      {/* Page header */}
      <div className="mb-14">
        <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-3">
          Wolfgang Finger
        </p>
        <div className="flex items-end justify-between border-b border-warm-border pb-5 mt-0">
          <h1 className="font-display italic text-[clamp(36px,7vw,80px)] leading-none text-ink">
            Journal
          </h1>
          {posts.length > 0 && (
            <p className="font-display italic text-[clamp(28px,5vw,60px)] text-warm-border/80 leading-none mb-1">
              {String(posts.length).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="py-24">
          <p className="text-[12px] uppercase tracking-[0.18em] text-warm-muted">
            No entries yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-warm-border">
          {posts.map((post, i) => (
            <article key={post.id} className="group py-10 grid md:grid-cols-[120px_1fr] gap-6 md:gap-12 items-start">
              {/* Index + date */}
              <div className="flex md:flex-col gap-4 md:gap-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-warm-border">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {post.published_at && (
                  <time className="text-[10px] uppercase tracking-[0.12em] text-warm-muted">
                    {formatDate(post.published_at)}
                  </time>
                )}
              </div>

              {/* Content */}
              <Link href={`/blog/${post.slug}`} className="block">
                <h2 className="font-display italic text-[clamp(18px,2.5vw,26px)] text-ink group-hover:text-warm-muted transition-colors duration-300 mb-3">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-[13px] text-warm-muted leading-relaxed max-w-2xl mb-5">
                    {post.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-warm-muted group-hover:text-ink transition-colors">
                  <span className="h-px w-5 bg-warm-muted group-hover:w-8 group-hover:bg-ink transition-all duration-300" />
                  Read
                </span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
