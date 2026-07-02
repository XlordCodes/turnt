import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing RAZORPAY_WEBHOOK_SECRET in environment variables');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    console.error('Missing x-razorpay-signature header');
    return NextResponse.json(
      { error: 'Missing signature header' },
      { status: 400 }
    );
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.error('Webhook signature verification failed');
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (parseError) {
    console.error('Failed to parse webhook body:', parseError?.message);
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  if (event.event === 'payment.captured') {
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity) {
      console.error('payment.captured event missing payment entity');
      return NextResponse.json({ status: 'ok' });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    if (!orderId || !paymentId) {
      console.error('payment.captured event missing order_id or payment id', {
        orderId,
        paymentId,
      });
      return NextResponse.json({ status: 'ok' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials in webhook handler');
      return NextResponse.json({ status: 'ok' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('razorpay_order_id', orderId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch booking for webhook update:', fetchError?.message, { orderId });
      return NextResponse.json({ status: 'ok' });
    }

    if (!existingBooking) {
      console.warn('No booking found for order_id in webhook:', orderId);
      return NextResponse.json({ status: 'ok' });
    }

    if (existingBooking.status === 'confirmed') {
      return NextResponse.json({ status: 'ok' });
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        razorpay_payment_id: paymentId,
      })
      .eq('razorpay_order_id', orderId);

    if (updateError) {
      console.error('Webhook Supabase update failed:', updateError?.message, {
        orderId,
        paymentId,
      });
      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ok' });
  }

  return NextResponse.json({ status: 'ok' });
}
