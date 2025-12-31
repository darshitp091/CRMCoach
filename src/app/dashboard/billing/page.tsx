'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  Star,
  ArrowRight,
  Clock,
  X,
  CreditCard,
  Info,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { pricingPlans } from '@/config/pricing';
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';
import { supabase } from '@/lib/supabase/client';

export default function BillingPage() {
  const router = useRouter();
  const { subscription, loading: subscriptionLoading } = useSubscriptionStatus();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [canChangeSub, setCanChangeSub] = useState(false);
  const [canViewBilling, setCanViewBilling] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const canChange = await hasPermission(session.user.id, PERMISSIONS.CHANGE_SUBSCRIPTION);
      const canView = await hasPermission(session.user.id, PERMISSIONS.VIEW_BILLING);

      setCanChangeSub(canChange);
      setCanViewBilling(canView);
      setChecking(false);

      // If user can't even view billing, redirect to dashboard
      if (!canView) {
        router.push('/dashboard');
      }
    };

    checkPermissions();
  }, [router]);

  const handleUpgrade = (planId: string) => {
    if (!canChangeSub) {
      alert('Only the account owner can change subscription plans.');
      return;
    }
    router.push(`/dashboard/billing/checkout?plan=${planId}&cycle=${billingCycle}`);
  };

  if (checking || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-600" />
      </div>
    );
  }

  // If user doesn't have view permission, show access denied
  if (!canViewBilling) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <ShieldAlert className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to view billing information. Please contact your account owner.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'standard';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Billing & Subscription
          </h1>
          <p className="text-lg text-gray-600">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Plan Status */}
        {subscription && (
          <div className="mb-12 p-6 bg-white rounded-xl shadow-sm border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {pricingPlans.find(p => p.id === currentPlan)?.name || 'Standard'}
                </h2>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                subscription.status === 'trial'
                  ? 'bg-yellow-100 text-yellow-700'
                  : subscription.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {subscription.status === 'trial' ? 'Free Trial' : subscription.status.toUpperCase()}
              </div>
            </div>

            {subscription.status === 'trial' && subscription.daysUntilTrialExpires !== null && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {subscription.daysUntilTrialExpires === 0
                    ? 'Trial ends today'
                    : `${subscription.daysUntilTrialExpires} day${subscription.daysUntilTrialExpires > 1 ? 's' : ''} left in trial`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-4 p-2 bg-white rounded-full shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-brand-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-brand-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isUpgrade = pricingPlans.findIndex(p => p.id === plan.id) > pricingPlans.findIndex(p => p.id === currentPlan);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative p-8 rounded-3xl transition-all duration-500 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-brand-primary-600 via-brand-accent-600 to-brand-secondary-600 text-white shadow-2xl scale-105 border-4 border-white'
                    : 'bg-white text-gray-900 shadow-xl border-2 border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-yellow-400 text-yellow-900 text-sm font-bold shadow-lg">
                      <Star className="h-5 w-5 fill-yellow-900" />
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 -right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Current Plan
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-white/90' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className={`text-2xl ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>₹</span>
                    <span className="text-6xl font-bold">
                      {billingCycle === 'yearly'
                        ? Math.round(plan.yearlyPrice / 12)
                        : plan.price}
                    </span>
                    <span className={`text-lg ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      /month
                    </span>
                  </div>

                  {billingCycle === 'yearly' && (
                    <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      Billed ₹{plan.yearlyPrice.toLocaleString('en-IN')} yearly
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 max-h-64 overflow-y-auto">
                  {plan.features.slice(0, 8).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className={`flex-shrink-0 p-1 rounded-full ${plan.popular ? 'bg-white/20' : 'bg-brand-primary-100'}`}>
                          <Check className={`h-4 w-4 ${plan.popular ? 'text-white' : 'text-brand-primary-600'}`} />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 p-1 rounded-full bg-gray-100">
                          <X className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <span className={`text-sm ${plan.popular ? 'text-white/95' : feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  size="lg"
                  className={`w-full text-lg py-6 ${
                    isCurrentPlan
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-white text-brand-primary-600 hover:bg-gray-100 shadow-2xl'
                      : 'bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 text-white hover:shadow-xl'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : isUpgrade ? (
                    <>
                      Upgrade to {plan.name}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Switch to {plan.name}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
          </div>
          <p className="text-sm text-gray-600">
            All payments are securely processed through Razorpay. We accept credit cards, debit cards, UPI, net banking, and digital wallets.
          </p>
        </div>
      </div>
    </div>
  );
}
