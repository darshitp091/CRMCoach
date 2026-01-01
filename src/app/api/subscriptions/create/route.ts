import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSubscription, createCustomer } from '@/lib/razorpay/server';
import { RAZORPAY_PLANS, TRIAL_DAYS } from '@/lib/razorpay/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planId, organizationId } = body;

    if (!userId || !planId || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single() as any);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get organization details
    const { data: org, error: orgError } = await (supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single() as any);

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create Razorpay customer if doesn't exist
    let customerId = org.razorpay_customer_id;

    if (!customerId) {
      const customerResult = await createCustomer({
        name: user.full_name,
        email: user.email,
        notes: {
          organization_id: organizationId,
          user_id: userId,
        },
      });

      if (!customerResult.success) {
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        );
      }

      customerId = customerResult.customer.id;

      // Update organization with customer ID
      await supabase
        .from('organizations')
        .update({ razorpay_customer_id: customerId })
        .eq('id', organizationId);
    }

    // Calculate trial start date (current time + trial period)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);
    const startAt = Math.floor(trialEndDate.getTime() / 1000); // Unix timestamp

    // Create subscription with trial
    // Note: You need to create plan in Razorpay dashboard first
    // For now, we'll create a subscription without plan_id (manual setup needed)
    const subscriptionResult = await createSubscription({
      planId: `plan_${planId}`, // Replace with actual Razorpay plan ID
      customerId,
      startAt, // Start charging after trial period
      notes: {
        organization_id: organizationId,
        plan_id: planId,
        trial_days: TRIAL_DAYS.toString(),
      },
    });

    if (!subscriptionResult.success) {
      return NextResponse.json(
        { error: 'Failed to create subscription', details: subscriptionResult.error },
        { status: 500 }
      );
    }

    const subscription: any = subscriptionResult.subscription;

    // Update organization with subscription details
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        razorpay_subscription_id: subscription.id,
        subscription_plan: planId,
        subscription_status: 'trialing',
        trial_ends_at: trialEndDate.toISOString(),
      })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Failed to update organization:', updateError);
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: planId,
        trialEndsAt: trialEndDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
