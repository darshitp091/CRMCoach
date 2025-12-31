'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Video,
  Brain,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  ArrowUpRight,
  Download,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface UsageResource {
  current: number;
  limit: number | 'unlimited';
  percentage: number;
  status: 'ok' | 'warning' | 'critical' | 'exceeded' | 'unavailable';
  remaining: number | 'unlimited';
}

interface UsageData {
  clients: UsageResource;
  emails: UsageResource;
  sms: UsageResource;
  whatsapp: UsageResource;
  videoMinutes: UsageResource;
  aiSummaries: UsageResource;
  aiInsights: UsageResource;
  transcriptionMinutes: UsageResource;
  storageGB: UsageResource;
}

const RESOURCE_CONFIG = {
  clients: {
    icon: Users,
    name: 'Clients',
    color: 'blue',
    unit: '',
  },
  emails: {
    icon: Mail,
    name: 'Emails',
    color: 'green',
    unit: '',
  },
  sms: {
    icon: MessageSquare,
    name: 'SMS Messages',
    color: 'purple',
    unit: '',
  },
  whatsapp: {
    icon: MessageSquare,
    name: 'WhatsApp Messages',
    color: 'green',
    unit: '',
  },
  videoMinutes: {
    icon: Video,
    name: 'Video Minutes',
    color: 'red',
    unit: ' min',
  },
  aiSummaries: {
    icon: Brain,
    name: 'AI Summaries',
    color: 'indigo',
    unit: '',
  },
  aiInsights: {
    icon: Zap,
    name: 'AI Insights',
    color: 'yellow',
    unit: '',
  },
  transcriptionMinutes: {
    icon: Brain,
    name: 'Transcription',
    color: 'pink',
    unit: ' min',
  },
  storageGB: {
    icon: HardDrive,
    name: 'Storage',
    color: 'gray',
    unit: ' GB',
  },
};

export default function UsagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('');
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [limits, setLimits] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [overageCharges, setOverageCharges] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState('');

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/addons/usage');
      const data = await response.json();

      if (data.success) {
        setPlan(data.plan);
        setUsage(data.analysis);
        setLimits(data.limits);
        setRecommendations(data.recommendations || []);
        setOverageCharges(data.overageCharges || 0);

        // Get current billing period
        const now = new Date();
        setBillingPeriod(now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      } else {
        toast.error(data.message || 'Failed to load usage data');
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
      toast.error('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'exceeded':
        return 'text-red-600';
      case 'critical':
        return 'text-orange-600';
      case 'warning':
        return 'text-yellow-600';
      case 'unavailable':
        return 'text-gray-400';
      default:
        return 'text-green-600';
    }
  };

  const getProgressColor = (status: string): string => {
    switch (status) {
      case 'exceeded':
        return '[&>div]:bg-red-600';
      case 'critical':
        return '[&>div]:bg-orange-600';
      case 'warning':
        return '[&>div]:bg-yellow-600';
      case 'unavailable':
        return '[&>div]:bg-gray-300';
      default:
        return '[&>div]:bg-green-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'unavailable':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan • {billingPeriod}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard/billing')}>
            <Calendar className="mr-2 h-4 w-4" />
            Billing History
          </Button>
          <Button onClick={() => router.push('/dashboard/billing/addons')}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Get Add-Ons
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {recommendations.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="h-5 w-5" />
              Usage Alerts ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{rec.message}</p>
                  {rec.action === 'upgrade_plan' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Consider upgrading to{' '}
                      <span className="font-semibold">{rec.targetPlan}</span> plan
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (rec.action === 'purchase_addon') {
                      router.push('/dashboard/billing/addons');
                    } else if (rec.action === 'upgrade_plan') {
                      router.push('/pricing');
                    }
                  }}
                >
                  {rec.action === 'purchase_addon' ? 'Get Add-On' : 'Upgrade'}
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Overage Charges */}
      {overageCharges > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <h3 className="font-semibold text-red-900">Overage Charges This Month</h3>
              <p className="text-sm text-red-700">You have exceeded your plan limits</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-900">₹{overageCharges.toFixed(2)}</p>
              <p className="text-sm text-red-700">Will be billed at month-end</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usage &&
          Object.entries(usage).map(([key, data]: [string, any]) => {
            const config = RESOURCE_CONFIG[key as keyof typeof RESOURCE_CONFIG];
            if (!config) return null;

            const Icon = config.icon;
            const isUnlimited = data.limit === 'unlimited';
            const isUnavailable = data.status === 'unavailable';

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Object.keys(usage).indexOf(key) * 0.05 }}
              >
                <Card className={isUnavailable ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
                          <Icon className={`h-5 w-5 text-${config.color}-600`} />
                        </div>
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                      </div>
                      {getStatusIcon(data.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className={`text-3xl font-bold ${getStatusColor(data.status)}`}>
                        {data.current.toLocaleString()}
                        {config.unit}
                      </span>
                      <span className="text-sm text-gray-600">
                        of{' '}
                        {isUnlimited
                          ? 'Unlimited'
                          : `${data.limit.toLocaleString()}${config.unit}`}
                      </span>
                    </div>

                    {!isUnlimited && !isUnavailable && (
                      <>
                        <Progress
                          value={Math.min(data.percentage, 100)}
                          className={getProgressColor(data.status)}
                        />

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {data.remaining === 0
                              ? 'Limit reached'
                              : `${data.remaining.toLocaleString()}${config.unit} remaining`}
                          </span>
                          <Badge
                            variant={
                              data.status === 'exceeded' || data.status === 'critical'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {data.percentage}%
                          </Badge>
                        </div>
                      </>
                    )}

                    {isUnavailable && (
                      <div className="text-sm text-gray-500 italic">
                        Not available in your plan. Upgrade to access this feature.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Usage Report</CardTitle>
          <CardDescription>Download your usage data for the current billing period</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => toast.info('Export feature coming soon!')}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
