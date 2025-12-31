import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { TriggerType } from '@/types/database.types';

type AutomationInsert = Database['public']['Tables']['automations']['Insert'];
type AutomationRow = Database['public']['Tables']['automations']['Row'];

export interface CreateAutomationData {
  name: string;
  description?: string;
  triggerType: TriggerType;
  triggerConfig?: Record<string, any>;
  conditions?: any[];
  actions: any[];
  isActive?: boolean;
}

export interface AutomationAction {
  type: 'send_email' | 'send_whatsapp' | 'send_sms' | 'create_task' | 'update_client' | 'webhook' | 'custom';
  template_id?: string;
  delay_minutes?: number;
  config?: Record<string, any>;
}

export class AutomationService {
  /**
   * Create automation
   */
  static async create(organizationId: string, userId: string, data: CreateAutomationData): Promise<AutomationRow> {
    const automationData: AutomationInsert = {
      organization_id: organizationId,
      created_by_id: userId,
      name: data.name,
      description: data.description || null,
      trigger_type: data.triggerType,
      trigger_config: data.triggerConfig || {},
      conditions: data.conditions || [],
      actions: data.actions,
      is_active: data.isActive ?? true,
    };

    const { data: automation, error } = await supabase
      .from('automations')
      .insert(automationData)
      .select()
      .single();

    if (error) throw error;
    return automation;
  }

  /**
   * Get automation by ID
   */
  static async getById(automationId: string) {
    const { data, error } = await supabase
      .from('automations')
      .select(`
        *,
        created_by:users!created_by_id(id, full_name, email)
      `)
      .eq('id', automationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Get all automations for organization
   */
  static async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('automations')
      .select(`
        *,
        created_by:users!created_by_id(id, full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get automations by trigger type
   */
  static async getByTriggerType(organizationId: string, triggerType: TriggerType) {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('trigger_type', triggerType)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Update automation
   */
  static async update(automationId: string, data: Partial<CreateAutomationData>) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.triggerType) updateData.trigger_type = data.triggerType;
    if (data.triggerConfig) updateData.trigger_config = data.triggerConfig;
    if (data.conditions) updateData.conditions = data.conditions;
    if (data.actions) updateData.actions = data.actions;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { data: automation, error } = await supabase
      .from('automations')
      .update(updateData)
      .eq('id', automationId)
      .select()
      .single();

    if (error) throw error;
    return automation;
  }

  /**
   * Toggle automation active status
   */
  static async toggle(automationId: string, isActive: boolean) {
    const { error } = await supabase
      .from('automations')
      .update({ is_active: isActive })
      .eq('id', automationId);

    if (error) throw error;
  }

  /**
   * Delete automation
   */
  static async delete(automationId: string) {
    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', automationId);

    if (error) throw error;
  }

  /**
   * Get automation logs
   */
  static async getLogs(automationId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('automation_id', automationId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get automation statistics
   */
  static async getStats(automationId: string) {
    const automation = await this.getById(automationId);
    if (!automation) throw new Error('Automation not found');

    const { data: logs, error } = await supabase
      .from('automation_logs')
      .select('status')
      .eq('automation_id', automationId);

    if (error) throw error;

    const stats = {
      total_executions: automation.execution_count,
      last_executed: automation.last_executed_at,
      success_count: logs?.filter(l => l.status === 'success').length || 0,
      failed_count: logs?.filter(l => l.status === 'failed').length || 0,
      success_rate: logs && logs.length > 0
        ? (logs.filter(l => l.status === 'success').length / logs.length) * 100
        : 0,
    };

    return stats;
  }

  /**
   * Duplicate automation
   */
  static async duplicate(automationId: string, newName: string) {
    const original = await this.getById(automationId);
    if (!original) throw new Error('Automation not found');

    const { data, error } = await supabase
      .from('automations')
      .insert({
        organization_id: original.organization_id,
        created_by_id: original.created_by_id,
        name: newName,
        description: original.description,
        trigger_type: original.trigger_type,
        trigger_config: original.trigger_config,
        conditions: original.conditions,
        actions: original.actions,
        is_active: false, // Start as inactive
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Test automation (dry run)
   */
  static async test(automationId: string, sampleData: Record<string, any>) {
    // This would be implemented in the backend
    // For now, just return the automation config
    const automation = await this.getById(automationId);
    if (!automation) throw new Error('Automation not found');

    return {
      automation,
      sampleData,
      wouldExecute: automation.is_active,
      actions: automation.actions,
    };
  }

  /**
   * Get automation templates
   */
  static getTemplates() {
    return [
      {
        id: 'welcome-client',
        name: 'Welcome New Clients',
        description: 'Send welcome email when a new client is added',
        triggerType: 'client_created' as TriggerType,
        actions: [
          {
            type: 'send_email',
            template_id: 'welcome_email',
            delay_minutes: 0,
          },
        ],
      },
      {
        id: 'session-reminder-24h',
        name: 'Session Reminder (24 hours)',
        description: 'Send reminder 24 hours before session',
        triggerType: 'session_scheduled' as TriggerType,
        triggerConfig: { hours_before: 24 },
        actions: [
          {
            type: 'send_email',
            template_id: 'session_reminder',
            delay_minutes: 0,
          },
          {
            type: 'send_whatsapp',
            template_id: 'whatsapp_reminder',
            delay_minutes: 0,
          },
        ],
      },
      {
        id: 'payment-confirmation',
        name: 'Payment Confirmation',
        description: 'Send receipt when payment is received',
        triggerType: 'payment_received' as TriggerType,
        actions: [
          {
            type: 'send_email',
            template_id: 'payment_confirmation',
            delay_minutes: 0,
          },
        ],
      },
      {
        id: 'session-followup',
        name: 'Session Follow-up',
        description: 'Send follow-up email after session completion',
        triggerType: 'session_completed' as TriggerType,
        actions: [
          {
            type: 'send_email',
            template_id: 'session_followup',
            delay_minutes: 60,
          },
          {
            type: 'create_task',
            config: {
              title: 'Review session notes',
              assign_to: 'coach',
            },
            delay_minutes: 0,
          },
        ],
      },
      {
        id: 'payment-reminder',
        name: 'Payment Reminder',
        description: 'Remind clients about pending payments',
        triggerType: 'custom' as TriggerType,
        actions: [
          {
            type: 'send_email',
            template_id: 'payment_reminder',
            delay_minutes: 0,
          },
          {
            type: 'send_whatsapp',
            template_id: 'whatsapp_payment_reminder',
            delay_minutes: 0,
          },
        ],
      },
    ];
  }

  /**
   * Create automation from template
   */
  static async createFromTemplate(
    organizationId: string,
    userId: string,
    templateId: string
  ) {
    const templates = this.getTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) throw new Error('Template not found');

    return this.create(organizationId, userId, {
      name: template.name,
      description: template.description,
      triggerType: template.triggerType,
      triggerConfig: template.triggerConfig,
      actions: template.actions,
      isActive: true,
    });
  }
}
