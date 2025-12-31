'use client';

import { useRouter } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}: FeatureGateProps) {
  const { subscription, loading } = useSubscriptionStatus();
  const router = useRouter();

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg" />;
  }

  if (!subscription) {
    return null;
  }

  const hasAccess = subscription.canAccessFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Feature not available in current plan
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  // Default upgrade prompt
  return (
    <div className="relative p-6 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute -top-3 -right-3 bg-brand-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
        <Lock className="h-3 w-3" />
        Upgrade Required
      </div>
      <div className="text-center py-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-brand-primary-100 flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-brand-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upgrade to Unlock This Feature
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This feature is available on higher-tier plans. Upgrade now to access it.
        </p>
        <Button
          onClick={() => router.push('/dashboard/billing')}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          View Upgrade Options
        </Button>
      </div>
    </div>
  );
}

// Hook version for conditional logic
export function useFeatureAccess(feature: string): boolean {
  const { subscription } = useSubscriptionStatus();

  if (!subscription) return false;

  return subscription.canAccessFeature(feature);
}
