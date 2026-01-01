import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/whatsapp/webhook
 * Webhook verification for WhatsApp
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Check if mode and token are in the query string
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    // Respond with the challenge token from the request
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ success: false }, { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Receive incoming WhatsApp messages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // WhatsApp sends webhook updates in this format
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value;

            // Handle incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                await handleIncomingMessage(message, value.metadata);
              }
            }

            // Handle message status updates (delivered, read, failed)
            if (value.statuses) {
              for (const status of value.statuses) {
                await handleMessageStatus(status);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in POST /api/whatsapp/webhook:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/**
 * Handle incoming WhatsApp message
 */
async function handleIncomingMessage(message: any, metadata: any) {
  try {
    const fromPhone = message.from;
    const messageType = message.type;
    let messageText = '';

    // Extract message text based on type
    if (messageType === 'text') {
      messageText = message.text.body;
    } else if (messageType === 'image') {
      messageText = `[Image] ${message.image.caption || ''}`;
    } else if (messageType === 'document') {
      messageText = `[Document] ${message.document.filename || ''}`;
    } else if (messageType === 'audio') {
      messageText = '[Audio message]';
    } else if (messageType === 'voice') {
      messageText = '[Voice note]';
    }

    // Find client by phone number
    const { data: clients } = await ((supabase as any)
      .from('clients')
      .select('id, organization_id, full_name')
      .eq('phone', fromPhone)
      .limit(1));

    const client = clients?.[0];

    if (!client) {
      console.warn(`Received WhatsApp message from unknown number: ${fromPhone}`);
      // TODO: Create notification for admin about unknown contact
      return;
    }

    // Store incoming message
    await ((supabase as any).from('whatsapp_messages').insert({
      organization_id: client.organization_id,
      client_id: client.id,
      from_phone: fromPhone,
      message_text: messageText,
      message_type: messageType,
      whatsapp_message_id: message.id,
      status: 'received',
      direction: 'inbound',
      timestamp: new Date(message.timestamp * 1000).toISOString(),
    }));

    // TODO: Create notification for coach about new message
    // TODO: Auto-reply if configured
    // TODO: Trigger automation workflows if configured
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

/**
 * Handle message status update
 */
async function handleMessageStatus(status: any) {
  try {
    const messageId = status.id;
    const statusValue = status.status; // 'sent', 'delivered', 'read', 'failed'

    // Update message status in database
    await ((supabase as any)
      .from('whatsapp_messages')
      .update({
        status: statusValue,
        delivered_at: statusValue === 'delivered' ? new Date().toISOString() : undefined,
        read_at: statusValue === 'read' ? new Date().toISOString() : undefined,
        failed_at: statusValue === 'failed' ? new Date().toISOString() : undefined,
        error_message: status.errors?.[0]?.message || null,
      })
      .eq('whatsapp_message_id', messageId));
  } catch (error) {
    console.error('Error handling message status:', error);
  }
}
