import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase/client';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { plan, cycle, amount, currency } = await request.json();

    // Validate input
    if (!plan || !cycle || !amount || !currency) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    // Get user profile to find organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, email, full_name')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in smallest currency unit (paise for INR, cents for USD, etc.)
      currency: currency, // Support multiple currencies
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: user.id,
        organization_id: userProfile.organization_id,
        plan: plan,
        cycle: cycle,
        currency: currency,
        email: userProfile.email,
        name: userProfile.full_name,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
