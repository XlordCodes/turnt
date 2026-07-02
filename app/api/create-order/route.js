import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Razorpay from 'razorpay'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const VALID_OFFERS = {
  EARLY10: { discount: 0.10, maxPerUser: 1, maxTotal: null },
  SQUAD20: { discount: 0.20, maxPerUser: 1, maxTotal: null },
  FIRST50: { discount: 0.50, maxPerUser: 1, maxTotal: 50 },
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

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

  const { eventId, offerCode } = await req.json()

  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
  }

  if (!UUID_REGEX.test(eventId)) {
    return NextResponse.json({ error: 'Invalid eventId format' }, { status: 400 })
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, ticket_price, name')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const baseAmount = Number(event.ticket_price) || 0

  let discount = 0
  let appliedOfferCode = null

  if (offerCode) {
    const offer = VALID_OFFERS[offerCode]
    if (!offer) {
      return NextResponse.json({ error: 'Invalid offer code' }, { status: 400 })
    }

    const { count: userUsage } = await supabase
      .from('offer_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('offer_code', offerCode)

    if (userUsage >= offer.maxPerUser) {
      return NextResponse.json({ error: 'Offer already used' }, { status: 400 })
    }

    if (offer.maxTotal) {
      const { count: globalUsage } = await supabase
        .from('offer_usage')
        .select('id', { count: 'exact', head: true })
        .eq('offer_code', offerCode)

      if (globalUsage >= offer.maxTotal) {
        return NextResponse.json({ error: 'Offer limit reached' }, { status: 400 })
      }
    }

    discount = offer.discount
    appliedOfferCode = offerCode
  }

  const finalAmount = Math.round(baseAmount * (1 - discount))

  if (finalAmount === 0) {
    const { count: existingBooking } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_id', eventId)

    if (existingBooking > 0) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 409 })
    }

    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        event_id: eventId,
        status: 'confirmed',
        amount_paid: 0,
        offer_code: appliedOfferCode,
      })
      .select('id')
      .single()

    if (bookingError) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    if (appliedOfferCode) {
      await supabase.from('offer_usage').insert({
        user_id: user.id,
        offer_code: appliedOfferCode,
        event_id: eventId,
      })
    }

    return NextResponse.json({ orderId: null, amount: 0, bookingId: newBooking.id })
  }

  const { count: existingBooking } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .eq('status', 'confirmed')

  if (existingBooking > 0) {
    return NextResponse.json({ error: 'Already registered for this event' }, { status: 409 })
  }

  const { data: existingPending } = await supabase
    .from('bookings')
    .select('id, razorpay_order_id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingPending && existingPending.razorpay_order_id) {
    return NextResponse.json({
      orderId: existingPending.razorpay_order_id,
      amount: finalAmount * 100,
      bookingId: existingPending.id,
    })
  }

  const amountInPaise = finalAmount * 100

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `turnt_${eventId}_${user.id}`,
    notes: {
      event_id: eventId,
      user_id: user.id,
      offer_code: appliedOfferCode || 'NONE',
    },
  })

  const { data: newBooking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      event_id: eventId,
      status: 'pending',
      amount_paid: finalAmount,
      offer_code: appliedOfferCode,
      razorpay_order_id: order.id,
    })
    .select('id')
    .single()

  if (bookingError) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    bookingId: newBooking.id,
  })
}
