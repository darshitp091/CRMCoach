'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useRealtimeClients } from '@/lib/hooks/use-realtime-clients';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Info } from 'lucide-react';
import Link from 'next/link';
import type { ClientStatus } from '@/types/database.types';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';
import { usePlanLimits } from '@/hooks/use-plan-limits';
import { LimitWarning, UpgradePrompt } from '@/components/upgrade/upgrade-prompt';

export default function ClientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | ''>('');
  const [canViewAllClients, setCanViewAllClients] = useState(false);
  const { canAddClient, usage, features, plan } = usePlanLimits();

  useEffect(() => {
    const init = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const allClientsPerm = await hasPermission(currentUser.id, PERMISSIONS.VIEW_ALL_CLIENTS);
        setCanViewAllClients(allClientsPerm);
      }
    };
    init();
  }, []);

  const { clients, loading } = useRealtimeClients(user?.organization_id || '');

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="spinner h-12 w-12" />
      </div>
    );
  }

  const clientLimitCheck = canAddClient();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {canViewAllClients ? 'All Clients' : 'My Clients'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {canViewAllClients
              ? 'Manage your coaching clients and track their progress'
              : 'View and manage your assigned clients'}
          </p>
        </div>
        {clientLimitCheck.allowed ? (
          <Link href="/dashboard/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
        ) : (
          <Button disabled title="Client limit reached">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        )}
      </div>

      {/* Client Limit Warning */}
      {typeof features.maxClients === 'number' && features.maxClients >= 0 && (
        <LimitWarning
          current={usage.clients}
          limit={features.maxClients}
          resource="Clients"
        />
      )}

      {/* Info banner for coaches */}
      {!canViewAllClients && (
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">You're viewing your assigned clients only</p>
                <p className="mt-1">
                  You have access to clients assigned to you by your team manager. Contact your admin to request access to additional clients.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'lead', label: 'Lead' },
                { value: 'prospect', label: 'Prospect' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'churned', label: 'Churned' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ClientStatus | '')}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600">No clients found</p>
              <Link href="/dashboard/clients/new">
                <Button variant="outline" className="mt-4">
                  Add your first client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/dashboard/clients/${client.id}`)}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-100 text-lg font-semibold text-brand-primary-700">
                    {client.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.full_name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {client.total_sessions || 0} sessions
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(client.lifetime_value || 0)} LTV
                    </p>
                  </div>
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
