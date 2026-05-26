import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { artworkSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = artworkSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  // Place new artwork at the end of the list
  const { count } = await supabase
    .from('artworks')
    .select('*', { count: 'exact', head: true })
  const nextSortOrder = count ?? 0

  const { data, error } = await supabase
    .from('artworks')
    .insert({ ...result.data, id: body.id, sort_order: nextSortOrder })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert any images that were uploaded before the artwork was saved
  const imagePaths: string[] = Array.isArray(body.imagePaths) ? body.imagePaths : []
  if (imagePaths.length > 0) {
    const imageRows = imagePaths.map((storage_path, i) => ({
      artwork_id: data.id,
      storage_path,
      alt_text: null,
      sort_order: i,
      is_primary: i === 0,
    }))
    await supabase.from('artwork_images').insert(imageRows)
  }

  return NextResponse.json({ artwork: data }, { status: 201 })
}
