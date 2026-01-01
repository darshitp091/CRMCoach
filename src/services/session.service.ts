import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { SessionStatus } from '@/types/database.types';

type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
type SessionUpdate = Database['public']['Tables']['sessions']['Update'];
type SessionRow = Database['public']['Tables']['sessions']['Row'];

export interface CreateSessionData {
  clientId: string;
  coachId: string;
  title: string;
  description?: string;
  sessionType?: string;
  scheduledAt: string;
  durationMinutes?: number;
  timezone?: string;
  meetingUrl?: string;
  meetingPlatform?: string;
  location?: string;
  programId?: string;
}

export interface UpdateSessionData extends Partial<CreateSessionData> {
  status?: SessionStatus;
  sessionNotes?: string;
  actionItems?: any[];
}

export class SessionService {
  /**
   * Create a new session
   */
  static async create(organizationId: string, data: CreateSessionData): Promise<SessionRow> {
    const sessionData: any = {
      organization_id: organizationId,
      client_id: data.clientId,
      coach_id: data.coachId,
      title: data.title,
      description: data.description || null,
      session_type: data.sessionType || null,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes || 60,
      timezone: data.timezone || 'Asia/Kolkata',
      meeting_url: data.meetingUrl || null,
      meeting_platform: data.meetingPlatform || null,
      location: data.location || null,
      program_id: data.programId || null,
      status: 'scheduled',
      reminder_sent: false,
      action_items: [],
    };

    const { data: session, error } = await ((supabase
      .from('sessions') as any)
      .insert(sessionData)
      .select()
      .single());

    if (error) throw error;
    return session;
  }

  /**
   * Get session by ID
   */
  static async getById(sessionId: string) {
    const { data, error } = await (supabase
      .from('sessions')
      .select(`
        *,
        client:clients(id, full_name, email, phone, avatar_url),
        coach:users!coach_id(id, full_name, email, avatar_url),
        program:programs(id, name)
      `)
      .eq('id', sessionId)
      .single() as any);

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Update session
   */
  static async update(sessionId: string, data: UpdateSessionData): Promise<SessionRow> {
    const updateData: any = {
      title: data.title,
      description: data.description,
      session_type: data.sessionType,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes,
      timezone: data.timezone,
      meeting_url: data.meetingUrl,
      meeting_platform: data.meetingPlatform,
      location: data.location,
      status: data.status,
      session_notes: data.sessionNotes,
      action_items: data.actionItems,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: session, error } = await ((supabase
      .from('sessions') as any)
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single());

    if (error) throw error;
    return session;
  }

  /**
   * Delete session (soft delete)
   */
  static async delete(sessionId: string): Promise<void> {
    const { error } = await ((supabase
      .from('sessions') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sessionId));

    if (error) throw error;
  }

  /**
   * Get all sessions for an organization
   */
  static async getAll(organizationId: string) {
    const { data, error} = await (supabase
      .from('sessions')
      .select(`
        *,
        client:clients(id, full_name, email, avatar_url),
        coach:users!coach_id(id, full_name, email)
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: false }) as any);

    if (error) throw error;
    return data;
  }

  /**
   * Get upcoming sessions
   */
  static async getUpcoming(organizationId: string, coachId?: string, daysAhead: number = 7) {
    let query: any = supabase
      .from('sessions')
      .select(`
        *,
        client:clients(id, full_name, email, avatar_url),
        coach:users!coach_id(id, full_name, email)
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .in('status', ['scheduled', 'confirmed'])
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString());

    if (coachId) {
      query = query.eq('coach_id', coachId);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get past sessions
   */
  static async getPast(organizationId: string, coachId?: string, limit: number = 50) {
    let query: any = supabase
      .from('sessions')
      .select(`
        *,
        client:clients(id, full_name, email, avatar_url),
        coach:users!coach_id(id, full_name, email)
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .eq('status', 'completed')
      .lt('scheduled_at', new Date().toISOString());

    if (coachId) {
      query = query.eq('coach_id', coachId);
    }

    const { data, error } = await query
      .order('scheduled_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get sessions for a client
   */
  static async getByClient(clientId: string) {
    const { data, error } = await (supabase
      .from('sessions')
      .select(`
        *,
        coach:users!coach_id(id, full_name, email, avatar_url)
      `)
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: false }) as any);

    if (error) throw error;
    return data;
  }

  /**
   * Get sessions for a coach
   */
  static async getByCoach(coachId: string, startDate?: string, endDate?: string) {
    let query: any = supabase
      .from('sessions')
      .select(`
        *,
        client:clients(id, full_name, email, avatar_url)
      `)
      .eq('coach_id', coachId)
      .is('deleted_at', null);

    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Complete session with notes
   */
  static async complete(sessionId: string, sessionNotes: string, actionItems: any[] = []) {
    return this.update(sessionId, {
      status: 'completed',
      sessionNotes,
      actionItems,
    });
  }

  /**
   * Cancel session
   */
  static async cancel(sessionId: string) {
    return this.update(sessionId, { status: 'cancelled' });
  }

  /**
   * Confirm session
   */
  static async confirm(sessionId: string) {
    return this.update(sessionId, { status: 'confirmed' });
  }

  /**
   * Mark session as no-show
   */
  static async markNoShow(sessionId: string) {
    return this.update(sessionId, { status: 'no_show' });
  }

  /**
   * Check for scheduling conflicts
   */
  static async checkConflicts(
    coachId: string,
    scheduledAt: string,
    durationMinutes: number = 60,
    excludeSessionId?: string
  ) {
    const sessionStart = new Date(scheduledAt);
    const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60000);

    let query: any = supabase
      .from('sessions')
      .select('id, title, scheduled_at, duration_minutes')
      .eq('coach_id', coachId)
      .is('deleted_at', null)
      .in('status', ['scheduled', 'confirmed'])
      .gte('scheduled_at', sessionStart.toISOString())
      .lt('scheduled_at', sessionEnd.toISOString());

    if (excludeSessionId) {
      query = query.neq('id', excludeSessionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data && data.length > 0;
  }

  /**
   * Get session statistics
   */
  static async getStats(organizationId: string, startDate?: string, endDate?: string) {
    let query: any = supabase
      .from('sessions')
      .select('status, scheduled_at')
      .eq('organization_id', organizationId)
      .is('deleted_at', null);

    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      scheduled: data?.filter((s: any) => s.status === 'scheduled').length || 0,
      confirmed: data?.filter((s: any) => s.status === 'confirmed').length || 0,
      completed: data?.filter((s: any) => s.status === 'completed').length || 0,
      cancelled: data?.filter((s: any) => s.status === 'cancelled').length || 0,
      noShow: data?.filter((s: any) => s.status === 'no_show').length || 0,
    };

    return stats;
  }

  /**
   * Get sessions needing reminders
   */
  static async getSessionsNeedingReminders(hoursAhead: number = 24) {
    const startTime = new Date();
    const endTime = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);

    const { data, error } = await (supabase
      .from('sessions')
      .select(`
        *,
        client:clients(id, full_name, email, phone),
        coach:users!coach_id(id, full_name, email),
        organization:organizations(name, settings)
      `)
      .is('deleted_at', null)
      .in('status', ['scheduled', 'confirmed'])
      .eq('reminder_sent', false)
      .gte('scheduled_at', startTime.toISOString())
      .lte('scheduled_at', endTime.toISOString()) as any);

    if (error) throw error;
    return data;
  }

  /**
   * Mark reminder as sent
   */
  static async markReminderSent(sessionId: string) {
    const { error } = await ((supabase
      .from('sessions') as any)
      .update({
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString(),
      })
      .eq('id', sessionId));

    if (error) throw error;
  }
}
