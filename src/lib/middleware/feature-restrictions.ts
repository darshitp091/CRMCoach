import { supabase } from '@/lib/supabase/client';
import { RAZORPAY_PLANS, PlanId, PlanFeatures } from '@/lib/razorpay/config';

export interface FeatureCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
  upgradeRequired?: boolean;
}

/**
 * Check if a feature is available for the user's plan
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof PlanFeatures
): Promise<FeatureCheckResult> {
  try {
    // Get user's organization and plan
    const { data: user } = await (supabase
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single() as any);

    if (!user || !user.organization_id) {
      return { allowed: false, reason: 'No organization found' };
    }

    const { data: org } = await (supabase
      .from('organizations')
      .select('subscription_plan, subscription_status')
      .eq('id', user.organization_id)
      .single() as any);

    if (!org) {
      return { allowed: false, reason: 'Organization not found' };
    }

    // Check subscription status
    if (!['active', 'trialing', 'trial'].includes(org.subscription_status || '')) {
      return {
        allowed: false,
        reason: 'Subscription is not active',
        upgradeRequired: true,
      };
    }

    const planId = (org.subscription_plan || 'standard') as PlanId;
    const plan = RAZORPAY_PLANS[planId];
    const featureValue = plan.features[feature];

    // Handle boolean features
    if (typeof featureValue === 'boolean') {
      return {
        allowed: featureValue,
        reason: featureValue ? undefined : 'Feature not available in current plan',
        upgradeRequired: !featureValue,
      };
    }

    // Handle numeric features (limits)
    if (typeof featureValue === 'number') {
      if (featureValue === -1) {
        // Unlimited
        return { allowed: true };
      }

      return {
        allowed: true,
        limit: featureValue,
      };
    }

    // Handle string features (like analytics level)
    return { allowed: !!featureValue };
  } catch (error) {
    console.error('Feature check error:', error);
    return { allowed: false, reason: 'Error checking feature access' };
  }
}

/**
 * Check if user can add more clients
 */
export async function checkClientLimit(organizationId: string): Promise<FeatureCheckResult> {
  try {
    const { data: org } = await (supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', organizationId)
      .single() as any);

    if (!org) {
      return { allowed: false, reason: 'Organization not found' };
    }

    const planId = (org.subscription_plan || 'standard') as PlanId;
    const plan = RAZORPAY_PLANS[planId];
    const maxClients = plan.features.maxClients;

    // Unlimited clients
    if (maxClients === -1) {
      return { allowed: true };
    }

    // Count current clients
    const { count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('deleted_at', null);

    const currentClients = count || 0;

    if (currentClients >= maxClients) {
      return {
        allowed: false,
        reason: `Client limit reached. Upgrade to add more clients.`,
        limit: maxClients,
        current: currentClients,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit: maxClients,
      current: currentClients,
    };
  } catch (error) {
    console.error('Client limit check error:', error);
    return { allowed: false, reason: 'Error checking client limit' };
  }
}

/**
 * Check if user can add more team members
 */
export async function checkTeamMemberLimit(organizationId: string): Promise<FeatureCheckResult> {
  try {
    const { data: org } = await (supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', organizationId)
      .single() as any);

    if (!org) {
      return { allowed: false, reason: 'Organization not found' };
    }

    const planId = (org.subscription_plan || 'standard') as PlanId;
    const plan = RAZORPAY_PLANS[planId];
    const maxTeamMembers = plan.features.maxTeamMembers;

    // Unlimited team members
    if (maxTeamMembers === -1) {
      return { allowed: true };
    }

    // Count current team members
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    const currentMembers = count || 0;

    if (currentMembers >= maxTeamMembers) {
      return {
        allowed: false,
        reason: `Team member limit reached. Upgrade to add more members.`,
        limit: maxTeamMembers,
        current: currentMembers,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      limit: maxTeamMembers,
      current: currentMembers,
    };
  } catch (error) {
    console.error('Team member limit check error:', error);
    return { allowed: false, reason: 'Error checking team member limit' };
  }
}

/**
 * Check video call hours limit
 */
export async function checkVideoCallLimit(organizationId: string): Promise<FeatureCheckResult> {
  try {
    const { data: org } = await (supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', organizationId)
      .single() as any);

    if (!org) {
      return { allowed: false, reason: 'Organization not found' };
    }

    const planId = (org.subscription_plan || 'standard') as PlanId;
    const plan = RAZORPAY_PLANS[planId];
    const maxHours = plan.features.videoCallHours;

    if (maxHours === 0) {
      return {
        allowed: false,
        reason: 'Video calls not available in current plan',
        upgradeRequired: true,
      };
    }

    if (typeof maxHours === 'number' && maxHours < 0) {
      return { allowed: true };
    }

    // TODO: Track actual video call usage
    // For now, just return the limit
    return {
      allowed: true,
      limit: maxHours,
      current: 0, // Replace with actual usage tracking
    };
  } catch (error) {
    console.error('Video call limit check error:', error);
    return { allowed: false, reason: 'Error checking video call limit' };
  }
}

/**
 * Get user's current plan details
 */
export async function getUserPlanDetails(userId: string) {
  try {
    const { data: user } = await (supabase
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single() as any);

    if (!user || !user.organization_id) {
      return null;
    }

    const { data: org } = await (supabase
      .from('organizations')
      .select('subscription_plan, subscription_status, trial_ends_at')
      .eq('id', user.organization_id)
      .single() as any);

    if (!org) {
      return null;
    }

    const planId = (org.subscription_plan || 'standard') as PlanId;
    const plan = RAZORPAY_PLANS[planId];

    return {
      planId,
      planName: plan.name,
      status: org.subscription_status,
      trialEndsAt: org.trial_ends_at,
      features: plan.features,
    };
  } catch (error) {
    console.error('Get plan details error:', error);
    return null;
  }
}
