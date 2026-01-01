'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  TrendingUp,
  Package,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UsageData {
  resource: string;
  current: number;
  limit: number | 'unlimited';
  percentage: number;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
}

export function UsageWidget() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/addons/usage');
      const data = await response.json();

      if (data.success) {
        setUsage(data.analysis);
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  // Get top 3 resources by usage percentage
  const topResources = Object.entries(usage)
    .filter(([_, data]: [string, any]) => data.limit !== 'unlimited' && data.limit !== 0)
    .sort((a: any, b: any) => b[1].percentage - a[1].percentage)
    .slice(0, 3);

  const hasWarnings = recommendations.length > 0;

  return (
    <Card className={hasWarnings ? 'border-yellow-300 bg-yellow-50/50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary-600" />
            Resource Usage
          </CardTitle>
          {hasWarnings && (
            <Badge variant="danger">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {recommendations.length} Alert{recommendations.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Top Resources */}
        {topResources.map(([resource, data]: [string, any]) => (
          <div key={resource} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize">
                {resource.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className={getStatusColor(data.status)}>
                {data.current} / {data.limit}
              </span>
            </div>
            <Progress
              value={Math.min(data.percentage, 100)}
              className={getProgressColor(data.status)}
            />
          </div>
        ))}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {recommendations.slice(0, 2).map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-white rounded-lg text-sm"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{rec.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push('/dashboard/billing')}
          >
            View Details
          </Button>
          {hasWarnings && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => router.push('/dashboard/billing/addons')}
            >
              <Package className="mr-2 h-4 w-4" />
              Get Add-Ons
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'exceeded':
      return 'text-red-600 font-semibold';
    case 'critical':
      return 'text-orange-600 font-semibold';
    case 'warning':
      return 'text-yellow-600 font-medium';
    default:
      return 'text-gray-600';
  }
}

function getProgressColor(status: string): string {
  switch (status) {
    case 'exceeded':
      return '[&>div]:bg-red-600';
    case 'critical':
      return '[&>div]:bg-orange-600';
    case 'warning':
      return '[&>div]:bg-yellow-600';
    default:
      return '[&>div]:bg-brand-primary-600';
  }
}
