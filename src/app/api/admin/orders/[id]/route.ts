import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { orderStatusSchema } from '@/lib/validations'
import { sendShippingConfirmation } from '@/lib/email'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = orderStatusSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const updatePayload: Record<string, unknown> = { status: result.data.status }
  if (body.tracking_number !== undefined) {
    updatePayload.tracking_number = body.tracking_number || null
  }

  const { data: order, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select('*, order_items(*, artwork:artworks(title))')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send shipping confirmation to customer when marked as shipped with a tracking number
  if (result.data.status === 'shipped' && body.tracking_number && order.customer_email) {
    const firstItem = (order.order_items as { artwork: { title: string } }[])[0]
    await sendShippingConfirmation({
      to: order.customer_email,
      customerName: order.customer_name,
      artworkTitle: firstItem?.artwork?.title ?? 'your artwork',
      trackingNumber: body.tracking_number,
    }).catch(() => {}) // best-effort — don't fail the status update if email errors
  }

  return NextResponse.json({ order })
}
