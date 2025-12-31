'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, X, Sparkles } from 'lucide-react';
import { AuthService } from '@/services/auth.service';

export function TrialBanner() {
  const [show, setShow] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [plan, setPlan] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkTrialStatus = async () => {
      const user = await AuthService.getCurrentUser();

      if (!user?.organization_id) return;

      const { data: org } = await supabase
        .from('organizations')
        .select('subscription_status, subscription_plan, trial_ends_at')
        .eq('id', user.organization_id)
        .single();

      if (org?.subscription_status === 'trial' && org.trial_ends_at) {
        const trialEnd = new Date(org.trial_ends_at);
        const today = new Date();
        const diffTime = trialEnd.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
          setDaysLeft(diffDays);
          setPlan(org.subscription_plan || 'standard');
          setShow(true);
        }
      }
    };

    checkTrialStatus();
  }, []);

  if (!show || dismissed) return null;

  const getBannerColor = () => {
    if (daysLeft <= 1) return 'bg-red-50 border-red-200 text-red-900';
    if (daysLeft <= 3) return 'bg-orange-50 border-orange-200 text-orange-900';
    return 'bg-brand-primary-50 border-brand-primary-200 text-brand-primary-900';
  };

  const getIconColor = () => {
    if (daysLeft <= 1) return 'text-red-600';
    if (daysLeft <= 3) return 'text-orange-600';
    return 'text-brand-primary-600';
  };

  return (
    <div className={`relative border-b ${getBannerColor()}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center h-10 w-10 rounded-full bg-white ${getIconColor()}`}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {daysLeft === 0 ? 'Trial ends today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in your trial`}
              </p>
              <p className="text-xs opacity-80">
                You're on the <span className="font-medium capitalize">{plan}</span> plan trial. Upgrade to continue after trial ends.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/billing">
              <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 shadow-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
