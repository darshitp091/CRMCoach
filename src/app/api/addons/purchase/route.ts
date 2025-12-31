import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { addOns } from '@/config/pricing';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /api/addons/purchase
 * Create Razorpay order for add-on purchase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      addonType,
      addonPackage, // For transcription
      quantity = 1,
      billingCycle = 'monthly',
    } = body;

    // Validate input
    if (!addonType) {
      return NextResponse.json(
        { success: false, message: 'Add-on type is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization and plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', user.organization_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    const plan = org.subscription_plan;

    // Calculate price based on add-on type
    let price = 0;
    let monthlyLimit = null;
    let description = '';

    switch (addonType) {
      case 'clients':
        price = addOns.clients[plan]?.price * quantity;
        description = `${quantity} extra client${quantity > 1 ? 's' : ''}`;
        break;

      case 'team_members':
        price = addOns.teamMembers[plan]?.price * quantity;
        description = `${quantity} extra team member${quantity > 1 ? 's' : ''}`;
        break;

      case 'storage':
        price = addOns.storage.price * quantity;
        description = `${quantity} GB extra storage`;
        break;

      case 'emails':
        price = addOns.emails.price * quantity;
        description = `${quantity * 1000} extra emails`;
        break;

      case 'sms':
        price = addOns.sms.price * quantity;
        description = `${quantity} extra SMS`;
        break;

      case 'whatsapp':
        if (plan !== 'pro' && plan !== 'premium') {
          return NextResponse.json(
            { success: false, message: 'WhatsApp add-on not available for your plan' },
            { status: 403 }
          );
        }
        price = addOns.whatsapp[plan]?.price * quantity;
        description = `${quantity} extra WhatsApp message${quantity > 1 ? 's' : ''}`;
        break;

      case 'video':
        if (plan !== 'pro' && plan !== 'premium') {
          return NextResponse.json(
            { success: false, message: 'Video add-on not available for your plan' },
            { status: 403 }
          );
        }
        const videoMinutes = plan === 'premium' ? 285 : 250;
        price = addOns.video[plan]?.price * quantity;
        description = `${quantity * videoMinutes} extra video minutes`;
        break;

      case 'transcription':
        if (plan !== 'pro' && plan !== 'premium') {
          return NextResponse.json(
            { success: false, message: 'Transcription add-on not available for your plan' },
            { status: 403 }
          );
        }
        if (!addonPackage || !addOns.transcription[addonPackage]) {
          return NextResponse.json(
            { success: false, message: 'Invalid transcription package' },
            { status: 400 }
          );
        }
        const transcriptionPkg = addOns.transcription[addonPackage];
        price = transcriptionPkg.price;
        monthlyLimit = transcriptionPkg.hours === 'unlimited' ? null : transcriptionPkg.hours * 60; // Convert to minutes
        description = `Transcription - ${transcriptionPkg.hours} hours/month`;
        break;

      case 'ai_summaries':
        if (plan !== 'pro' && plan !== 'premium') {
          return NextResponse.json(
            { success: false, message: 'AI Summaries add-on not available for your plan' },
            { status: 403 }
          );
        }
        price = addOns.aiSummaries.price * quantity;
        description = `${quantity * 10} extra AI summaries`;
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid add-on type' },
          { status: 400 }
        );
    }

    if (price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid price calculated' },
        { status: 400 }
      );
    }

    // Apply billing cycle multiplier
    const finalPrice = billingCycle === 'yearly' ? price * 12 * 0.83 : price; // 17% discount for yearly

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(finalPrice * 100), // Convert to paise
      currency: 'INR',
      receipt: `addon_${user.organization_id}_${Date.now()}`,
      notes: {
        organization_id: user.organization_id,
        addon_type: addonType,
        addon_package: addonPackage || '',
        quantity: quantity.toString(),
        billing_cycle: billingCycle,
        description,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      addonDetails: {
        type: addonType,
        package: addonPackage,
        quantity,
        price: finalPrice,
        monthlyLimit,
        description,
        billingCycle,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/addons/purchase:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
