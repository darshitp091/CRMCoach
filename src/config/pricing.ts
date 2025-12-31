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

// Exchange rates relative to INR (2025 rates)
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

// Credit-based usage limits
export interface UsageLimits {
  clients: number | 'unlimited';
  sessions: number | 'unlimited';
  teamMembers: number | 'unlimited';
  storage: string; // e.g., "5 GB"
  emailsPerMonth: number | 'unlimited';
  smsPerMonth: number | 'unlimited';
  whatsappPerMonth: number | 'unlimited';
  videoMinutesPerMonth: number | 'unlimited'; // Total participant-minutes
  aiSummariesPerMonth: number | 'unlimited';
  aiInsightsPerMonth: number | 'unlimited';
  transcriptionHoursPerMonth: number | 'unlimited';
  automations: number | 'unlimited';
  templates: number | 'unlimited';
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
  limits: UsageLimits;
  costPerUser: number; // Internal: actual cost to us per user
  targetMargin: string; // Internal: target profit margin
}

// Helper function to convert price to any currency
export function convertPrice(priceInINR: number, currency: Currency): number {
  const converted = priceInINR * exchangeRates[currency];
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

// ============================================================================
// OPTIMIZED PRICING (2025) - Based on Comprehensive Cost Analysis
// ============================================================================
// Ensures 30-40% minimum profit margin after ALL costs
//
// Cost Analysis Summary:
// - Standard Plan: ₹353/user cost → ₹1,499 price = 76.5% margin
// - Pro Plan: ₹1,706/user cost → ₹3,999 price = 57.3% margin
// - Premium Plan: ₹5,390/user cost → ₹7,999 price = 32.6% margin
//
// Key Changes from Previous Pricing:
// 1. Standard: ₹1,999 → ₹1,499 (reduced 25% - was 82% margin, now 76.5%)
// 2. Pro: ₹3,999 → ₹3,999 (unchanged - 57.3% margin is healthy)
// 3. Premium: ₹6,999 → ₹7,999 (increased 14% - was 23% margin, now 32.6%)
//
// Major Cost Drivers:
// - Video calling: ₹640-2,400/user/month (40-50% of costs)
// - AI transcription: ₹720-2,700/user for heavy users
// - WhatsApp: ₹85-768/user/month
// ============================================================================

export const pricingPlans: PricingPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 1499,
    yearlyPrice: Math.round(1499 * 12 * 0.83), // 17% annual discount = ₹14,990/year
    period: '/month',
    description: 'Perfect for solo coaches and new consultants',
    features: [
      { text: 'Up to 25 clients', included: true },
      { text: 'Unlimited sessions', included: true, tooltip: 'Schedule and track unlimited coaching sessions' },
      { text: 'Basic scheduling & calendar sync', included: true },
      { text: '500 emails/month', included: true },
      { text: '25 SMS/month', included: true },
      { text: 'Client portal access', included: true },
      { text: 'Basic analytics & reports', included: true },
      { text: '2 team members', included: true },
      { text: '5 GB storage', included: true },
      { text: 'Email support (24-48h)', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Payment processing via Razorpay', included: true, tooltip: '2.5% transaction fee applies' },
      { text: 'Basic automation workflows (5 automations)', included: true },
      { text: 'WhatsApp integration', included: false },
      { text: 'Video calling', included: false },
      { text: 'AI features', included: false },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Start 7-Day Trial',
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
    limits: {
      clients: 25,
      sessions: 'unlimited', // Tracked but not limited
      teamMembers: 2,
      storage: '5 GB',
      emailsPerMonth: 500,
      smsPerMonth: 25,
      whatsappPerMonth: 0,
      videoMinutesPerMonth: 0,
      aiSummariesPerMonth: 0,
      aiInsightsPerMonth: 0,
      transcriptionHoursPerMonth: 0,
      automations: 5,
      templates: 10,
    },
    costPerUser: 353, // Actual cost to us
    targetMargin: '76.5%',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 3999,
    yearlyPrice: Math.round(3999 * 12 * 0.83), // 17% annual discount = ₹39,990/year
    period: '/month',
    description: 'For growing coaching businesses',
    features: [
      { text: 'Up to 100 clients', included: true },
      { text: 'Unlimited sessions', included: true },
      { text: 'Advanced scheduling & automation', included: true },
      { text: '2,000 emails/month', included: true },
      { text: '100 SMS/month', included: true },
      { text: '500 WhatsApp messages/month', included: true, tooltip: 'WhatsApp Business API integration' },
      { text: 'White-label client portal', included: true },
      { text: 'Advanced analytics & custom reports', included: true },
      { text: '5 team members', included: true },
      { text: '50 GB storage', included: true },
      { text: 'Priority email & chat support (12-24h)', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Payment processing (2% fee)', included: true },
      { text: 'Advanced automation workflows (unlimited)', included: true },
      { text: 'Video calling - 50 hours/month', included: true, tooltip: '3,000 participant-minutes included. High-quality video calls with screen sharing.' },
      { text: 'AI Session Summaries - 80/month', included: true, tooltip: 'AI-powered session notes and action items extraction' },
      { text: 'AI Insights & Predictions - 20/month', included: true, tooltip: 'Client engagement analysis and churn prediction' },
      { text: 'Custom branding & domain', included: true },
      { text: 'Email campaigns & sequences', included: true },
      { text: 'Client progress tracking', included: true },
      { text: 'Document management', included: true },
      { text: 'Transcription - Add-on available', included: false, tooltip: '₹199/month for 30 hours transcription' },
      { text: 'API access (Basic)', included: false },
    ],
    cta: 'Start 7-Day Trial',
    popular: true,
    gradient: 'from-brand-primary-600 to-brand-accent-600',
    limits: {
      clients: 100,
      sessions: 'unlimited',
      teamMembers: 5,
      storage: '50 GB',
      emailsPerMonth: 2000,
      smsPerMonth: 100,
      whatsappPerMonth: 500,
      videoMinutesPerMonth: 3000, // 50 hours × 60 minutes
      aiSummariesPerMonth: 80,
      aiInsightsPerMonth: 20,
      transcriptionHoursPerMonth: 0, // Available as add-on
      automations: 'unlimited',
      templates: 'unlimited',
    },
    costPerUser: 1706, // Actual cost to us
    targetMargin: '57.3%',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 7999,
    yearlyPrice: Math.round(7999 * 12 * 0.83), // 17% annual discount = ₹79,990/year
    period: '/month',
    description: 'For established coaching enterprises',
    features: [
      { text: 'Unlimited clients', included: true, tooltip: 'Fair use policy: up to 500 clients recommended for optimal performance' },
      { text: 'Unlimited sessions', included: true },
      { text: 'AI-powered scheduling & insights', included: true, tooltip: 'Smart scheduling suggestions and predictive analytics' },
      { text: '10,000 emails/month', included: true },
      { text: '300 SMS/month', included: true },
      { text: '2,000 WhatsApp messages/month', included: true, tooltip: 'WhatsApp Business API with automation' },
      { text: 'Fully white-labeled platform', included: true },
      { text: 'Custom analytics & BI integrations', included: true },
      { text: 'Unlimited team members', included: true, tooltip: 'Fair use policy: up to 20 team members recommended' },
      { text: '200 GB storage', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Payment processing (1.5% fee)', included: true },
      { text: 'Unlimited automation workflows', included: true },
      { text: 'Video calling - 200 hours/month', included: true, tooltip: '12,000 participant-minutes included. Enterprise-grade video infrastructure.' },
      { text: 'Unlimited AI Session Summaries', included: true, tooltip: 'Fair use: up to 300/month recommended' },
      { text: 'AI Insights & Churn Prediction - 200/month', included: true },
      { text: 'AI Transcription - 80 hours/month', included: true, tooltip: 'Automatic voice-to-text transcription with AI processing' },
      { text: 'Custom branding & multiple domains', included: true },
      { text: 'Advanced email marketing platform', included: true },
      { text: 'Client progress tracking & AI coaching', included: true },
      { text: 'Document management with e-signatures', included: true },
      { text: 'Full API access & webhooks', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Advanced security (SSO, 2FA)', included: true },
      { text: 'SLA guarantee (99.9% uptime)', included: true },
      { text: 'Priority feature requests', included: true },
      { text: 'White-label mobile apps', included: false, tooltip: 'Available as add-on: ₹34,999 setup + ₹4,999/month' },
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-brand-secondary-500 to-brand-primary-600',
    limits: {
      clients: 'unlimited', // Fair use: 500 max recommended
      sessions: 'unlimited',
      teamMembers: 'unlimited', // Fair use: 20 max recommended
      storage: '200 GB',
      emailsPerMonth: 10000,
      smsPerMonth: 300,
      whatsappPerMonth: 2000,
      videoMinutesPerMonth: 12000, // 200 hours × 60 minutes
      aiSummariesPerMonth: 'unlimited', // Fair use: 300 max
      aiInsightsPerMonth: 200,
      transcriptionHoursPerMonth: 80,
      automations: 'unlimited',
      templates: 'unlimited',
    },
    costPerUser: 5390, // Actual cost to us
    targetMargin: '32.6%',
  },
];

// Add-on pricing for additional resources
export const addOns = {
  clients: {
    standard: { price: 30, per: 'client/month', description: 'Extra client beyond plan limit' },
    pro: { price: 20, per: 'client/month', description: 'Extra client beyond plan limit' },
    premium: { price: 10, per: 'client/month', description: 'Extra client (beyond 500)' },
  },
  teamMembers: {
    standard: { price: 299, per: 'member/month', description: 'Additional team member seat' },
    pro: { price: 599, per: 'member/month', description: 'Additional team member seat' },
    premium: { price: 799, per: 'member/month', description: 'Additional team member (beyond 20)' },
  },
  storage: {
    price: 15, per: 'GB/month', description: 'Additional storage beyond plan limit'
  },
  emails: {
    price: 40, per: '1,000 emails', description: 'Extra email credits'
  },
  sms: {
    price: 6, per: 'SMS', description: 'Additional SMS messages'
  },
  whatsapp: {
    pro: { price: 1.50, per: 'message', description: 'Extra WhatsApp messages' },
    premium: { price: 1, per: 'message', description: 'Extra WhatsApp messages' },
  },
  video: {
    pro: { price: 100, per: '250 minutes', description: 'Extra video calling time' },
    premium: { price: 100, per: '285 minutes', description: 'Extra video calling time' },
  },
  transcription: {
    package30: { price: 199, hours: 30, per: 'month', description: '30 hours transcription/month' },
    package100: { price: 599, hours: 100, per: 'month', description: '100 hours transcription/month' },
    unlimited: { price: 1999, hours: 'unlimited', per: 'month', description: 'Unlimited transcription (fair use: 500h)' },
  },
  aiSummaries: {
    price: 50, per: '10 summaries', description: 'Extra AI session summaries'
  },
};

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
    'ai_summaries',
    'ai_insights',
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
    'video_calling',
    'ai_summaries',
    'ai_insights',
    'ai_transcription',
    'churn_prediction',
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
export function getPlanLimits(plan: SubscriptionPlan): UsageLimits | undefined {
  return pricingPlans.find((p) => p.id === plan)?.limits;
}

// Helper function to check if usage limit is exceeded
export function isLimitExceeded(
  plan: SubscriptionPlan,
  limitType: keyof UsageLimits,
  currentUsage: number
): boolean {
  const limits = getPlanLimits(plan);
  if (!limits) return false;

  const limit = limits[limitType];
  if (limit === 'unlimited') return false;
  if (typeof limit === 'string') {
    // Parse storage limits like "5 GB"
    const numericLimit = parseInt(limit);
    return currentUsage > numericLimit;
  }
  return currentUsage > limit;
}

// Helper function to calculate overage cost
export function calculateOverageCost(
  plan: SubscriptionPlan,
  limitType: keyof UsageLimits,
  overage: number
): number {
  // Implementation for overage pricing
  // Returns cost in INR for the overage amount
  switch (limitType) {
    case 'clients':
      return overage * (addOns.clients[plan]?.price || 0);
    case 'teamMembers':
      return overage * (addOns.teamMembers[plan]?.price || 0);
    case 'emailsPerMonth':
      return Math.ceil(overage / 1000) * addOns.emails.price;
    case 'smsPerMonth':
      return overage * addOns.sms.price;
    case 'whatsappPerMonth':
      const whatsappAddon = addOns.whatsapp[plan === 'standard' ? 'pro' : plan];
      return overage * (whatsappAddon?.price || 0);
    case 'videoMinutesPerMonth':
      const videoAddon = addOns.video[plan === 'standard' ? 'pro' : plan];
      const packageMinutes = plan === 'premium' ? 285 : 250;
      return Math.ceil(overage / packageMinutes) * (videoAddon?.price || 0);
    case 'aiSummariesPerMonth':
      return Math.ceil(overage / 10) * addOns.aiSummaries.price;
    default:
      return 0;
  }
}
