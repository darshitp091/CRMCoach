import { loadStripe, Stripe } from '@stripe/stripe-js';

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Missing Stripe publishable key');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Plan configurations matching Stripe products
export const STRIPE_PLANS = {
  standard: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD || '',
    name: 'Standard',
    price: 1499,
    currency: 'INR',
    interval: 'month',
    features: {
      maxClients: 25,
      maxSessions: -1, // unlimited
      videoCallHours: 0,
      aiFeatures: false,
      whatsappIntegration: false,
      customBranding: false,
      prioritySupport: false,
      analytics: 'basic',
    },
  },
  pro: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '',
    name: 'Pro',
    price: 3999,
    currency: 'INR',
    interval: 'month',
    features: {
      maxClients: 100,
      maxSessions: -1, // unlimited
      videoCallHours: 50,
      aiFeatures: true,
      whatsappIntegration: true,
      customBranding: false,
      prioritySupport: true,
      analytics: 'advanced',
    },
  },
  premium: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || '',
    name: 'Premium',
    price: 7999,
    currency: 'INR',
    interval: 'month',
    features: {
      maxClients: -1, // unlimited
      maxSessions: -1, // unlimited
      videoCallHours: 200,
      aiFeatures: true,
      whatsappIntegration: true,
      customBranding: true,
      prioritySupport: true,
      analytics: 'enterprise',
    },
  },
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;

export const TRIAL_DAYS = 7;
