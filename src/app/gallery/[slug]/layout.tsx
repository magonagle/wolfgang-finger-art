import { Nav } from '@/components/nav'

/** Artwork detail — Nav only, no Footer (sticky prev/next nav replaces it). */
export default function ArtworkDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
    </>
  )
}
