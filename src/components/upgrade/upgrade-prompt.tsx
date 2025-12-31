'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

interface UpgradePromptProps {
  title: string;
  description: string;
  feature?: string;
  currentPlan?: string;
  suggestedPlan?: string;
  inline?: boolean;
  dismissible?: boolean;
}

export function UpgradePrompt({
  title,
  description,
  feature,
  currentPlan = 'Standard',
  suggestedPlan = 'Pro',
  inline = false,
  dismissible = false,
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (inline) {
    return (
      <div className="relative p-4 bg-gradient-to-r from-brand-primary-50 to-brand-accent-50 border-2 border-brand-primary-200 rounded-lg">
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-500 flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-700 mb-3">{description}</p>
            <Link href="/dashboard/billing">
              <Button size="sm" className="bg-brand-primary-600 hover:bg-brand-primary-700">
                Upgrade to {suggestedPlan}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Modal/Banner style
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-brand-primary-200 p-6">
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary-500 to-brand-accent-500 flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>

            {feature && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Unlock with {suggestedPlan}:</p>
                <p className="text-sm font-medium text-gray-900">{feature}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/dashboard/billing" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 hover:from-brand-primary-700 hover:to-brand-accent-700">
                  Upgrade Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {dismissible && (
                <Button
                  variant="outline"
                  onClick={() => setDismissed(true)}
                  className="px-4"
                >
                  Later
                </Button>
              )}
            </div>

            <p className="mt-3 text-xs text-center text-gray-500">
              Current plan: <span className="font-medium">{currentPlan}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline limit warning
export function LimitWarning({
  current,
  limit,
  resource,
  onUpgrade,
}: {
  current: number;
  limit: number;
  resource: string;
  onUpgrade?: () => void;
}) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  if (!isNearLimit) return null;

  return (
    <div className={`p-3 rounded-lg border-2 ${
      isAtLimit
        ? 'bg-red-50 border-red-200'
        : 'bg-orange-50 border-orange-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${
          isAtLimit ? 'text-red-900' : 'text-orange-900'
        }`}>
          {isAtLimit ? `${resource} limit reached` : `Approaching ${resource} limit`}
        </p>
        <span className={`text-xs font-semibold ${
          isAtLimit ? 'text-red-700' : 'text-orange-700'
        }`}>
          {current} / {limit}
        </span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all ${
            isAtLimit ? 'bg-red-500' : 'bg-orange-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <Button
        size="sm"
        onClick={onUpgrade}
        className={isAtLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Upgrade for More {resource}
      </Button>
    </div>
  );
}

// Feature locked badge
export function FeatureLockedBadge({ planName }: { planName: string }) {
  return (
    <Link href="/dashboard/billing">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all cursor-pointer">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-900">
          {planName} Only
        </span>
      </div>
    </Link>
  );
}
