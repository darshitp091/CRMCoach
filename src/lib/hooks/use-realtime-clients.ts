'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ClientService } from '@/services/client.service';
import type { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

export function useRealtimeClients(organizationId: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { clients: data } = await ClientService.search(organizationId, { limit: 100 });
        setClients(data as Client[]);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('clients-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClients((prev) => [payload.new as Client, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setClients((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Client) : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setClients((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  return { clients, loading };
}
