'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  totalRevenue: number;
  pendingPayments: number;
  revenueThisMonth: number;
}

export function useRealtimeDashboard(organizationId: string) {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: analytics, error } = await supabase.rpc('get_dashboard_analytics', {
          org_id: organizationId,
          date_from: startOfMonth.toISOString(),
          date_to: new Date().toISOString(),
        });

        if (!error && analytics) {
          setStats({
            totalClients: analytics.total_clients || 0,
            activeClients: analytics.active_clients || 0,
            newClientsThisMonth: analytics.new_clients_this_period || 0,
            totalSessions: analytics.total_sessions || 0,
            upcomingSessions: analytics.upcoming_sessions || 0,
            completedSessions: analytics.completed_sessions || 0,
            totalRevenue: analytics.total_revenue || 0,
            pendingPayments: analytics.pending_payments || 0,
            revenueThisMonth: analytics.total_revenue || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to real-time changes
    const clientsChannel = supabase
      .channel('dashboard-clients')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          setStats((prev) => ({
            ...prev,
            totalClients: prev.totalClients + 1,
            newClientsThisMonth: prev.newClientsThisMonth + 1,
          }));
        }
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel('dashboard-payments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: any) => {
          if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
            const amount = Number(payload.new.amount);
            setStats((prev) => ({
              ...prev,
              totalRevenue: prev.totalRevenue + amount,
              revenueThisMonth: prev.revenueThisMonth + amount,
              pendingPayments: prev.pendingPayments - (payload.old.status === 'pending' ? amount : 0),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [organizationId]);

  return { stats, loading };
}
