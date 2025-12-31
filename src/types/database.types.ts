// Database Types - Auto-generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'owner' | 'admin' | 'coach' | 'member'
export type SubscriptionPlan = 'standard' | 'pro' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due'
export type ClientStatus = 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
export type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type CommunicationChannel = 'email' | 'whatsapp' | 'sms' | 'in_app' | 'call'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export type TriggerType =
  | 'client_created'
  | 'session_scheduled'
  | 'session_completed'
  | 'payment_received'
  | 'payment_failed'
  | 'milestone_achieved'
  | 'inactivity_detected'
  | 'subscription_expiring'
  | 'custom'

export type ActionType =
  | 'send_email'
  | 'send_whatsapp'
  | 'send_sms'
  | 'create_task'
  | 'update_client'
  | 'webhook'
  | 'custom'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          industry: string | null
          website: string | null
          phone: string | null
          email: string | null
          address: Json | null
          subscription_plan: SubscriptionPlan
          subscription_status: SubscriptionStatus
          subscription_start_date: string | null
          subscription_end_date: string | null
          trial_ends_at: string | null
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          billing_email: string | null
          settings: Json
          branding: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          bio: string | null
          title: string | null
          role: UserRole
          is_active: boolean
          permissions: Json
          specializations: string[] | null
          hourly_rate: number | null
          preferences: Json
          last_login_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      clients: {
        Row: {
          id: string
          organization_id: string
          assigned_coach_id: string | null
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          company: string | null
          title: string | null
          status: ClientStatus
          source: string | null
          tags: string[] | null
          address: Json | null
          social_profiles: Json | null
          goals: string[] | null
          challenges: string[] | null
          notes: string | null
          progress_score: number
          milestones_achieved: number
          total_sessions: number
          completed_sessions: number
          lifetime_value: number
          total_paid: number
          outstanding_balance: number
          last_interaction_at: string | null
          next_follow_up_date: string | null
          satisfaction_score: number | null
          custom_fields: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at' | 'progress_score' | 'milestones_achieved' | 'total_sessions' | 'completed_sessions' | 'lifetime_value' | 'total_paid' | 'outstanding_balance'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      programs: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string | null
          name: string
          description: string | null
          image_url: string | null
          duration_weeks: number | null
          session_count: number | null
          price: number | null
          currency: string
          is_recurring: boolean
          billing_cycle: string | null
          modules: Json
          resources: Json
          is_active: boolean
          max_participants: number | null
          is_private: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['programs']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          coach_id: string
          program_id: string | null
          title: string
          description: string | null
          session_type: string | null
          scheduled_at: string
          duration_minutes: number
          end_time: string | null
          timezone: string
          status: SessionStatus
          meeting_url: string | null
          meeting_platform: string | null
          location: string | null
          pre_session_notes: string | null
          session_notes: string | null
          action_items: Json
          reminder_sent: boolean
          reminder_sent_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      payments: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          amount: number
          currency: string
          status: PaymentStatus
          payment_gateway: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          invoice_number: string | null
          invoice_url: string | null
          description: string | null
          program_id: string | null
          session_id: string | null
          payment_method: string | null
          paid_at: string | null
          due_date: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string | null
          assigned_to_id: string | null
          client_id: string | null
          title: string
          description: string | null
          priority: TaskPriority
          status: TaskStatus
          due_date: string | null
          completed_at: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      automations: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string | null
          name: string
          description: string | null
          is_active: boolean
          trigger_type: TriggerType
          trigger_config: Json
          conditions: Json
          actions: Json
          execution_count: number
          last_executed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['automations']['Row'], 'id' | 'created_at' | 'updated_at' | 'execution_count'>
        Update: Partial<Database['public']['Tables']['automations']['Insert']>
      }
      templates: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string | null
          name: string
          description: string | null
          channel: CommunicationChannel
          category: string | null
          subject: string | null
          body: string
          variables: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['templates']['Insert']>
      }
      communications: {
        Row: {
          id: string
          organization_id: string
          client_id: string | null
          user_id: string | null
          channel: CommunicationChannel
          direction: string | null
          subject: string | null
          content: string
          status: string | null
          sent_at: string | null
          delivered_at: string | null
          read_at: string | null
          external_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['communications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['communications']['Insert']>
      }
      notes: {
        Row: {
          id: string
          organization_id: string
          created_by_id: string
          client_id: string | null
          session_id: string | null
          title: string | null
          content: string
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
    }
    Views: {}
    Functions: {
      get_dashboard_analytics: {
        Args: { org_id: string; date_from: string; date_to: string }
        Returns: Json
      }
      search_clients: {
        Args: {
          org_id: string
          search_query?: string
          filter_status?: ClientStatus
          filter_tags?: string[]
          limit_count?: number
          offset_count?: number
        }
        Returns: Database['public']['Tables']['clients']['Row'][]
      }
      get_upcoming_sessions: {
        Args: {
          org_id: string
          user_id_filter?: string
          days_ahead?: number
        }
        Returns: {
          id: string
          title: string
          scheduled_at: string
          duration_minutes: number
          status: SessionStatus
          client_name: string
          client_email: string
          coach_name: string
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      subscription_plan: SubscriptionPlan
      subscription_status: SubscriptionStatus
      client_status: ClientStatus
      session_status: SessionStatus
      payment_status: PaymentStatus
      communication_channel: CommunicationChannel
      task_priority: TaskPriority
      task_status: TaskStatus
      trigger_type: TriggerType
      action_type: ActionType
    }
  }
}
