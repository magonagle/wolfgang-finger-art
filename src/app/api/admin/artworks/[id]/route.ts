import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { artworkSchema } from '@/lib/validations'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = artworkSchema.partial().safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('artworks')
    .update(result.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ artwork: data })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch image storage paths before deleting so we can clean up storage
  const { data: images } = await supabase
    .from('artwork_images')
    .select('storage_path')
    .eq('artwork_id', id)

  // Delete artwork (cascade removes artwork_images rows)
  const { error } = await supabase.from('artworks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Clean up storage files (best-effort — don't fail the request if this errors)
  if (images && images.length > 0) {
    await supabase.storage
      .from('artwork-images')
      .remove(images.map(i => i.storage_path))
  }

  return NextResponse.json({ ok: true })
}
