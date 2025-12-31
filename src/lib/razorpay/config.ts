// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  keySecret: process.env.RAZORPAY_KEY_SECRET!,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
};

// Plan configurations with Razorpay plan IDs
// You'll need to create these plans in Razorpay Dashboard first
export const RAZORPAY_PLANS = {
  standard: {
    id: 'standard',
    name: 'Standard',
    amount: 149900, // Amount in paise (₹1,499 = 149900 paise)
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    // razorpayPlanId: 'plan_xxxxx', // Create in Razorpay dashboard
    features: {
      maxClients: 25,
      maxSessions: -1, // unlimited
      maxTeamMembers: 1,
      videoCallHours: 0,
      whatsappIntegration: false,
      aiFeatures: false,
      customBranding: false,
      analytics: 'basic' as const,
      prioritySupport: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    amount: 399900, // ₹3,999
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    // razorpayPlanId: 'plan_yyyyy',
    features: {
      maxClients: 100,
      maxSessions: -1,
      maxTeamMembers: 5,
      videoCallHours: 50,
      whatsappIntegration: true,
      aiFeatures: true,
      customBranding: false,
      analytics: 'advanced' as const,
      prioritySupport: true,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    amount: 799900, // ₹7,999
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    // razorpayPlanId: 'plan_zzzzz',
    features: {
      maxClients: -1, // unlimited
      maxSessions: -1,
      maxTeamMembers: -1, // unlimited
      videoCallHours: 200,
      whatsappIntegration: true,
      aiFeatures: true,
      customBranding: true,
      analytics: 'enterprise' as const,
      prioritySupport: true,
    },
  },
} as const;

export type PlanId = keyof typeof RAZORPAY_PLANS;
export type PlanFeatures = typeof RAZORPAY_PLANS[PlanId]['features'];

export const TRIAL_DAYS = 7;

// Helper to get plan by ID
export const getPlanConfig = (planId: string) => {
  return RAZORPAY_PLANS[planId as PlanId] || RAZORPAY_PLANS.standard;
};

// Helper to check if feature is available in plan
export const hasFeature = (planId: PlanId, feature: keyof PlanFeatures): boolean => {
  const plan = RAZORPAY_PLANS[planId];
  const featureValue = plan.features[feature];

  if (typeof featureValue === 'boolean') return featureValue;
  if (typeof featureValue === 'number') return featureValue > 0 || featureValue === -1;
  return !!featureValue;
};

// Helper to format amount for display
export const formatAmount = (amountInPaise: number): string => {
  return `₹${(amountInPaise / 100).toLocaleString('en-IN')}`;
};
