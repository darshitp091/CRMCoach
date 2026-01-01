import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { ClientStatus } from '@/types/database.types';

type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];
type ClientRow = Database['public']['Tables']['clients']['Row'];

export interface CreateClientData {
  email: string;
  fullName: string;
  phone?: string;
  company?: string;
  title?: string;
  status?: ClientStatus;
  source?: string;
  tags?: string[];
  goals?: string[];
  challenges?: string[];
  notes?: string;
  assignedCoachId?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  progressScore?: number;
  satisfactionScore?: number;
  nextFollowUpDate?: string;
}

export interface SearchClientsParams {
  searchQuery?: string;
  status?: ClientStatus;
  tags?: string[];
  assignedCoachId?: string;
  limit?: number;
  offset?: number;
}

export class ClientService {
  /**
   * Create a new client
   */
  static async create(organizationId: string, data: CreateClientData): Promise<ClientRow> {
    const clientData: any = {
      organization_id: organizationId,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone || null,
      company: data.company || null,
      title: data.title || null,
      status: data.status || 'lead',
      source: data.source || null,
      tags: data.tags || null,
      goals: data.goals || null,
      challenges: data.challenges || null,
      notes: data.notes || null,
      assigned_coach_id: data.assignedCoachId || null,
      custom_fields: {},
    };

    const { data: client, error } = await ((supabase
      .from('clients') as any)
      .insert(clientData)
      .select()
      .single());

    if (error) throw error;
    return client;
  }

  /**
   * Get client by ID
   */
  static async getById(clientId: string): Promise<ClientRow | null> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        assigned_coach:users!assigned_coach_id(id, full_name, email, avatar_url)
      `)
      .eq('id', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Update client
   */
  static async update(clientId: string, data: UpdateClientData): Promise<ClientRow> {
    const updateData: any = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      title: data.title,
      status: data.status,
      source: data.source,
      tags: data.tags,
      goals: data.goals,
      challenges: data.challenges,
      notes: data.notes,
      assigned_coach_id: data.assignedCoachId,
      progress_score: data.progressScore,
      satisfaction_score: data.satisfactionScore,
      next_follow_up_date: data.nextFollowUpDate,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: client, error } = await ((supabase
      .from('clients') as any)
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single());

    if (error) throw error;
    return client;
  }

  /**
   * Delete client (soft delete)
   */
  static async delete(clientId: string): Promise<void> {
    const { error } = await ((supabase
      .from('clients') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', clientId));

    if (error) throw error;
  }

  /**
   * Search clients with filters
   */
  static async search(organizationId: string, params: SearchClientsParams = {}) {
    const {
      searchQuery = '',
      status,
      tags,
      assignedCoachId,
      limit = 50,
      offset = 0,
    } = params;

    let query = supabase
      .from('clients')
      .select(`
        *,
        assigned_coach:users!assigned_coach_id(id, full_name, email, avatar_url)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .is('deleted_at', null);

    // Search filter
    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    }

    // Status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Tags filter
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Assigned coach filter
    if (assignedCoachId) {
      query = query.eq('assigned_coach_id', assignedCoachId);
    }

    // Pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return { clients: data || [], total: count || 0 };
  }

  /**
   * Get clients by status
   */
  static async getByStatus(organizationId: string, status: ClientStatus) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get clients assigned to a coach
   */
  static async getByCoach(coachId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('assigned_coach_id', coachId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get client activity timeline
   */
  static async getActivity(clientId: string) {
    // Get sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false })
      .limit(10);

    // Get communications
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false})
      .limit(10);

    return {
      sessions: sessions || [],
      communications: communications || [],
      payments: payments || [],
      notes: notes || [],
    };
  }

  /**
   * Get client statistics
   */
  static async getStats(organizationId: string) {
    const { data, error } = await (supabase
      .from('clients')
      .select('status')
      .eq('organization_id', organizationId)
      .is('deleted_at', null) as any);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      lead: data?.filter((c: any) => c.status === 'lead').length || 0,
      prospect: data?.filter((c: any) => c.status === 'prospect').length || 0,
      active: data?.filter((c: any) => c.status === 'active').length || 0,
      inactive: data?.filter((c: any) => c.status === 'inactive').length || 0,
      churned: data?.filter((c: any) => c.status === 'churned').length || 0,
    };

    return stats;
  }

  /**
   * Add tags to client
   */
  static async addTags(clientId: string, newTags: string[]) {
    const client = await this.getById(clientId);
    if (!client) throw new Error('Client not found');

    const existingTags = client.tags || [];
    const updatedTags = Array.from(new Set([...existingTags, ...newTags]));

    return this.update(clientId, { tags: updatedTags });
  }

  /**
   * Remove tags from client
   */
  static async removeTags(clientId: string, tagsToRemove: string[]) {
    const client = await this.getById(clientId);
    if (!client) throw new Error('Client not found');

    const existingTags = client.tags || [];
    const updatedTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

    return this.update(clientId, { tags: updatedTags });
  }

  /**
   * Get all unique tags for organization
   */
  static async getAllTags(organizationId: string): Promise<string[]> {
    const { data, error } = await (supabase
      .from('clients')
      .select('tags')
      .eq('organization_id', organizationId)
      .is('deleted_at', null) as any);

    if (error) throw error;

    const allTags = new Set<string>();
    data?.forEach((client: any) => {
      if (client.tags) {
        client.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }
}
