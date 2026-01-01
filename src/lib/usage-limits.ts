import { supabase } from './supabase/client';
import { SubscriptionPlan } from '@/types/database.types';
import { pricingPlans } from '@/config/pricing';

// Helper functions for pricing
const getPlanLimits = (plan: SubscriptionPlan) => {
  const planConfig = pricingPlans.find(p => p.id === plan);
  return planConfig || null;
};

const calculateOverageCost = (plan: SubscriptionPlan, limitType: string, overage: number): number => {
  // Define overage costs per resource type
  const overagePricing: Record<string, number> = {
    clients: 99, // ₹99 per 5 extra clients
    emails: 0, // No overage for emails
    sms: 0.10, // ₹0.10 per SMS
    whatsapp: 0.15, // ₹0.15 per WhatsApp message
    video_minutes: 1, // ₹1 per minute
    ai_summaries: 5, // ₹5 per summary
    ai_insights: 5, // ₹5 per insight
    transcription_minutes: 2, // ₹2 per minute
    team_members: 99, // ₹99 per team member
    storage: 50, // ₹50 per GB
  };

  return (overagePricing[limitType] || 0) * overage;
};

export interface UsageCheckResult {
  allowed: boolean;
  limit: number | 'unlimited';
  current: number;
  remaining: number;
  message?: string;
  overageCost?: number;
}

export type UsageLimitType =
  | 'clients'
  | 'emails'
  | 'sms'
  | 'whatsapp'
  | 'video_minutes'
  | 'ai_summaries'
  | 'ai_insights'
  | 'transcription_minutes'
  | 'storage'
  | 'team_members';

/**
 * Check if organization can perform an action based on usage limits
 */
export async function checkUsageLimit(
  organizationId: string,
  limitType: UsageLimitType,
  requestedAmount: number = 1
): Promise<UsageCheckResult> {
  try {
    // Get organization plan
    const { data: org, error: orgError } = await (supabase
      .from('organizations')
      .select('subscription_plan, subscription_status')
      .eq('id', organizationId)
      .single() as any);

    if (orgError || !org) {
      return {
        allowed: false,
        limit: 0,
        current: 0,
        remaining: 0,
        message: 'Organization not found',
      };
    }

    // Check if subscription is active
    if (org.subscription_status !== 'active' && org.subscription_status !== 'trial') {
      return {
        allowed: false,
        limit: 0,
        current: 0,
        remaining: 0,
        message: 'Subscription inactive. Please update your payment method.',
      };
    }

    const plan = org.subscription_plan as SubscriptionPlan;
    const limits = getPlanLimits(plan);

    if (!limits) {
      return {
        allowed: false,
        limit: 0,
        current: 0,
        remaining: 0,
        message: 'Invalid subscription plan',
      };
    }

    // Get current usage from database
    const currentUsage = await getCurrentUsage(organizationId, limitType);

    // Get limit for this resource type
    const planLimit = getLimitValue(limits, limitType);

    // Check if unlimited
    if (planLimit === 'unlimited') {
      // Check fair use policy for Premium
      if (plan === 'premium') {
        const fairUseLimit = getFairUseLimit(limitType);
        if (fairUseLimit && currentUsage > fairUseLimit) {
          return {
            allowed: false,
            limit: fairUseLimit,
            current: currentUsage,
            remaining: 0,
            message: `Fair use limit exceeded (${fairUseLimit}). Please contact support.`,
          };
        }
      }

      return {
        allowed: true,
        limit: 'unlimited',
        current: currentUsage,
        remaining: -1,
      };
    }

    // Check if feature is not available (limit = 0)
    if (planLimit === 0) {
      return {
        allowed: false,
        limit: 0,
        current: currentUsage,
        remaining: 0,
        message: `${getLimitDisplayName(limitType)} is not available in your plan. Please upgrade to access this feature.`,
      };
    }

    // Calculate remaining
    const remaining = planLimit - currentUsage;

    // Check if limit exceeded
    if (remaining < requestedAmount) {
      const overage = requestedAmount - remaining;
      const overageCost = calculateOverageCost(plan, limitType as any, overage);

      return {
        allowed: false,
        limit: planLimit,
        current: currentUsage,
        remaining: Math.max(0, remaining),
        message: `Usage limit exceeded. ${currentUsage}/${planLimit} ${getLimitDisplayName(limitType)} used. ${
          overageCost > 0
            ? `Purchase add-ons for ₹${overageCost} or upgrade your plan.`
            : 'Please upgrade your plan.'
        }`,
        overageCost,
      };
    }

    // Within limit
    return {
      allowed: true,
      limit: planLimit,
      current: currentUsage,
      remaining,
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      allowed: false,
      limit: 0,
      current: 0,
      remaining: 0,
      message: 'Error checking usage limits',
    };
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  organizationId: string,
  usageType: UsageLimitType,
  amount: number = 1,
  metadata?: any
): Promise<void> {
  try {
    // Map limitType to database usage_type
    const dbUsageType = mapLimitTypeToDbType(usageType);

    // Call database function to increment usage
    const { error } = await (supabase as any).rpc('increment_usage', {
      org_id: organizationId,
      usage_type: dbUsageType,
      amount,
    });

    if (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }

    // Check if we should send usage alerts
    await checkAndSendUsageAlerts(organizationId, usageType);
  } catch (error) {
    console.error('Error in incrementUsage:', error);
    // Don't throw - we don't want to block the user action
  }
}

/**
 * Track cost event (internal use)
 */
export async function trackCost(
  organizationId: string,
  costType: string,
  quantity: number,
  unitCost: number,
  metadata?: any
): Promise<void> {
  try {
    await (supabase as any).rpc('track_cost', {
      org_id: organizationId,
      cost_type_param: costType,
      quantity_param: quantity,
      unit_cost_param: unitCost,
      metadata_param: metadata || {},
    });

    // Check if cost thresholds exceeded
    await checkCostThresholds(organizationId);
  } catch (error) {
    console.error('Error tracking cost:', error);
  }
}

/**
 * Get current usage from database
 */
async function getCurrentUsage(
  organizationId: string,
  limitType: UsageLimitType
): Promise<number> {
  try {
    // Get current billing period
    const now = new Date();
    const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    // Get usage record
    const { data, error } = await (supabase
      .from('organization_usage')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('billing_period', billingPeriod)
      .single() as any);

    if (error || !data) {
      return 0;
    }

    // Map limitType to database column
    switch (limitType) {
      case 'clients':
        return data.active_clients_count || 0;
      case 'emails':
        return data.emails_sent || 0;
      case 'sms':
        return data.sms_sent || 0;
      case 'whatsapp':
        return data.whatsapp_sent || 0;
      case 'video_minutes':
        return data.video_participants_minutes || 0;
      case 'ai_summaries':
        return data.ai_summaries_generated || 0;
      case 'ai_insights':
        return data.ai_insights_generated || 0;
      case 'transcription_minutes':
        return data.transcription_minutes_used || 0;
      case 'team_members':
        return data.team_members_count || 0;
      case 'storage':
        return Math.round((data.storage_used_bytes || 0) / (1024 * 1024 * 1024)); // Convert to GB
      default:
        return 0;
    }
  } catch (error) {
    console.error('Error getting current usage:', error);
    return 0;
  }
}

/**
 * Helper to get limit value from plan limits
 */
function getLimitValue(limits: any, limitType: UsageLimitType): number | 'unlimited' {
  switch (limitType) {
    case 'clients':
      return limits.clients === 'unlimited' ? 'unlimited' : limits.clients;
    case 'emails':
      return limits.emailsPerMonth === 'unlimited' ? 'unlimited' : limits.emailsPerMonth;
    case 'sms':
      return limits.smsPerMonth === 'unlimited' ? 'unlimited' : limits.smsPerMonth;
    case 'whatsapp':
      return limits.whatsappPerMonth === 'unlimited' ? 'unlimited' : limits.whatsappPerMonth;
    case 'video_minutes':
      return limits.videoMinutesPerMonth === 'unlimited' ? 'unlimited' : limits.videoMinutesPerMonth;
    case 'ai_summaries':
      return limits.aiSummariesPerMonth === 'unlimited' ? 'unlimited' : limits.aiSummariesPerMonth;
    case 'ai_insights':
      return limits.aiInsightsPerMonth === 'unlimited' ? 'unlimited' : limits.aiInsightsPerMonth;
    case 'transcription_minutes':
      return limits.transcriptionHoursPerMonth === 'unlimited' ? 'unlimited' : limits.transcriptionHoursPerMonth * 60;
    case 'team_members':
      return limits.teamMembers === 'unlimited' ? 'unlimited' : limits.teamMembers;
    case 'storage':
      return parseInt(limits.storage.split(' ')[0]) || 0; // Parse "5 GB" -> 5
    default:
      return 0;
  }
}

/**
 * Fair use limits for Premium "unlimited" features
 */
function getFairUseLimit(limitType: UsageLimitType): number | null {
  switch (limitType) {
    case 'clients':
      return 500;
    case 'ai_summaries':
      return 300;
    case 'team_members':
      return 20;
    default:
      return null;
  }
}

/**
 * Map limit type to database usage type
 */
function mapLimitTypeToDbType(limitType: UsageLimitType): string {
  switch (limitType) {
    case 'emails':
      return 'email';
    case 'sms':
      return 'sms';
    case 'whatsapp':
      return 'whatsapp';
    case 'video_minutes':
      return 'video_participant_minutes';
    case 'ai_summaries':
      return 'ai_summary';
    case 'ai_insights':
      return 'ai_insight';
    case 'transcription_minutes':
      return 'transcription_minutes';
    default:
      return limitType;
  }
}

/**
 * Get display name for limit type
 */
function getLimitDisplayName(limitType: UsageLimitType): string {
  switch (limitType) {
    case 'clients':
      return 'clients';
    case 'emails':
      return 'emails';
    case 'sms':
      return 'SMS messages';
    case 'whatsapp':
      return 'WhatsApp messages';
    case 'video_minutes':
      return 'video minutes';
    case 'ai_summaries':
      return 'AI summaries';
    case 'ai_insights':
      return 'AI insights';
    case 'transcription_minutes':
      return 'transcription minutes';
    case 'team_members':
      return 'team members';
    case 'storage':
      return 'storage (GB)';
    default:
      return limitType;
  }
}

/**
 * Check and send usage alerts (80%, 90%, 100%)
 */
async function checkAndSendUsageAlerts(
  organizationId: string,
  limitType: UsageLimitType
): Promise<void> {
  try {
    const usage = await checkUsageLimit(organizationId, limitType);

    if (usage.limit === 'unlimited' || usage.limit === 0) return;

    const percentage = (usage.current / usage.limit) * 100;

    // Send alerts at 80%, 90%, 100%
    if (percentage >= 80 && percentage < 90) {
      await sendUsageAlert(organizationId, limitType, usage, 'warning', 80);
    } else if (percentage >= 90 && percentage < 100) {
      await sendUsageAlert(organizationId, limitType, usage, 'warning', 90);
    } else if (percentage >= 100) {
      await sendUsageAlert(organizationId, limitType, usage, 'critical', 100);
    }
  } catch (error) {
    console.error('Error checking usage alerts:', error);
  }
}

/**
 * Send usage alert
 */
async function sendUsageAlert(
  organizationId: string,
  limitType: UsageLimitType,
  usage: UsageCheckResult,
  severity: 'info' | 'warning' | 'critical',
  percentage: number
): Promise<void> {
  const message = `You've used ${percentage}% of your ${getLimitDisplayName(limitType)} limit (${usage.current}/${usage.limit}). ${
    percentage >= 100 ? 'Upgrade or purchase add-ons to continue.' : 'Consider upgrading to avoid interruption.'
  }`;

  await (supabase.from('usage_alerts') as any).insert({
    organization_id: organizationId,
    alert_type: 'usage_warning',
    resource_type: limitType,
    current_usage: usage.current,
    limit_value: typeof usage.limit === 'number' ? usage.limit : 999999,
    usage_percentage: percentage,
    message,
    severity,
  });

  // TODO: Send email/notification to organization admin
}

/**
 * Check cost thresholds and take action
 */
async function checkCostThresholds(organizationId: string): Promise<void> {
  try {
    // Get organization plan
    const { data: org } = await supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', organizationId)
      .single();

    if (!org) return;

    // Get current usage and costs
    const now = new Date();
    const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const { data: usage } = await (supabase
      .from('organization_usage')
      .select('estimated_monthly_cost, actual_cost_to_date')
      .eq('organization_id', organizationId)
      .eq('billing_period', billingPeriod)
      .single() as any);

    if (!usage) return;

    const expectedCost = usage.estimated_monthly_cost || 0;
    const actualCost = usage.actual_cost_to_date || 0;

    if (expectedCost === 0) return;

    const costRatio = actualCost / expectedCost;

    // 300% - Suspend account
    if (costRatio >= 3.0) {
      // TODO: Suspend account, notify admin
      console.warn(`Account ${organizationId} exceeds 300% cost threshold - should be suspended`);
    }
    // 200% - Throttle
    else if (costRatio >= 2.0) {
      // TODO: Throttle features (lower video quality, limit AI requests)
      console.warn(`Account ${organizationId} exceeds 200% cost threshold - should be throttled`);
    }
    // 150% - Notify
    else if (costRatio >= 1.5) {
      // TODO: Send notification to customer
      console.info(`Account ${organizationId} at 150% cost threshold - notifying customer`);
    }
  } catch (error) {
    console.error('Error checking cost thresholds:', error);
  }
}

/**
 * Get usage summary for organization
 */
export async function getUsageSummary(organizationId: string) {
  try {
    const now = new Date();
    const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const { data, error } = await (supabase
      .from('organization_usage')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('billing_period', billingPeriod)
      .single() as any);

    if (error || !data) {
      return null;
    }

    return {
      billingPeriod: data.billing_period,
      clients: data.active_clients_count,
      sessions: data.sessions_count,
      emails: data.emails_sent,
      sms: data.sms_sent,
      whatsapp: data.whatsapp_sent,
      videoMinutes: data.video_participants_minutes,
      aiSummaries: data.ai_summaries_generated,
      aiInsights: data.ai_insights_generated,
      transcriptionMinutes: data.transcription_minutes_used,
      storageGB: Math.round((data.storage_used_bytes || 0) / (1024 * 1024 * 1024) * 10) / 10,
      overageCharges: data.overage_charges,
    };
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return null;
  }
}
