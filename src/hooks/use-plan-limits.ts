'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import { supabase } from '@/lib/supabase/client';
import { RAZORPAY_PLANS, PlanId } from '@/lib/razorpay/config';

export function usePlanLimits() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanId>('standard');
  const [features, setFeatures] = useState(RAZORPAY_PLANS.standard.features);
  const [usage, setUsage] = useState({
    clients: 0,
    teamMembers: 0,
    videoHours: 0,
  });

  useEffect(() => {
    loadPlanData();
  }, []);

  const loadPlanData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user?.organization_id) {
        setLoading(false);
        return;
      }

      // Get organization plan
      const { data: org } = await supabase
        .from('organizations')
        .select('subscription_plan')
        .eq('id', user.organization_id)
        .single();

      if (org) {
        const planId = (org.subscription_plan || 'standard') as PlanId;
        setPlan(planId);
        setFeatures(RAZORPAY_PLANS[planId].features);

        // Get usage counts
        const [clientsResult, membersResult] = await Promise.all([
          supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', user.organization_id)
            .is('deleted_at', null),
          supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', user.organization_id),
        ]);

        setUsage({
          clients: clientsResult.count || 0,
          teamMembers: membersResult.count || 0,
          videoHours: 0, // TODO: Track actual usage
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Load plan data error:', error);
      setLoading(false);
    }
  };

  const canAddClient = () => {
    if (features.maxClients === -1) return { allowed: true };
    return {
      allowed: usage.clients < features.maxClients,
      current: usage.clients,
      limit: features.maxClients,
    };
  };

  const canAddTeamMember = () => {
    if (features.maxTeamMembers === -1) return { allowed: true };
    return {
      allowed: usage.teamMembers < features.maxTeamMembers,
      current: usage.teamMembers,
      limit: features.maxTeamMembers,
    };
  };

  const hasFeature = (feature: keyof typeof features) => {
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0 || value === -1;
    return !!value;
  };

  return {
    loading,
    plan,
    planName: RAZORPAY_PLANS[plan].name,
    features,
    usage,
    canAddClient,
    canAddTeamMember,
    hasFeature,
    refresh: loadPlanData,
  };
}
