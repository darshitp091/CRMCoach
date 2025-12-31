import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/razorpay/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log('Razorpay webhook received:', eventType);

    // Handle different webhook events
    switch (eventType) {
      case 'subscription.activated':
        await handleSubscriptionActivated(payload);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload);
        break;

      case 'subscription.completed':
        await handleSubscriptionCompleted(payload);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(payload);
        break;

      case 'subscription.resumed':
        await handleSubscriptionResumed(payload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;

      default:
        console.log('Unhandled event type:', eventType);
    }

    // Log the event
    await logWebhookEvent(eventType, payload, event.event_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActivated(payload: any) {
  const subscription = payload.subscription.entity;
  const orgId = subscription.notes?.organization_id;

  if (!orgId) {
    console.error('No organization_id in subscription notes');
    return;
  }

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      subscription_start_date: new Date(subscription.start_at * 1000).toISOString(),
      subscription_current_period_end: new Date(
        subscription.current_end * 1000
      ).toISOString(),
    })
    .eq('id', orgId);

  console.log('Subscription activated for org:', orgId);
}

async function handleSubscriptionCharged(payload: any) {
  const subscription = payload.subscription.entity;
  const payment = payload.payment.entity;
  const orgId = subscription.notes?.organization_id;

  if (!orgId) {
    console.error('No organization_id in subscription notes');
    return;
  }

  // Update organization status
  await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      subscription_current_period_end: new Date(
        subscription.current_end * 1000
      ).toISOString(),
      card_last4: payment.card?.last4,
      card_brand: payment.card?.network,
    })
    .eq('id', orgId);

  console.log('Subscription charged for org:', orgId, 'Amount:', payment.amount);

  // TODO: Send "Payment successful" email to user
}

async function handleSubscriptionCompleted(payload: any) {
  const subscription = payload.subscription.entity;
  const orgId = subscription.notes?.organization_id;

  if (!orgId) return;

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'completed',
    })
    .eq('id', orgId);

  console.log('Subscription completed for org:', orgId);
}

async function handleSubscriptionCancelled(payload: any) {
  const subscription = payload.subscription.entity;
  const orgId = subscription.notes?.organization_id;

  if (!orgId) return;

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('id', orgId);

  console.log('Subscription cancelled for org:', orgId);

  // TODO: Send "Subscription cancelled" email
}

async function handleSubscriptionPaused(payload: any) {
  const subscription = payload.subscription.entity;
  const orgId = subscription.notes?.organization_id;

  if (!orgId) return;

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'paused',
    })
    .eq('id', orgId);

  console.log('Subscription paused for org:', orgId);
}

async function handleSubscriptionResumed(payload: any) {
  const subscription = payload.subscription.entity;
  const orgId = subscription.notes?.organization_id;

  if (!orgId) return;

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
    })
    .eq('id', orgId);

  console.log('Subscription resumed for org:', orgId);
}

async function handlePaymentFailed(payload: any) {
  const payment = payload.payment.entity;
  const subscription = payment.subscription_id;

  // Get org from subscription
  const { data: subs } = await supabase
    .from('organizations')
    .select('id')
    .eq('razorpay_subscription_id', subscription)
    .single();

  if (!subs) return;

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'payment_failed',
    })
    .eq('id', subs.id);

  console.log('Payment failed for subscription:', subscription);

  // TODO: Send "Payment failed" email with retry info
}

async function logWebhookEvent(
  eventType: string,
  payload: any,
  eventId: string
) {
  const orgId = payload.subscription?.entity?.notes?.organization_id;

  if (!orgId) return;

  await supabase.from('subscription_logs').insert({
    organization_id: orgId,
    event_type: eventType,
    event_data: payload,
    razorpay_event_id: eventId,
  });
}
