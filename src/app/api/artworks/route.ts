import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const medium = searchParams.get('medium')

  const supabase = await createClient()
  let query = supabase
    .from('artworks')
    .select('*, artwork_images(*)')
    .order('created_at', { ascending: false })

  if (medium && ['painting', 'sculpture', 'glass'].includes(medium)) {
    query = query.eq('medium', medium)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ artworks: data })
}
