import { supabase } from '@/lib/supabase/client';

/**
 * User roles in the system
 */
export type UserRole = 'owner' | 'admin' | 'manager' | 'coach' | 'support';

/**
 * All available permissions in the system
 */
export const PERMISSIONS = {
  // Account & Billing
  CHANGE_SUBSCRIPTION: 'change_subscription',
  UPDATE_PAYMENT_METHOD: 'update_payment_method',
  VIEW_BILLING: 'view_billing',
  DELETE_ACCOUNT: 'delete_account',
  TRANSFER_OWNERSHIP: 'transfer_ownership',
  ACCESS_USAGE_DASHBOARD: 'access_usage_dashboard',
  PURCHASE_ADDONS: 'purchase_addons',

  // Team Management
  ADD_TEAM_MEMBERS: 'add_team_members',
  REMOVE_TEAM_MEMBERS: 'remove_team_members',
  CHANGE_PERMISSIONS: 'change_permissions',
  ASSIGN_CLIENTS: 'assign_clients',
  VIEW_TEAM_PERFORMANCE: 'view_team_performance',
  EDIT_TEAM_CALENDARS: 'edit_team_calendars',

  // Client Management
  VIEW_ALL_CLIENTS: 'view_all_clients',
  VIEW_OWN_CLIENTS: 'view_own_clients',
  EDIT_ALL_CLIENTS: 'edit_all_clients',
  EDIT_OWN_CLIENTS: 'edit_own_clients',
  DELETE_CLIENTS: 'delete_clients',
  CREATE_CLIENTS: 'create_clients',
  EXPORT_CLIENT_DATA: 'export_client_data',
  TRANSFER_CLIENTS: 'transfer_clients',

  // Sessions & Notes
  CREATE_SESSION_NOTES: 'create_session_notes',
  VIEW_ALL_SESSIONS: 'view_all_sessions',
  VIEW_OWN_SESSIONS: 'view_own_sessions',
  EDIT_ALL_SESSIONS: 'edit_all_sessions',
  EDIT_OWN_SESSIONS: 'edit_own_sessions',
  DELETE_SESSION_NOTES: 'delete_session_notes',
  USE_AI_FEATURES: 'use_ai_features',

  // Scheduling
  MANAGE_OWN_CALENDAR: 'manage_own_calendar',
  VIEW_TEAM_CALENDARS: 'view_team_calendars',
  BOOK_FOR_SELF: 'book_for_self',
  BOOK_FOR_OTHERS: 'book_for_others',
  CONFIGURE_APPOINTMENT_TYPES: 'configure_appointment_types',

  // Billing & Payments (Client)
  VIEW_CLIENT_INVOICES: 'view_client_invoices',
  CREATE_INVOICES: 'create_invoices',
  EDIT_INVOICES: 'edit_invoices',
  DELETE_INVOICES: 'delete_invoices',
  PROCESS_PAYMENTS: 'process_payments',
  REFUND_PAYMENTS: 'refund_payments',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',

  // Communications
  MESSAGE_OWN_CLIENTS: 'message_own_clients',
  MESSAGE_ALL_CLIENTS: 'message_all_clients',
  SEND_WHATSAPP: 'send_whatsapp',
  SEND_BULK_MESSAGES: 'send_bulk_messages',
  CONFIGURE_EMAIL_TEMPLATES: 'configure_email_templates',

  // Programs & Resources
  VIEW_RESOURCES: 'view_resources',
  CREATE_RESOURCES: 'create_resources',
  EDIT_ALL_RESOURCES: 'edit_all_resources',
  EDIT_OWN_RESOURCES: 'edit_own_resources',
  DELETE_RESOURCES: 'delete_resources',
  PUBLISH_PROGRAMS: 'publish_programs',

  // Analytics & Reports
  VIEW_ANALYTICS_DASHBOARD: 'view_analytics_dashboard',
  VIEW_TEAM_ANALYTICS: 'view_team_analytics',
  VIEW_CLIENT_PROGRESS: 'view_client_progress',
  EXPORT_REPORTS: 'export_reports',
  VIEW_CHURN_PREDICTIONS: 'view_churn_predictions',

  // System Settings
  MANAGE_ACCOUNT_SETTINGS: 'manage_account_settings',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  CONFIGURE_AUTOMATIONS: 'configure_automations',
  CUSTOMIZE_BRANDING: 'customize_branding',
  API_ACCESS: 'api_access',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
} as const;

/**
 * Permission definitions by role
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: [
    // All permissions - owner has unrestricted access
    ...Object.values(PERMISSIONS),
  ],

  admin: [
    // Account & Billing (view only, no changes)
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.ACCESS_USAGE_DASHBOARD,

    // Team Management (all except remove owner)
    PERMISSIONS.ADD_TEAM_MEMBERS,
    PERMISSIONS.REMOVE_TEAM_MEMBERS,
    PERMISSIONS.CHANGE_PERMISSIONS,
    PERMISSIONS.ASSIGN_CLIENTS,
    PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    PERMISSIONS.EDIT_TEAM_CALENDARS,

    // Client Management (full access)
    PERMISSIONS.VIEW_ALL_CLIENTS,
    PERMISSIONS.VIEW_OWN_CLIENTS,
    PERMISSIONS.EDIT_ALL_CLIENTS,
    PERMISSIONS.EDIT_OWN_CLIENTS,
    PERMISSIONS.DELETE_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
    PERMISSIONS.EXPORT_CLIENT_DATA,
    PERMISSIONS.TRANSFER_CLIENTS,

    // Sessions & Notes (full access)
    PERMISSIONS.CREATE_SESSION_NOTES,
    PERMISSIONS.VIEW_ALL_SESSIONS,
    PERMISSIONS.VIEW_OWN_SESSIONS,
    PERMISSIONS.EDIT_ALL_SESSIONS,
    PERMISSIONS.EDIT_OWN_SESSIONS,
    PERMISSIONS.DELETE_SESSION_NOTES,
    PERMISSIONS.USE_AI_FEATURES,

    // Scheduling (full access)
    PERMISSIONS.MANAGE_OWN_CALENDAR,
    PERMISSIONS.VIEW_TEAM_CALENDARS,
    PERMISSIONS.BOOK_FOR_SELF,
    PERMISSIONS.BOOK_FOR_OTHERS,
    PERMISSIONS.CONFIGURE_APPOINTMENT_TYPES,

    // Billing & Payments (full access)
    PERMISSIONS.VIEW_CLIENT_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.DELETE_INVOICES,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.REFUND_PAYMENTS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,

    // Communications (full access)
    PERMISSIONS.MESSAGE_OWN_CLIENTS,
    PERMISSIONS.MESSAGE_ALL_CLIENTS,
    PERMISSIONS.SEND_WHATSAPP,
    PERMISSIONS.SEND_BULK_MESSAGES,
    PERMISSIONS.CONFIGURE_EMAIL_TEMPLATES,

    // Programs & Resources (full access)
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.CREATE_RESOURCES,
    PERMISSIONS.EDIT_ALL_RESOURCES,
    PERMISSIONS.EDIT_OWN_RESOURCES,
    PERMISSIONS.DELETE_RESOURCES,
    PERMISSIONS.PUBLISH_PROGRAMS,

    // Analytics (full access)
    PERMISSIONS.VIEW_ANALYTICS_DASHBOARD,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.VIEW_CLIENT_PROGRESS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_CHURN_PREDICTIONS,

    // System Settings (full access)
    PERMISSIONS.MANAGE_ACCOUNT_SETTINGS,
    PERMISSIONS.MANAGE_INTEGRATIONS,
    PERMISSIONS.CONFIGURE_AUTOMATIONS,
    PERMISSIONS.CUSTOMIZE_BRANDING,
    PERMISSIONS.API_ACCESS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],

  manager: [
    // Account & Billing (view only)
    PERMISSIONS.ACCESS_USAGE_DASHBOARD,

    // Team Management (limited)
    PERMISSIONS.ASSIGN_CLIENTS,
    PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    PERMISSIONS.EDIT_TEAM_CALENDARS,

    // Client Management (view all, edit limited)
    PERMISSIONS.VIEW_ALL_CLIENTS,
    PERMISSIONS.VIEW_OWN_CLIENTS,
    PERMISSIONS.EDIT_OWN_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
    PERMISSIONS.EXPORT_CLIENT_DATA,
    PERMISSIONS.TRANSFER_CLIENTS,

    // Sessions & Notes (view all, edit own)
    PERMISSIONS.CREATE_SESSION_NOTES,
    PERMISSIONS.VIEW_ALL_SESSIONS,
    PERMISSIONS.VIEW_OWN_SESSIONS,
    PERMISSIONS.EDIT_OWN_SESSIONS,
    PERMISSIONS.USE_AI_FEATURES,

    // Scheduling
    PERMISSIONS.MANAGE_OWN_CALENDAR,
    PERMISSIONS.VIEW_TEAM_CALENDARS,
    PERMISSIONS.BOOK_FOR_SELF,
    PERMISSIONS.BOOK_FOR_OTHERS,
    PERMISSIONS.CONFIGURE_APPOINTMENT_TYPES,

    // Billing & Payments
    PERMISSIONS.VIEW_CLIENT_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.REFUND_PAYMENTS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,

    // Communications
    PERMISSIONS.MESSAGE_OWN_CLIENTS,
    PERMISSIONS.MESSAGE_ALL_CLIENTS,
    PERMISSIONS.SEND_WHATSAPP,
    PERMISSIONS.SEND_BULK_MESSAGES,
    PERMISSIONS.CONFIGURE_EMAIL_TEMPLATES,

    // Programs & Resources
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.CREATE_RESOURCES,
    PERMISSIONS.EDIT_OWN_RESOURCES,
    PERMISSIONS.PUBLISH_PROGRAMS,

    // Analytics
    PERMISSIONS.VIEW_ANALYTICS_DASHBOARD,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.VIEW_CLIENT_PROGRESS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_CHURN_PREDICTIONS,

    // System Settings (limited)
    PERMISSIONS.CONFIGURE_AUTOMATIONS,
  ],

  coach: [
    // Team Management (none)

    // Client Management (own clients only)
    PERMISSIONS.VIEW_OWN_CLIENTS,
    PERMISSIONS.EDIT_OWN_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
    PERMISSIONS.EXPORT_CLIENT_DATA,

    // Sessions & Notes (own clients only)
    PERMISSIONS.CREATE_SESSION_NOTES,
    PERMISSIONS.VIEW_OWN_SESSIONS,
    PERMISSIONS.EDIT_OWN_SESSIONS,
    PERMISSIONS.USE_AI_FEATURES,

    // Scheduling
    PERMISSIONS.MANAGE_OWN_CALENDAR,
    PERMISSIONS.BOOK_FOR_SELF,

    // Billing & Payments (own clients only)
    PERMISSIONS.VIEW_CLIENT_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.PROCESS_PAYMENTS,

    // Communications (own clients only)
    PERMISSIONS.MESSAGE_OWN_CLIENTS,
    PERMISSIONS.SEND_WHATSAPP,

    // Programs & Resources
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.CREATE_RESOURCES,
    PERMISSIONS.EDIT_OWN_RESOURCES,

    // Analytics (own clients only)
    PERMISSIONS.VIEW_ANALYTICS_DASHBOARD,
    PERMISSIONS.VIEW_CLIENT_PROGRESS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_CHURN_PREDICTIONS,
  ],

  support: [
    // Team Management (none)

    // Client Management (basic view only)
    // Note: Support sees basic info, not private notes

    // Sessions & Notes (no access to private notes)

    // Scheduling (can schedule for others)
    PERMISSIONS.VIEW_TEAM_CALENDARS,
    PERMISSIONS.BOOK_FOR_OTHERS,

    // Billing & Payments (if biller modifier)
    PERMISSIONS.VIEW_CLIENT_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.REFUND_PAYMENTS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,

    // Communications (coordination only)
    PERMISSIONS.MESSAGE_OWN_CLIENTS,
    PERMISSIONS.SEND_WHATSAPP,

    // Programs & Resources (view only)
    PERMISSIONS.VIEW_RESOURCES,
  ],
};

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role, is_biller')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching user role:', error);
      return false;
    }

    const role = user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Check base role permissions
    if (permissions.includes(permission)) {
      return true;
    }

    // Check biller modifier permissions
    if (user.is_biller && BILLER_PERMISSIONS.includes(permission)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Additional permissions granted by biller modifier
 */
const BILLER_PERMISSIONS = [
  PERMISSIONS.VIEW_CLIENT_INVOICES,
  PERMISSIONS.CREATE_INVOICES,
  PERMISSIONS.EDIT_INVOICES,
  PERMISSIONS.PROCESS_PAYMENTS,
  PERMISSIONS.REFUND_PAYMENTS,
  PERMISSIONS.VIEW_FINANCIAL_REPORTS,
];

/**
 * Require a specific permission or throw an error
 */
export async function requirePermission(
  userId: string,
  permission: string
): Promise<void> {
  const allowed = await hasPermission(userId, permission);
  if (!allowed) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Get current user's role
 */
export async function getCurrentUserRole(
  userId: string
): Promise<UserRole | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user.role as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Check if user can access a specific client
 */
export async function canAccessClient(
  userId: string,
  clientId: string
): Promise<boolean> {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', userId)
      .single();

    if (userError || !user) return false;

    // Owner/Admin/Manager can access all clients
    if (['owner', 'admin', 'manager'].includes(user.role)) {
      return true;
    }

    // Coaches can only access assigned clients
    if (user.role === 'coach') {
      const { data: assignment, error: assignError } = await supabase
        .from('coach_client_assignments')
        .select('id')
        .eq('coach_id', userId)
        .eq('client_id', clientId)
        .single();

      return !assignError && !!assignment;
    }

    // Support has limited access
    if (user.role === 'support') {
      // Support can view basic info but not private notes
      return true; // Limited by RLS policies
    }

    return false;
  } catch (error) {
    console.error('Error checking client access:', error);
    return false;
  }
}

/**
 * Get assigned clients for a coach
 */
export async function getAssignedClients(coachId: string): Promise<string[]> {
  try {
    const { data: assignments, error } = await supabase
      .from('coach_client_assignments')
      .select('client_id')
      .eq('coach_id', coachId);

    if (error || !assignments) {
      return [];
    }

    return assignments.map((a) => a.client_id);
  } catch (error) {
    console.error('Error fetching assigned clients:', error);
    return [];
  }
}

/**
 * Assign a client to a coach
 */
export async function assignClientToCoach(
  clientId: string,
  coachId: string,
  assignedBy: string,
  assignmentType: 'primary' | 'secondary' | 'supervisor' = 'primary'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get organization ID from client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('organization_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return { success: false, error: 'Client not found' };
    }

    // Insert assignment
    const { error: insertError } = await supabase
      .from('coach_client_assignments')
      .upsert({
        client_id: clientId,
        coach_id: coachId,
        organization_id: client.organization_id,
        assignment_type: assignmentType,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString(),
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove client assignment from coach
 */
export async function removeClientAssignment(
  clientId: string,
  coachId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('coach_client_assignments')
      .delete()
      .eq('client_id', clientId)
      .eq('coach_id', coachId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Role display names
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  coach: 'Coach',
  support: 'Support',
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Full control of your coaching business',
  admin: 'Trusted partner with near-full access',
  manager: 'Team oversight and coordination',
  coach: 'Individual practitioner access',
  support: 'Administrative helper role',
};

/**
 * Role badge colors for UI
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  owner: 'purple',
  admin: 'blue',
  manager: 'green',
  coach: 'orange',
  support: 'pink',
};
