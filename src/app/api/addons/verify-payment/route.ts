import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import crypto from 'crypto';

/**
 * POST /api/addons/verify-payment
 * Verify Razorpay payment and activate add-on
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addonType,
      addonPackage,
      quantity,
      price,
      billingCycle,
      monthlyLimit,
    } = body;

    // Validate signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
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

    // Get user's organization
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

    // Create add-on subscription using database function
    const { data: addonId, error: purchaseError } = await supabase.rpc('purchase_addon', {
      org_id: user.organization_id,
      addon_type_param: addonType,
      addon_package_param: addonPackage || null,
      quantity_param: quantity,
      price_param: price,
      billing_cycle_param: billingCycle,
      monthly_limit_param: monthlyLimit,
      razorpay_order_id_param: razorpay_order_id,
      razorpay_payment_id_param: razorpay_payment_id,
    });

    if (purchaseError) {
      console.error('Error activating add-on:', purchaseError);
      return NextResponse.json(
        { success: false, message: 'Failed to activate add-on' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Add-on activated successfully',
      addonId,
    });
  } catch (error: any) {
    console.error('Error in POST /api/addons/verify-payment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
