import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 415 })
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 })
  }

  if (!UUID_REGEX.test(razorpay_order_id) && !razorpay_order_id.startsWith('order_')) {
    return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
  if (!razorpaySecret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, user_id, event_id, offer_code, status')
    .eq('razorpay_order_id', razorpay_order_id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (booking.status === 'confirmed') {
    return NextResponse.json({ success: true, bookingId: booking.id })
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      razorpay_payment_id: razorpay_payment_id,
    })
    .eq('id', booking.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
  }

  if (booking.offer_code) {
    const { count: existingUsage } = await supabase
      .from('offer_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('offer_code', booking.offer_code)

    if (existingUsage === 0) {
      await supabase.from('offer_usage').insert({
        user_id: user.id,
        offer_code: booking.offer_code,
        event_id: booking.event_id,
      })
    }
  }

  return NextResponse.json({ success: true, bookingId: booking.id })
}
