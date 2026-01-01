'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Download,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import { usePlanLimits } from '@/hooks/use-plan-limits';
import { UpgradePrompt } from '@/components/upgrade/upgrade-prompt';
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalClients: number;
  clientGrowth: number;
  totalSessions: number;
  sessionGrowth: number;
  completionRate: number;
  averageSessionValue: number;
  revenueByMonth: { month: string; revenue: number }[];
  sessionsByStatus: { status: string; count: number }[];
  clientsByStatus: { status: string; count: number }[];
  topPrograms: { name: string; revenue: number; enrollments: number }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { hasFeature } = usePlanLimits();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalClients: 0,
    clientGrowth: 0,
    totalSessions: 0,
    sessionGrowth: 0,
    completionRate: 0,
    averageSessionValue: 0,
    revenueByMonth: [],
    sessionsByStatus: [],
    clientsByStatus: [],
    topPrograms: [],
  });

  useEffect(() => {
    const init = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      if (currentUser?.organization_id) {
        await fetchAnalytics(currentUser.organization_id, timeRange);
      }

      setLoading(false);
    };

    init();
  }, [timeRange]);

  const fetchAnalytics = async (organizationId: string, range: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch revenue data
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, paid_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'completed')
      .gte('paid_at', startDate.toISOString());

    const totalRevenue = payments?.reduce((sum, p) => sum + ((p as any).amount || 0), 0) || 0;

    // Fetch clients data
    const { data: clients } = await supabase
      .from('clients')
      .select('id, status, created_at')
      .eq('organization_id', organizationId)
      .is('deleted_at', null);

    const newClients = clients?.filter(
      (c: any) => new Date(c.created_at) >= startDate
    ).length || 0;

    // Fetch sessions data
    const { data: sessions } = await supabase
      .from('sessions')
      .select('status, scheduled_at')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .gte('scheduled_at', startDate.toISOString());

    const completedSessions = sessions?.filter((s: any) => s.status === 'completed').length || 0;
    const totalSessions = sessions?.length || 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Revenue by month
    const revenueByMonth: { [key: string]: number } = {};
    payments?.forEach((payment: any) => {
      const month = new Date(payment.paid_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (payment.amount || 0);
    });

    // Sessions by status
    const sessionsByStatus: { [key: string]: number } = {};
    sessions?.forEach((session: any) => {
      sessionsByStatus[session.status] = (sessionsByStatus[session.status] || 0) + 1;
    });

    // Clients by status
    const clientsByStatus: { [key: string]: number } = {};
    clients?.forEach((client: any) => {
      clientsByStatus[client.status] = (clientsByStatus[client.status] || 0) + 1;
    });

    // Fetch programs
    const { data: programs } = await supabase
      .from('programs')
      .select('id, name, price')
      .eq('organization_id', organizationId)
      .is('deleted_at', null);

    // Get enrollment counts for each program
    const topPrograms = await Promise.all(
      (programs || []).map(async (program: any) => {
        const { count } = await supabase
          .from('client_programs')
          .select('*', { count: 'exact', head: true })
          .eq('program_id', program.id)
          .eq('status', 'active');

        return {
          name: program.name,
          revenue: (program.price || 0) * (count || 0),
          enrollments: count || 0,
        };
      })
    );

    setAnalytics({
      totalRevenue,
      revenueGrowth: 12.5, // Mock data
      totalClients: clients?.length || 0,
      clientGrowth: ((newClients / (clients?.length || 1)) * 100),
      totalSessions,
      sessionGrowth: 8.3, // Mock data
      completionRate,
      averageSessionValue: totalRevenue / (completedSessions || 1),
      revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month,
        revenue,
      })),
      sessionsByStatus: Object.entries(sessionsByStatus).map(([status, count]) => ({
        status,
        count,
      })),
      clientsByStatus: Object.entries(clientsByStatus).map(([status, count]) => ({
        status,
        count,
      })),
      topPrograms: topPrograms.sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    });
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    const csvContent = `Analytics Report\nTime Range: ${timeRange}\n\nRevenue: ${formatCurrency(
      analytics.totalRevenue
    )}\nClients: ${analytics.totalClients}\nSessions: ${analytics.totalSessions}\nCompletion Rate: ${
      analytics.completionRate.toFixed(1)
    }%\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="spinner h-12 w-12" />
      </div>
    );
  }

  // Check if user has access to analytics
  const hasAnalytics = hasFeature('analytics');

  if (!hasAnalytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your coaching business performance and growth
          </p>
        </div>
        <UpgradePrompt
          title="Unlock Advanced Analytics"
          description="Get detailed insights into your coaching business with advanced analytics, custom reports, and data exports. Available on Pro and Premium plans."
          suggestedPlan="Pro"
          feature="Advanced Analytics"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 opacity-50 pointer-events-none blur-sm">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-2 text-3xl font-bold">₹0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Clients</p>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-2 text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your coaching business performance and growth
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="w-32"
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' },
            ]}
          />
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{analytics.revenueGrowth.toFixed(1)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClients}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{analytics.clientGrowth.toFixed(1)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{analytics.sessionGrowth.toFixed(1)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. session value: {formatCurrency(analytics.averageSessionValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLine data={analytics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                />
              </RechartsLine>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sessions by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={analytics.sessionsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                >
                  {analytics.sessionsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Client Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBar data={analytics.clientsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </RechartsBar>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Programs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Programs by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPrograms.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No program data available
                </p>
              ) : (
                analytics.topPrograms.map((program, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{program.name}</div>
                      <div className="text-xs text-gray-500">
                        {program.enrollments} enrollments
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(program.revenue)}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-brand-primary-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (program.revenue / analytics.topPrograms[0].revenue) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            AI-Powered Insights (Coming Soon)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
              <div>
                <div className="font-medium text-sm">Peak Performance Times</div>
                <p className="text-xs text-gray-600">
                  Your session completion rate is 15% higher on Tuesday and Thursday afternoons
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <div>
                <div className="font-medium text-sm">Client Engagement Alert</div>
                <p className="text-xs text-gray-600">
                  3 clients haven't scheduled a session in 30+ days - consider sending a check-in
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div>
                <div className="font-medium text-sm">Revenue Opportunity</div>
                <p className="text-xs text-gray-600">
                  Your "Transformation Program" has 90% enrollment rate - consider increasing capacity
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
