import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      cycle,
    } = await request.json();

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile } = await (supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single() as any);

    if (!userProfile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Calculate subscription dates
    const now = new Date();
    const subscriptionEndDate = new Date(now);
    if (cycle === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    }

    // Update organization subscription
    const { error: updateError } = await ((supabase as any)
      .from('organizations')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        subscription_start_date: now.toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        razorpay_subscription_id: razorpay_payment_id,
      })
      .eq('id', userProfile.organization_id));

    if (updateError) {
      console.error('Failed to update subscription:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    // Record payment
    const { error: paymentError } = await ((supabase as any)
      .from('payments')
      .insert({
        organization_id: userProfile.organization_id,
        client_id: user.id, // Using user as client for subscription payments
        amount: cycle === 'yearly' ? (plan === 'standard' ? 19190 : plan === 'pro' ? 38390 : 67190) : (plan === 'standard' ? 1999 : plan === 'pro' ? 3999 : 6999),
        currency: 'INR',
        status: 'completed',
        payment_gateway: 'razorpay',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${cycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
        paid_at: now.toISOString(),
        metadata: {
          plan,
          cycle,
          subscription_type: 'upgrade',
        },
      }));

    if (paymentError) {
      console.error('Failed to record payment:', paymentError);
      // Don't fail the request since subscription is already updated
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription updated',
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
