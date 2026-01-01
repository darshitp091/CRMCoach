import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// Server-side Supabase client for use in Server Components
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};

// Helper to get session on server
export async function getServerSession() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Helper to get user profile with organization
export async function getUserProfile(userId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Helper to check if user has permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data } = await (supabase
    .from('users')
    .select('role, permissions')
    .eq('id', userId)
    .single() as any);

  if (!data) return false;

  // Owners and admins have all permissions
  if (data.role === 'owner' || data.role === 'admin') return true;

  // Check specific permission
  const permissions = data.permissions as string[] || [];
  return permissions.includes(permission);
}
