'use client';

import { usePlanLimits } from '@/hooks/use-plan-limits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, UserPlus, Zap, TrendingUp, Crown } from 'lucide-react';
import Link from 'next/link';

export function UsageStats() {
  const { usage, features, plan } = usePlanLimits();

  const getPercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-orange-600';
    return 'bg-brand-primary-600';
  };

  const clientPercentage = getPercentage(usage.clients, features.maxClients);
  const teamPercentage = getPercentage(usage.teamMembers, features.maxTeamMembers);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Plan Usage</CardTitle>
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary-100 rounded-full">
            <Crown className="h-4 w-4 text-brand-primary-700" />
            <span className="text-sm font-semibold text-brand-primary-700 capitalize">
              {plan} Plan
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clients Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">Clients</span>
            </div>
            <span className={`font-semibold ${getColorClass(clientPercentage)}`}>
              {usage.clients} / {features.maxClients === -1 ? '∞' : features.maxClients}
            </span>
          </div>
          {features.maxClients !== -1 && (
            <div className="space-y-1">
              <Progress value={clientPercentage} className="h-2" indicatorClassName={getProgressColor(clientPercentage)} />
              <p className="text-xs text-gray-500">
                {clientPercentage >= 90 ? (
                  <span className="text-red-600 font-medium">Almost at limit! Consider upgrading.</span>
                ) : clientPercentage >= 75 ? (
                  <span className="text-orange-600 font-medium">You're using most of your client slots</span>
                ) : (
                  `${features.maxClients - usage.clients} slots remaining`
                )}
              </p>
            </div>
          )}
        </div>

        {/* Team Members Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">Team Members</span>
            </div>
            <span className={`font-semibold ${getColorClass(teamPercentage)}`}>
              {usage.teamMembers} / {features.maxTeamMembers === -1 ? '∞' : features.maxTeamMembers}
            </span>
          </div>
          {features.maxTeamMembers !== -1 && (
            <div className="space-y-1">
              <Progress value={teamPercentage} className="h-2" indicatorClassName={getProgressColor(teamPercentage)} />
              <p className="text-xs text-gray-500">
                {teamPercentage >= 90 ? (
                  <span className="text-red-600 font-medium">Team limit almost reached</span>
                ) : teamPercentage >= 75 ? (
                  <span className="text-orange-600 font-medium">Limited team member slots left</span>
                ) : (
                  `${features.maxTeamMembers - usage.teamMembers} slots available`
                )}
              </p>
            </div>
          )}
        </div>

        {/* Premium Features */}
        <div className="pt-4 border-t space-y-3">
          <p className="text-sm font-semibold text-gray-700">Plan Features</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              {features.whatsappIntegration ? (
                <div className="h-2 w-2 rounded-full bg-green-500" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              )}
              <span className={features.whatsappIntegration ? 'text-gray-700' : 'text-gray-400'}>
                WhatsApp Integration
              </span>
            </div>
            <div className="flex items-center gap-2">
              {features.aiFeatures ? (
                <div className="h-2 w-2 rounded-full bg-green-500" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              )}
              <span className={features.aiFeatures ? 'text-gray-700' : 'text-gray-400'}>
                AI Features
              </span>
            </div>
            <div className="flex items-center gap-2">
              {features.advancedAnalytics ? (
                <div className="h-2 w-2 rounded-full bg-green-500" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              )}
              <span className={features.advancedAnalytics ? 'text-gray-700' : 'text-gray-400'}>
                Advanced Analytics
              </span>
            </div>
            <div className="flex items-center gap-2">
              {features.customBranding ? (
                <div className="h-2 w-2 rounded-full bg-green-500" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              )}
              <span className={features.customBranding ? 'text-gray-700' : 'text-gray-400'}>
                Custom Branding
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        {plan !== 'premium' && (clientPercentage >= 75 || teamPercentage >= 75) && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand-primary-50 to-brand-accent-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-brand-primary-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Need more capacity?</p>
                <p className="text-xs text-gray-600">Upgrade to get more clients and team members</p>
              </div>
              <Link href="/dashboard/billing">
                <Button size="sm" variant="default">
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
