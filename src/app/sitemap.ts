import type { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wolfgangfinger.com'

  const staticPages = [
    { path: '', priority: 1.0 },
    { path: '/gallery', priority: 0.9 },
    { path: '/shop', priority: 0.9 },
    { path: '/about', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
    { path: '/contact', priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }))

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return staticPages

  const supabase = createStaticClient()
  const { data: artworks } = await supabase
    .from('artworks')
    .select('slug, updated_at')

  const artworkUrls = (artworks ?? []).map(a => ({
    url: `${siteUrl}/gallery/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...artworkUrls]
}
