/**
 * WhatsApp Business API Client
 *
 * Uses Meta's Cloud API for WhatsApp Business
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_API_BASE_URL = 'https://graph.facebook.com';

export interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., "919876543210")
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename: string;
    caption?: string;
  };
}

export interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<WhatsAppMessageResponse> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp credentials not configured');
    }

    const url = `${WHATSAPP_API_BASE_URL}/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        ...message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send text message
 */
export async function sendTextMessage(
  to: string,
  text: string
): Promise<WhatsAppMessageResponse> {
  return sendWhatsAppMessage({
    to,
    type: 'text',
    text: { body: text },
  });
}

/**
 * Send template message (for notifications)
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components?: any[]
): Promise<WhatsAppMessageResponse> {
  return sendWhatsAppMessage({
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

/**
 * Send image
 */
export async function sendImage(
  to: string,
  imageUrl: string,
  caption?: string
): Promise<WhatsAppMessageResponse> {
  return sendWhatsAppMessage({
    to,
    type: 'image',
    image: {
      link: imageUrl,
      caption,
    },
  });
}

/**
 * Send document
 */
export async function sendDocument(
  to: string,
  documentUrl: string,
  filename: string,
  caption?: string
): Promise<WhatsAppMessageResponse> {
  return sendWhatsAppMessage({
    to,
    type: 'document',
    document: {
      link: documentUrl,
      filename,
      caption,
    },
  });
}

/**
 * Format phone number for WhatsApp (remove +, spaces, dashes)
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\+\(\)]/g, '');
}

/**
 * Check if WhatsApp is configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ACCESS_TOKEN
  );
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('WhatsApp webhook secret not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

/**
 * Calculate WhatsApp message cost
 * Pricing: Business-initiated = ₹0.40-1.20, User-initiated reply (24h) = Free
 */
export function calculateWhatsAppCost(messageType: 'business' | 'reply'): number {
  if (messageType === 'reply') {
    return 0; // Free if replying within 24h window
  }
  return 1.0; // ₹1 for business-initiated messages (conservative estimate)
}

/**
 * Pre-approved message templates
 * These need to be created in Meta Business Manager first
 */
export const MESSAGE_TEMPLATES = {
  session_reminder: {
    name: 'session_reminder',
    language: 'en',
    // Template: "Hi {{1}}, this is a reminder about your coaching session with {{2}} on {{3}} at {{4}}. See you soon!"
  },
  session_confirmation: {
    name: 'session_confirmation',
    language: 'en',
    // Template: "Hi {{1}}, your session on {{2}} at {{3}} has been confirmed. Looking forward to seeing you!"
  },
  payment_reminder: {
    name: 'payment_reminder',
    language: 'en',
    // Template: "Hi {{1}}, this is a reminder that your payment of {{2}} is due on {{3}}. Please complete the payment to continue your sessions."
  },
  welcome_message: {
    name: 'welcome_message',
    language: 'en',
    // Template: "Welcome to {{1}}! We're excited to start this coaching journey with you. Reply to this message if you have any questions."
  },
};
