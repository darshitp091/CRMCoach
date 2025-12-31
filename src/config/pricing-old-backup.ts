import { SubscriptionPlan } from '@/types/database.types';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export const currencies: Record<Currency, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
};

// Exchange rates relative to INR (approximate rates for 2025)
export const exchangeRates: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,    // 1 INR = 0.012 USD
  EUR: 0.011,    // 1 INR = 0.011 EUR
  GBP: 0.0095,   // 1 INR = 0.0095 GBP
  AUD: 0.018,    // 1 INR = 0.018 AUD
  CAD: 0.016,    // 1 INR = 0.016 CAD
  SGD: 0.016,    // 1 INR = 0.016 SGD
};

export interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  price: number; // Base price in INR
  yearlyPrice: number; // Base yearly price in INR
  period: string;
  description: string;
  features: PricingFeature[];
  cta: string;
  popular: boolean;
  gradient: string;
  limits: {
    clients: number | 'unlimited';
    teamMembers: number | 'unlimited';
    storage: string;
    emailsPerMonth: number | 'unlimited';
    automations: number | 'unlimited';
    templates: number | 'unlimited';
  };
}

// Helper function to convert price to any currency
export function convertPrice(priceInINR: number, currency: Currency): number {
  const converted = priceInINR * exchangeRates[currency];
  // Round to nearest sensible value based on currency
  if (currency === 'INR') return Math.round(converted);
  if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
    return Math.round(converted);
  }
  return Math.round(converted);
}

// Helper to format price with currency
export function formatPrice(price: number, currency: Currency): string {
  const currencyInfo = currencies[currency];
  return `${currencyInfo.symbol}${price.toLocaleString()}`;
}

// Competitive pricing based on 2025 market research
// Standard: ₹1,999/mo (vs competitors: $29-49/mo = ₹2,400-4,000)
// Pro: ₹3,999/mo (vs competitors: $49-79/mo = ₹4,000-6,500)
// Premium: ₹6,999/mo (vs competitors: $79-99/mo = ₹6,500-8,100)

export const pricingPlans: PricingPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 1999,
    yearlyPrice: Math.round(1999 * 12 * 0.8), // 20% discount
    period: '/month',
    description: 'Perfect for solo coaches and consultants',
    features: [
      { text: 'Up to 50 clients', included: true },
      { text: 'Unlimited sessions', included: true },
      { text: 'Basic scheduling & calendar sync', included: true },
      { text: 'Email & SMS notifications', included: true },
      { text: 'Client portal access', included: true },
      { text: 'Basic analytics & reports', included: true },
      { text: '2 team members', included: true },
      { text: '5 GB storage', included: true },
      { text: 'Email support', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Payment processing (2.5% fee)', included: true },
      { text: 'Basic automation workflows', included: true },
      { text: 'WhatsApp integration', included: false },
      { text: 'Video calling', included: false },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Start 7-Day Trial',
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
    limits: {
      clients: 50,
      teamMembers: 2,
      storage: '5 GB',
      emailsPerMonth: 1000,
      automations: 5,
      templates: 10,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 3999,
    yearlyPrice: Math.round(3999 * 12 * 0.8), // 20% discount
    period: '/month',
    description: 'For growing coaching businesses',
    features: [
      { text: 'Up to 200 clients', included: true },
      { text: 'Unlimited sessions', included: true },
      { text: 'Advanced scheduling & automation', included: true },
      { text: 'Email, SMS & WhatsApp notifications', included: true, tooltip: 'Includes WhatsApp Business API integration' },
      { text: 'White-label client portal', included: true },
      { text: 'Advanced analytics & custom reports', included: true },
      { text: '5 team members', included: true },
      { text: '50 GB storage', included: true },
      { text: 'Priority email & chat support', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Payment processing (2% fee)', included: true },
      { text: 'Advanced automation workflows', included: true },
      { text: 'Video calling (up to 50 hours/month)', included: true, tooltip: 'Integrated video calls with recording' },
      { text: 'Custom branding & domain', included: true },
      { text: 'Email campaigns & sequences', included: true },
      { text: 'Client progress tracking', included: true },
      { text: 'Document management', included: true },
      { text: 'API access (Basic)', included: false },
    ],
    cta: 'Start 7-Day Trial',
    popular: true,
    gradient: 'from-brand-primary-600 to-brand-accent-600',
    limits: {
      clients: 200,
      teamMembers: 5,
      storage: '50 GB',
      emailsPerMonth: 5000,
      automations: 25,
      templates: 50,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 6999,
    yearlyPrice: Math.round(6999 * 12 * 0.8), // 20% discount
    period: '/month',
    description: 'For established coaching enterprises',
    features: [
      { text: 'Unlimited clients', included: true },
      { text: 'Unlimited sessions', included: true },
      { text: 'AI-powered scheduling & insights', included: true, tooltip: 'Smart scheduling suggestions and AI analytics' },
      { text: 'Omnichannel communications', included: true, tooltip: 'Email, SMS, WhatsApp, In-app messaging' },
      { text: 'Fully white-labeled platform', included: true },
      { text: 'Custom analytics & BI integrations', included: true },
      { text: 'Unlimited team members', included: true },
      { text: '200 GB storage', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Payment processing (1.5% fee)', included: true },
      { text: 'Unlimited automation workflows', included: true },
      { text: 'Video calling (unlimited)', included: true },
      { text: 'Custom branding & multiple domains', included: true },
      { text: 'Advanced email marketing platform', included: true },
      { text: 'Client progress tracking & AI coaching', included: true },
      { text: 'Document management with e-signatures', included: true },
      { text: 'Full API access & webhooks', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Advanced security (SSO, 2FA)', included: true },
      { text: 'SLA guarantee (99.9% uptime)', included: true },
      { text: 'Priority feature requests', included: true },
    ],
    cta: 'Start 7-Day Trial',
    popular: false,
    gradient: 'from-brand-secondary-500 to-brand-primary-600',
    limits: {
      clients: 'unlimited',
      teamMembers: 'unlimited',
      storage: '200 GB',
      emailsPerMonth: 'unlimited',
      automations: 'unlimited',
      templates: 'unlimited',
    },
  },
];

// Feature mapping for feature gating
export const planFeatures: Record<SubscriptionPlan, string[]> = {
  standard: [
    'client_management',
    'basic_scheduling',
    'email_notifications',
    'sms_notifications',
    'client_portal',
    'basic_analytics',
    'payment_processing',
    'mobile_app',
    'basic_automation',
  ],
  pro: [
    'client_management',
    'advanced_scheduling',
    'email_notifications',
    'sms_notifications',
    'whatsapp_notifications',
    'whitelabel_portal',
    'advanced_analytics',
    'custom_reports',
    'payment_processing',
    'mobile_app',
    'advanced_automation',
    'video_calling',
    'custom_branding',
    'email_campaigns',
    'progress_tracking',
    'document_management',
  ],
  premium: [
    'client_management',
    'ai_scheduling',
    'email_notifications',
    'sms_notifications',
    'whatsapp_notifications',
    'inapp_messaging',
    'whitelabel_platform',
    'advanced_analytics',
    'custom_reports',
    'bi_integrations',
    'payment_processing',
    'mobile_app',
    'unlimited_automation',
    'unlimited_video_calling',
    'custom_branding',
    'multiple_domains',
    'advanced_email_marketing',
    'ai_coaching',
    'progress_tracking',
    'document_management',
    'esignatures',
    'api_access',
    'webhooks',
    'custom_integrations',
    'sso',
    'two_factor_auth',
    'sla_guarantee',
    'priority_features',
  ],
};

// Helper function to check if a plan has a feature
export function hasFeature(plan: SubscriptionPlan, feature: string): boolean {
  return planFeatures[plan]?.includes(feature) ?? false;
}

// Helper function to get plan limits
export function getPlanLimits(plan: SubscriptionPlan) {
  return pricingPlans.find((p) => p.id === plan)?.limits;
}
