'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { SessionService } from '@/services/session.service';
import { ClientService } from '@/services/client.service';
import { useRealtimeDashboard } from '@/lib/hooks/use-realtime-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatTime, getRelativeTime } from '@/lib/utils';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Crown,
  Shield,
  Target,
  UserCheck,
  HeadphonesIcon,
} from 'lucide-react';
import Link from 'next/link';
import { hasPermission, PERMISSIONS, ROLE_LABELS, type UserRole } from '@/lib/auth/permissions';
import { UsageStats } from '@/components/dashboard/usage-stats';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canViewBilling, setCanViewBilling] = useState(false);
  const [canViewAllClients, setCanViewAllClients] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        setUserRole(currentUser.role as UserRole);

        // Check permissions
        const billingPerm = await hasPermission(currentUser.id, PERMISSIONS.VIEW_BILLING);
        const allClientsPerm = await hasPermission(currentUser.id, PERMISSIONS.VIEW_ALL_CLIENTS);
        setCanViewBilling(billingPerm);
        setCanViewAllClients(allClientsPerm);
      }

      if (currentUser?.organization_id) {
        // Fetch upcoming sessions
        const sessions = await SessionService.getUpcoming(currentUser.organization_id, undefined, 7);
        setUpcomingSessions(sessions || []);

        // Fetch recent clients
        const { clients } = await ClientService.search(currentUser.organization_id, { limit: 5 });
        setRecentClients(clients || []);
      }

      setLoading(false);
    };

    init();
  }, []);

  const { stats, loading: statsLoading } = useRealtimeDashboard(user?.organization_id || '');

  if (loading || statsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="spinner h-12 w-12" />
      </div>
    );
  }

  const getRoleBadge = () => {
    if (!userRole) return null;

    const roleIcons: Record<UserRole, any> = {
      owner: Crown,
      admin: Shield,
      manager: Target,
      coach: UserCheck,
      support: HeadphonesIcon,
    };

    const roleColors: Record<UserRole, string> = {
      owner: 'bg-purple-100 text-purple-700 border-purple-200',
      admin: 'bg-blue-100 text-blue-700 border-blue-200',
      manager: 'bg-green-100 text-green-700 border-green-200',
      coach: 'bg-orange-100 text-orange-700 border-orange-200',
      support: 'bg-pink-100 text-pink-700 border-pink-200',
    };

    const Icon = roleIcons[userRole];
    return (
      <Badge className={`${roleColors[userRole]} border-2 px-3 py-1`}>
        <Icon className="h-4 w-4 mr-1" />
        {ROLE_LABELS[userRole]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            {getRoleBadge()}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {canViewAllClients
              ? "Here's what's happening with your coaching business today"
              : "Here's your coaching dashboard"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
          <Link href="/dashboard/sessions/new">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-6 ${canViewBilling ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`}>
        <StatsCard
          title={canViewAllClients ? "Total Clients" : "My Clients"}
          value={stats.totalClients}
          subtitle={`${stats.newClientsThisMonth} new this month`}
          icon={<Users className="h-5 w-5" />}
          trend="+12%"
          trendUp
        />
        <StatsCard
          title="Upcoming Sessions"
          value={stats.upcomingSessions}
          subtitle="Next 7 days"
          icon={<Calendar className="h-5 w-5" />}
        />
        {/* Only show billing stats to Owner/Admin/Manager */}
        {canViewBilling && (
          <>
            <StatsCard
              title="Revenue This Month"
              value={formatCurrency(stats.revenueThisMonth)}
              subtitle={`${formatCurrency(stats.totalRevenue)} total`}
              icon={<DollarSign className="h-5 w-5" />}
              trend="+23%"
              trendUp
            />
            <StatsCard
              title="Pending Payments"
              value={formatCurrency(stats.pendingPayments)}
              subtitle={`${stats.completedSessions} completed sessions`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Usage Stats - Show plan usage */}
        <UsageStats />

        <div className="lg:col-span-2 space-y-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Sessions</CardTitle>
            <Link href="/dashboard/sessions">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No upcoming sessions</p>
                <Link href="/dashboard/sessions/new">
                  <Button variant="outline" size="sm" className="mt-4">
                    Schedule your first session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.slice(0, 5).map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{session.title}</h4>
                        <Badge variant={session.status === 'confirmed' ? 'success' : 'default'}>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{session.client?.full_name}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(session.scheduled_at)} • {session.duration_minutes}min
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/sessions/${session.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Clients</CardTitle>
            <Link href="/dashboard/clients">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No clients yet</p>
                <Link href="/dashboard/clients/new">
                  <Button variant="outline" size="sm" className="mt-4">
                    Add your first client
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClients.map((client: any) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-100 text-sm font-semibold text-brand-primary-700">
                        {client.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{client.full_name}</h4>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          client.status === 'active'
                            ? 'success'
                            : client.status === 'lead'
                            ? 'default'
                            : 'gray'
                        }
                      >
                        {client.status}
                      </Badge>
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickAction
              icon={<Users className="h-6 w-6" />}
              title="Add New Client"
              description="Onboard a new client to your CRM"
              href="/dashboard/clients/new"
            />
            <QuickAction
              icon={<Calendar className="h-6 w-6" />}
              title="Schedule Session"
              description="Book a coaching session with a client"
              href="/dashboard/sessions/new"
            />
            <QuickAction
              icon={<DollarSign className="h-6 w-6" />}
              title="Create Invoice"
              description="Generate and send an invoice to a client"
              href="/dashboard/payments/new"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-100 text-brand-primary-600">
            {icon}
          </div>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trendUp ? 'text-brand-secondary-600' : 'text-red-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="group flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-brand-primary-300 hover:bg-brand-primary-50">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary-100 text-brand-primary-600 transition-colors group-hover:bg-brand-primary-200">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}
