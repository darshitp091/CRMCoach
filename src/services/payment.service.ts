import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { PaymentStatus } from '@/types/database.types';
import Razorpay from 'razorpay';

type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];

// Initialize Razorpay (server-side only)
const razorpay = typeof window === 'undefined'
  ? new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : null;

export interface CreatePaymentData {
  clientId: string;
  amount: number;
  currency?: string;
  description?: string;
  programId?: string;
  sessionId?: string;
  dueDate?: string;
}

export interface RazorpayOrderOptions {
  amount: number; // in paise (smallest currency unit)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export class PaymentService {
  /**
   * Create Razorpay order (server-side)
   */
  static async createRazorpayOrder(options: RazorpayOrderOptions) {
    if (!razorpay) throw new Error('Razorpay not initialized (server-side only)');

    try {
      const order = await razorpay.orders.create({
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        notes: options.notes,
      });

      return order;
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw error;
    }
  }

  /**
   * Create payment record
   */
  static async create(organizationId: string, data: CreatePaymentData): Promise<PaymentRow> {
    const paymentData: PaymentInsert = {
      organization_id: organizationId,
      client_id: data.clientId,
      amount: data.amount,
      currency: data.currency || 'INR',
      status: 'pending',
      payment_gateway: 'razorpay',
      description: data.description || null,
      program_id: data.programId || null,
      session_id: data.sessionId || null,
      due_date: data.dueDate || null,
      metadata: {},
    };

    const { data: payment, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return payment;
  }

  /**
   * Initialize payment with Razorpay (creates order and payment record)
   */
  static async initializePayment(organizationId: string, data: CreatePaymentData) {
    // Create payment record first
    const payment = await this.create(organizationId, data);

    // Create Razorpay order
    const orderOptions: RazorpayOrderOptions = {
      amount: Math.round(data.amount * 100), // Convert to paise
      currency: data.currency || 'INR',
      receipt: payment.invoice_number || payment.id,
      notes: {
        payment_id: payment.id,
        client_id: data.clientId,
        organization_id: organizationId,
      },
    };

    const razorpayOrder = await this.createRazorpayOrder(orderOptions);

    // Update payment with Razorpay order ID
    const { error } = await supabase
      .from('payments')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', payment.id);

    if (error) throw error;

    return {
      payment,
      razorpayOrder,
    };
  }

  /**
   * Verify Razorpay payment signature
   */
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    if (!razorpay) throw new Error('Razorpay not initialized (server-side only)');

    const crypto = require('crypto');
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  /**
   * Complete payment after Razorpay success
   */
  static async completePayment(
    paymentId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    // Get payment to verify
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) throw new Error('Payment not found');

    // Verify signature
    const isValid = this.verifyPaymentSignature(
      payment.razorpay_order_id!,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update payment status
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        paid_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (error) throw error;

    return payment;
  }

  /**
   * Mark payment as failed
   */
  static async markFailed(paymentId: string, reason?: string) {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        metadata: { failure_reason: reason },
      })
      .eq('id', paymentId);

    if (error) throw error;
  }

  /**
   * Get payment by ID
   */
  static async getById(paymentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        client:clients(id, full_name, email),
        program:programs(id, name),
        session:sessions(id, title)
      `)
      .eq('id', paymentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Get payments for client
   */
  static async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get payments for organization
   */
  static async getByOrganization(
    organizationId: string,
    status?: PaymentStatus,
    startDate?: string,
    endDate?: string
  ) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        client:clients(id, full_name, email)
      `)
      .eq('organization_id', organizationId);

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get pending payments
   */
  static async getPending(organizationId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        client:clients(id, full_name, email, phone)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get overdue payments
   */
  static async getOverdue(organizationId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        client:clients(id, full_name, email, phone)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get payment statistics
   */
  static async getStats(organizationId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('payments')
      .select('amount, status, currency, created_at')
      .eq('organization_id', organizationId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total_revenue: data.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0),
      pending_amount: data.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0),
      failed_amount: data.filter(p => p.status === 'failed').reduce((sum, p) => sum + Number(p.amount), 0),
      total_payments: data.length,
      completed_payments: data.filter(p => p.status === 'completed').length,
      pending_payments: data.filter(p => p.status === 'pending').length,
      failed_payments: data.filter(p => p.status === 'failed').length,
    };

    return stats;
  }

  /**
   * Refund payment
   */
  static async refund(paymentId: string, amount?: number) {
    const payment = await this.getById(paymentId);
    if (!payment) throw new Error('Payment not found');

    if (!payment.razorpay_payment_id) {
      throw new Error('Cannot refund payment without Razorpay payment ID');
    }

    if (!razorpay) throw new Error('Razorpay not initialized (server-side only)');

    // Create refund in Razorpay
    const refundAmount = amount ? Math.round(amount * 100) : undefined;
    const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: refundAmount,
    });

    // Update payment status
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        metadata: {
          ...payment.metadata,
          refund_id: refund.id,
          refund_amount: refund.amount / 100,
          refunded_at: new Date().toISOString(),
        },
      })
      .eq('id', paymentId);

    if (error) throw error;

    return refund;
  }

  /**
   * Generate payment link
   */
  static async generatePaymentLink(paymentId: string) {
    const payment = await this.getById(paymentId);
    if (!payment) throw new Error('Payment not found');

    // In production, you would generate a secure payment link
    // For now, return a simple URL
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${paymentId}`;

    return paymentLink;
  }
}
