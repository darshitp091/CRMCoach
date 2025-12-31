import Razorpay from 'razorpay';
import crypto from 'crypto';

// Server-side Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET || ''
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Create a Razorpay subscription
export async function createSubscription({
  planId,
  customerId,
  totalCount = 0, // 0 = until cancelled
  startAt,
  addons = [],
  notes = {},
}: {
  planId: string;
  customerId?: string;
  totalCount?: number;
  startAt?: number; // Unix timestamp
  addons?: any[];
  notes?: Record<string, string>;
}) {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: totalCount,
      start_at: startAt,
      addons,
      notes,
      notify: 1, // Send notifications
    });

    return { success: true, subscription };
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return { success: false, error: error.message };
  }
}

// Create Razorpay customer
export async function createCustomer({
  name,
  email,
  contact,
  notes = {},
}: {
  name: string;
  email: string;
  contact?: string;
  notes?: Record<string, string>;
}) {
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact,
      notes,
      fail_existing: 0, // Don't fail if customer exists
    });

    return { success: true, customer };
  } catch (error: any) {
    console.error('Create customer error:', error);
    return { success: false, error: error.message };
  }
}

// Fetch subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    return { success: true, subscription };
  } catch (error: any) {
    console.error('Fetch subscription error:', error);
    return { success: false, error: error.message };
  }
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = false
) {
  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId, {
      cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
    });

    return { success: true, subscription };
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return { success: false, error: error.message };
  }
}

// Update subscription
export async function updateSubscription(
  subscriptionId: string,
  updates: {
    plan_id?: string;
    quantity?: number;
    remaining_count?: number;
    start_at?: number;
    schedule_change_at?: 'now' | 'cycle_end';
  }
) {
  try {
    const subscription = await razorpay.subscriptions.update(subscriptionId, updates);
    return { success: true, subscription };
  } catch (error: any) {
    console.error('Update subscription error:', error);
    return { success: false, error: error.message };
  }
}

// Fetch all payments for a subscription
export async function getSubscriptionPayments(subscriptionId: string) {
  try {
    const payments = await razorpay.subscriptions.fetchAllPayments(subscriptionId);
    return { success: true, payments };
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    return { success: false, error: error.message };
  }
}
