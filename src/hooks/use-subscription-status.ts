import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/database.types';

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  isTrialExpired: boolean;
  daysUntilTrialExpires: number | null;
  canAccessFeature: (feature: string) => boolean;
}

export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Get user's organization
        const { data: userProfile } = await (supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single() as any);

        if (!userProfile || !userProfile.organization_id) {
          setLoading(false);
          return;
        }

        // Get organization subscription details
        const { data: org } = await (supabase
          .from('organizations')
          .select('subscription_plan, subscription_status, trial_ends_at')
          .eq('id', userProfile.organization_id)
          .single() as any);

        if (!org) {
          setLoading(false);
          return;
        }

        // Calculate trial expiration
        const trialEndsAt = org.trial_ends_at;
        let isTrialExpired = false;
        let daysUntilTrialExpires: number | null = null;

        if (trialEndsAt && org.subscription_status === 'trial') {
          const trialEndDate = new Date(trialEndsAt);
          const now = new Date();
          const diffTime = trialEndDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          isTrialExpired = diffDays <= 0;
          daysUntilTrialExpires = Math.max(0, diffDays);
        }

        // Feature gating helper
        const canAccessFeature = (feature: string): boolean => {
          // Import feature mapping
          const { hasFeature } = require('@/config/pricing');
          return hasFeature(org.subscription_plan as SubscriptionPlan, feature);
        };

        setSubscription({
          plan: org.subscription_plan as SubscriptionPlan,
          status: org.subscription_status as SubscriptionStatus,
          trialEndsAt,
          isTrialExpired,
          daysUntilTrialExpires,
          canAccessFeature,
        });
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();

    // Re-check every hour
    const interval = setInterval(fetchSubscriptionStatus, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { subscription, loading };
}
