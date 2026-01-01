import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getUsageSummary } from '@/lib/usage-limits';
import { getPlanLimits } from '@/config/pricing';

/**
 * GET /api/addons/usage
 * Get usage summary and add-on recommendations
 */
export async function GET(req: NextRequest) {
  try {
    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single() as any);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { data: org, error: orgError } = await (supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', user.organization_id)
      .single() as any);

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get usage summary from organization_usage table
    const usageSummary = await getUsageSummary(user.organization_id);

    // Get plan limits
    const planLimits = getPlanLimits(org.subscription_plan);

    // Get active add-ons
    const { data: activeAddons, error: addonsError } = await ((supabase as any)
      .rpc('get_addon_usage_summary', { org_id: user.organization_id }));

    if (addonsError) {
      console.error('Error fetching add-on usage:', addonsError);
    }

    // Calculate usage percentages and recommendations
    const usageAnalysis = {
      clients: calculateUsage(usageSummary?.clients || 0, planLimits?.clients),
      emails: calculateUsage(usageSummary?.emails || 0, planLimits?.emailsPerMonth),
      sms: calculateUsage(usageSummary?.sms || 0, planLimits?.smsPerMonth),
      whatsapp: calculateUsage(usageSummary?.whatsapp || 0, planLimits?.whatsappPerMonth),
      videoMinutes: calculateUsage(usageSummary?.videoMinutes || 0, planLimits?.videoMinutesPerMonth),
      aiSummaries: calculateUsage(usageSummary?.aiSummaries || 0, planLimits?.aiSummariesPerMonth),
      aiInsights: calculateUsage(usageSummary?.aiInsights || 0, planLimits?.aiInsightsPerMonth),
      transcriptionMinutes: calculateUsage(
        usageSummary?.transcriptionMinutes || 0,
        planLimits?.transcriptionHoursPerMonth === 'unlimited'
          ? 'unlimited'
          : (planLimits?.transcriptionHoursPerMonth || 0) * 60
      ),
      storageGB: calculateUsage(
        usageSummary?.storageGB || 0,
        typeof planLimits?.storage === 'string'
          ? parseInt(planLimits.storage.split(' ')[0])
          : planLimits?.storage
      ),
    };

    // Generate recommendations
    const recommendations = generateRecommendations(usageAnalysis, org.subscription_plan);

    return NextResponse.json({
      success: true,
      plan: org.subscription_plan,
      usage: usageSummary,
      limits: planLimits,
      analysis: usageAnalysis,
      activeAddons: activeAddons || [],
      recommendations,
      overageCharges: usageSummary?.overageCharges || 0,
    });
  } catch (error: any) {
    console.error('Error in GET /api/addons/usage:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Calculate usage percentage and status
 */
function calculateUsage(current: number, limit: number | 'unlimited' | undefined) {
  if (!limit || limit === 'unlimited') {
    return {
      current,
      limit: 'unlimited',
      remaining: 'unlimited',
      percentage: 0,
      status: 'ok',
    };
  }

  if (limit === 0) {
    return {
      current,
      limit: 0,
      remaining: 0,
      percentage: 100,
      status: 'unavailable',
    };
  }

  const percentage = (current / limit) * 100;
  const remaining = Math.max(0, limit - current);

  return {
    current,
    limit,
    remaining,
    percentage: Math.round(percentage),
    status:
      percentage >= 100
        ? 'exceeded'
        : percentage >= 90
        ? 'critical'
        : percentage >= 80
        ? 'warning'
        : 'ok',
  };
}

/**
 * Helper: Generate add-on recommendations
 */
function generateRecommendations(analysis: any, plan: string) {
  const recommendations = [];

  // Check each resource type
  Object.entries(analysis).forEach(([resource, data]: [string, any]) => {
    if (data.status === 'exceeded' || data.status === 'critical') {
      recommendations.push({
        resource,
        severity: data.status,
        message: `You're at ${data.percentage}% of your ${resource} limit`,
        action: 'purchase_addon',
        addonType: mapResourceToAddonType(resource),
      });
    } else if (data.status === 'warning') {
      recommendations.push({
        resource,
        severity: 'warning',
        message: `You're approaching your ${resource} limit (${data.percentage}%)`,
        action: 'consider_addon',
        addonType: mapResourceToAddonType(resource),
      });
    }
  });

  // Recommend upgrade if multiple resources are high
  const criticalCount = Object.values(analysis).filter(
    (d: any) => d.status === 'exceeded' || d.status === 'critical'
  ).length;

  if (criticalCount >= 3 && plan !== 'premium') {
    recommendations.push({
      resource: 'multiple',
      severity: 'critical',
      message: `Multiple resources are near or over limits. Consider upgrading to ${plan === 'standard' ? 'Pro' : 'Premium'} plan.`,
      action: 'upgrade_plan',
      targetPlan: plan === 'standard' ? 'pro' : 'premium',
    });
  }

  return recommendations;
}

/**
 * Helper: Map resource name to add-on type
 */
function mapResourceToAddonType(resource: string): string {
  const mapping: Record<string, string> = {
    clients: 'clients',
    emails: 'emails',
    sms: 'sms',
    whatsapp: 'whatsapp',
    videoMinutes: 'video',
    aiSummaries: 'ai_summaries',
    transcriptionMinutes: 'transcription',
    storageGB: 'storage',
  };
  return mapping[resource] || resource;
}
