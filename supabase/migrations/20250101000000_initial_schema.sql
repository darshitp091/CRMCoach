-- =====================================================
-- COACHING & CONSULTING CRM - INITIAL SCHEMA MIGRATION
-- =====================================================
-- This migration creates the complete database structure
-- for a full-featured Coaching & Consulting CRM SaaS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'coach', 'member');

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'professional', 'business', 'enterprise');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'past_due');

-- Client status
CREATE TYPE client_status AS ENUM ('lead', 'prospect', 'active', 'inactive', 'churned');

-- Session status
CREATE TYPE session_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Automation trigger types
CREATE TYPE trigger_type AS ENUM (
  'client_created',
  'session_scheduled',
  'session_completed',
  'payment_received',
  'payment_failed',
  'milestone_achieved',
  'inactivity_detected',
  'subscription_expiring',
  'custom'
);

-- Automation action types
CREATE TYPE action_type AS ENUM (
  'send_email',
  'send_whatsapp',
  'send_sms',
  'create_task',
  'update_client',
  'webhook',
  'custom'
);

-- Communication channel
CREATE TYPE communication_channel AS ENUM ('email', 'whatsapp', 'sms', 'in_app', 'call');

-- Task priority
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Task status
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  industry VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address JSONB,

  -- Subscription info
  subscription_plan subscription_plan DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'trial',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,

  -- Billing
  razorpay_customer_id VARCHAR(255),
  razorpay_subscription_id VARCHAR(255),
  billing_email VARCHAR(255),

  -- Settings
  settings JSONB DEFAULT '{
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "date_format": "DD/MM/YYYY",
    "time_format": "12h",
    "language": "en",
    "session_duration_default": 60,
    "booking_buffer_time": 15,
    "auto_confirm_sessions": false,
    "send_reminders": true,
    "reminder_hours_before": 24
  }'::jsonb,

  -- Branding
  branding JSONB DEFAULT '{
    "primary_color": "#6366F1",
    "secondary_color": "#10B981",
    "accent_color": "#F97316"
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Profile
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  bio TEXT,
  title VARCHAR(100),

  -- Role & Permissions
  role user_role DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Coaching specific
  specializations TEXT[],
  hourly_rate DECIMAL(10, 2),

  -- Preferences
  preferences JSONB DEFAULT '{
    "email_notifications": true,
    "whatsapp_notifications": true,
    "sms_notifications": false,
    "notification_sound": true
  }'::jsonb,

  -- Metadata
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- CLIENTS TABLE
-- =====================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_coach_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Basic Info
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  company VARCHAR(255),
  title VARCHAR(100),

  -- Status & Classification
  status client_status DEFAULT 'lead',
  source VARCHAR(100), -- website, referral, social, etc.
  tags TEXT[],

  -- Contact Info
  address JSONB,
  social_profiles JSONB, -- linkedin, twitter, etc.

  -- Coaching Details
  goals TEXT[],
  challenges TEXT[],
  notes TEXT,

  -- Progress Tracking
  progress_score INTEGER DEFAULT 0 CHECK (progress_score >= 0 AND progress_score <= 100),
  milestones_achieved INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,

  -- Financial
  lifetime_value DECIMAL(10, 2) DEFAULT 0,
  total_paid DECIMAL(10, 2) DEFAULT 0,
  outstanding_balance DECIMAL(10, 2) DEFAULT 0,

  -- Engagement
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_date DATE,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),

  -- Custom Fields
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(organization_id, email)
);

-- Indexes
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_clients_assigned_coach_id ON clients(assigned_coach_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_tags ON clients USING GIN(tags);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- =====================================================
-- PROGRAMS TABLE (Coaching/Consulting Programs)
-- =====================================================

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Program Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  duration_weeks INTEGER,
  session_count INTEGER,

  -- Pricing
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  is_recurring BOOLEAN DEFAULT false,
  billing_cycle VARCHAR(20), -- monthly, quarterly, yearly

  -- Program Structure
  modules JSONB DEFAULT '[]'::jsonb, -- Array of modules/lessons
  resources JSONB DEFAULT '[]'::jsonb, -- Array of downloadable resources

  -- Settings
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  is_private BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_programs_organization_id ON programs(organization_id);
CREATE INDEX idx_programs_is_active ON programs(is_active);

-- =====================================================
-- CLIENT_PROGRAMS TABLE (Client Enrollments)
-- =====================================================

CREATE TABLE client_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Enrollment Info
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled

  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_modules INTEGER DEFAULT 0,
  current_module INTEGER DEFAULT 1,

  -- Payment
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(client_id, program_id)
);

-- Indexes
CREATE INDEX idx_client_programs_client_id ON client_programs(client_id);
CREATE INDEX idx_client_programs_program_id ON client_programs(program_id);
CREATE INDEX idx_client_programs_organization_id ON client_programs(organization_id);

-- =====================================================
-- SESSIONS TABLE (Coaching Sessions/Appointments)
-- =====================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,

  -- Session Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_type VARCHAR(100), -- one-on-one, group, workshop, etc.

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  end_time TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',

  -- Status
  status session_status DEFAULT 'scheduled',

  -- Meeting Info
  meeting_url TEXT,
  meeting_platform VARCHAR(50), -- zoom, google-meet, teams, in-person
  location TEXT,

  -- Session Notes
  pre_session_notes TEXT,
  session_notes TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_sessions_organization_id ON sessions(organization_id);
CREATE INDEX idx_sessions_client_id ON sessions(client_id);
CREATE INDEX idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status payment_status DEFAULT 'pending',

  -- Payment Gateway
  payment_gateway VARCHAR(50) DEFAULT 'razorpay',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),

  -- Invoice
  invoice_number VARCHAR(100) UNIQUE,
  invoice_url TEXT,
  description TEXT,

  -- Related Entities
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  -- Payment Method
  payment_method VARCHAR(50), -- card, upi, netbanking, wallet

  -- Dates
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- =====================================================
-- TASKS TABLE
-- =====================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- Task Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'todo',

  -- Dates
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Relationships
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- AUTOMATIONS TABLE
-- =====================================================

CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Automation Config
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Trigger
  trigger_type trigger_type NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,

  -- Conditions (optional filters)
  conditions JSONB DEFAULT '[]'::jsonb,

  -- Actions
  actions JSONB NOT NULL, -- Array of actions to perform

  -- Statistics
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automations_organization_id ON automations(organization_id);
CREATE INDEX idx_automations_is_active ON automations(is_active);
CREATE INDEX idx_automations_trigger_type ON automations(trigger_type);

-- =====================================================
-- AUTOMATION_LOGS TABLE
-- =====================================================

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Execution Details
  triggered_by VARCHAR(50), -- system, user, webhook
  trigger_data JSONB,

  -- Results
  status VARCHAR(50), -- success, failed, partial
  actions_executed JSONB,
  error_message TEXT,

  -- Metadata
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automation_logs_automation_id ON automation_logs(automation_id);
CREATE INDEX idx_automation_logs_organization_id ON automation_logs(organization_id);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs(executed_at DESC);

-- =====================================================
-- COMMUNICATIONS TABLE
-- =====================================================

CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Communication Details
  channel communication_channel NOT NULL,
  direction VARCHAR(20), -- inbound, outbound
  subject VARCHAR(500),
  content TEXT NOT NULL,

  -- Status
  status VARCHAR(50), -- sent, delivered, read, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- External IDs
  external_id VARCHAR(255), -- WhatsApp message ID, email ID, etc.

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communications_organization_id ON communications(organization_id);
CREATE INDEX idx_communications_client_id ON communications(client_id);
CREATE INDEX idx_communications_channel ON communications(channel);
CREATE INDEX idx_communications_created_at ON communications(created_at DESC);

-- =====================================================
-- NOTES TABLE
-- =====================================================

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

  -- Note Content
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_organization_id ON notes(organization_id);
CREATE INDEX idx_notes_client_id ON notes(client_id);
CREATE INDEX idx_notes_session_id ON notes(session_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- =====================================================
-- TEMPLATES TABLE (Email/WhatsApp/SMS Templates)
-- =====================================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Template Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel communication_channel NOT NULL,
  category VARCHAR(100), -- reminder, welcome, follow_up, etc.

  -- Content
  subject VARCHAR(500),
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Available placeholders

  -- Settings
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_organization_id ON templates(organization_id);
CREATE INDEX idx_templates_channel ON templates(channel);
CREATE INDEX idx_templates_category ON templates(category);

-- =====================================================
-- ANALYTICS_EVENTS TABLE (for tracking user actions)
-- =====================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Event Details
  event_name VARCHAR(255) NOT NULL,
  event_category VARCHAR(100),
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_events_organization_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: Auto-update updated_at columns
-- =====================================================

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_programs_updated_at BEFORE UPDATE ON client_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organizations IS 'Stores organization/company information and subscription details';
COMMENT ON TABLE users IS 'Extended user profile data linked to Supabase auth.users';
COMMENT ON TABLE clients IS 'Coaching/consulting clients and leads';
COMMENT ON TABLE programs IS 'Coaching programs and packages';
COMMENT ON TABLE client_programs IS 'Client enrollments in programs';
COMMENT ON TABLE sessions IS 'Coaching sessions and appointments';
COMMENT ON TABLE payments IS 'Payment records with Razorpay integration';
COMMENT ON TABLE tasks IS 'Tasks and to-dos for coaches and clients';
COMMENT ON TABLE automations IS 'Automation workflows and triggers';
COMMENT ON TABLE automation_logs IS 'Execution logs for automations';
COMMENT ON TABLE communications IS 'Communication history across all channels';
COMMENT ON TABLE notes IS 'Internal and client notes';
COMMENT ON TABLE templates IS 'Message templates for emails, WhatsApp, SMS';
COMMENT ON TABLE analytics_events IS 'Event tracking for analytics and insights';
