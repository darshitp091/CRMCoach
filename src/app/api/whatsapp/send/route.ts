import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { sendTextMessage, formatPhoneNumber, isWhatsAppConfigured, calculateWhatsAppCost } from '@/lib/whatsapp/client';
import { checkUsageLimit, incrementUsage, trackCost } from '@/lib/usage-limits';

/**
 * POST /api/whatsapp/send
 * Send WhatsApp message to client
 */
export async function POST(req: NextRequest) {
  try {
    // Check if WhatsApp is configured
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        { success: false, message: 'WhatsApp integration not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { clientId, message, phoneNumber } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
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

    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check WhatsApp usage limit
    const usageCheck = await checkUsageLimit(user.organization_id, 'whatsapp', 1);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: usageCheck.message,
          overageCost: usageCheck.overageCost,
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Get client phone number if clientId provided
    let recipientPhone = phoneNumber;

    if (clientId && !phoneNumber) {
      const { data: client } = await supabase
        .from('clients')
        .select('phone')
        .eq('id', clientId)
        .eq('organization_id', user.organization_id)
        .single();

      if (!client || !client.phone) {
        return NextResponse.json(
          { success: false, message: 'Client phone number not found' },
          { status: 404 }
        );
      }

      recipientPhone = client.phone;
    }

    if (!recipientPhone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(recipientPhone);

    // Send WhatsApp message
    const result = await sendTextMessage(formattedPhone, message);

    // Store message in database
    await supabase.from('whatsapp_messages').insert({
      organization_id: user.organization_id,
      client_id: clientId || null,
      to_phone: formattedPhone,
      message_text: message,
      whatsapp_message_id: result.messages[0].id,
      status: 'sent',
      direction: 'outbound',
      sent_by: session.user.id,
    });

    // Increment usage counter
    await incrementUsage(user.organization_id, 'whatsapp', 1);

    // Track cost (business-initiated messages cost money)
    const cost = calculateWhatsAppCost('business');
    await trackCost(user.organization_id, 'whatsapp', 1, cost);

    return NextResponse.json({
      success: true,
      messageId: result.messages[0].id,
      usage: {
        current: usageCheck.current + 1,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining - 1,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/whatsapp/send:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
