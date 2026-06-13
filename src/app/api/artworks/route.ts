import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const supabase = await createClient()
  let query = supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .order('sort_order', { ascending: true })

  if (category && ['painting', 'sculpture', 'glass'].includes(category)) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ artworks: data })
}
