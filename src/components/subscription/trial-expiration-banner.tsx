'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';

export function TrialExpirationBanner() {
  const { subscription, loading } = useSubscriptionStatus();
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (loading || !subscription || dismissed) return null;

  // Only show for trial subscriptions
  if (subscription.status !== 'trial') return null;

  const { isTrialExpired, daysUntilTrialExpires } = subscription;

  // Trial expired - show blocking message
  if (isTrialExpired) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Trial Has Ended
            </h2>
            <p className="text-gray-600 mb-6">
              Your 7-day free trial has expired. Upgrade to a paid plan to continue using CoachCRM and access all your data.
            </p>
            <Button
              onClick={() => router.push('/dashboard/billing')}
              className="w-full mb-3"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Upgrade Now
            </Button>
            <Button
              onClick={() => router.push('/pricing')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              View Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Trial expiring soon - show warning banner
  if (daysUntilTrialExpires !== null && daysUntilTrialExpires <= 3) {
    return (
      <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {daysUntilTrialExpires === 0 ? (
                  <>Your trial ends <span className="font-bold text-yellow-600">today</span>. Upgrade now to keep your data.</>
                ) : daysUntilTrialExpires === 1 ? (
                  <>Your trial ends in <span className="font-bold text-yellow-600">1 day</span>. Upgrade to continue using CoachCRM.</>
                ) : (
                  <>Your trial ends in <span className="font-bold text-yellow-600">{daysUntilTrialExpires} days</span>. Upgrade to unlock full access.</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push('/dashboard/billing')}
                size="sm"
                className="flex-shrink-0"
              >
                Upgrade Now
              </Button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
