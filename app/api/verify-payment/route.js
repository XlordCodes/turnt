import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    console.error('Missing RAZORPAY_KEY_SECRET in environment variables');
    return NextResponse.json(
      { error: 'Payment configuration error. Please try again later.' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: 'Missing payment verification parameters' },
      { status: 400 }
    );
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.error('Payment signature verification failed', {
      orderId: razorpay_order_id,
    });
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials for payment verification');
    return NextResponse.json(
      { error: 'Server configuration error. Please try again later.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      razorpay_payment_id: razorpay_payment_id,
    })
    .eq('razorpay_order_id', razorpay_order_id);

  if (updateError) {
    console.error('Supabase update failed after payment verification:', updateError?.message);
    return NextResponse.json(
      { error: 'Payment verified but booking update failed. Please contact support.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'verified',
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
}
