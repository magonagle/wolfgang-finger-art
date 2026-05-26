import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { contactSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const body = await request.json()
  const result = contactSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 422 }
    )
  }

  const supabase = await createServiceClient()
  const { error } = await supabase.from('contact_messages').insert(result.data)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
