-- =====================================================
-- AI FEATURES & WHATSAPP INTEGRATION
-- =====================================================
-- This migration adds support for:
-- 1. AI session summaries
-- 2. AI client insights
-- 3. Churn prediction
-- 4. WhatsApp messaging
-- =====================================================

-- =====================================================
-- Add AI columns to sessions table
-- =====================================================

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_key_points TEXT[];
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_action_items TEXT[];
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_breakthroughs TEXT[];
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_sentiment VARCHAR(20); -- 'positive', 'neutral', 'challenging'
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_tags TEXT[];
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN sessions.ai_summary IS 'AI-generated summary of the session';
COMMENT ON COLUMN sessions.ai_key_points IS 'Key discussion points extracted by AI';
COMMENT ON COLUMN sessions.ai_action_items IS 'Action items identified by AI';
COMMENT ON COLUMN sessions.ai_sentiment IS 'Overall sentiment: positive, neutral, or challenging';

-- =====================================================
-- Add AI columns to clients table
-- =====================================================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS ai_insights JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ai_insights_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS churn_risk_score INT; -- 0-100
ALTER TABLE clients ADD COLUMN IF NOT EXISTS churn_risk_level VARCHAR(20); -- 'low', 'medium', 'high', 'critical'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS churn_prediction_date TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN clients.ai_insights IS 'AI-generated insights about client progress, patterns, and recommendations';
COMMENT ON COLUMN clients.churn_risk_score IS 'Churn risk score from 0 (low) to 100 (high)';
COMMENT ON COLUMN clients.churn_risk_level IS 'Risk level: low, medium, high, critical';

-- =====================================================
-- TABLE: whatsapp_messages
-- Stores all WhatsApp message history
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Message Details
  direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
  from_phone VARCHAR(20),
  to_phone VARCHAR(20),
  message_text TEXT,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'document', 'audio', 'voice', 'template'

  -- WhatsApp API Details
  whatsapp_message_id VARCHAR(100),
  whatsapp_conversation_id VARCHAR(100),

  -- Status Tracking
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed', 'received'
  error_message TEXT,

  -- Media Details (for images, documents, etc.)
  media_url TEXT,
  media_filename TEXT,
  media_mime_type VARCHAR(100),

  -- Template Details (for business-initiated messages)
  template_name VARCHAR(100),
  template_language VARCHAR(10),

  -- User Context
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL, -- For outbound messages

  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_whatsapp_messages_org ON whatsapp_messages(organization_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_client ON whatsapp_messages(client_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction, status);
CREATE INDEX idx_whatsapp_messages_wa_id ON whatsapp_messages(whatsapp_message_id);

-- Comments
COMMENT ON TABLE whatsapp_messages IS 'Stores all WhatsApp message history (inbound and outbound)';
COMMENT ON COLUMN whatsapp_messages.direction IS 'inbound = received from client, outbound = sent to client';
COMMENT ON COLUMN whatsapp_messages.status IS 'pending, sent, delivered, read, failed, received';

-- =====================================================
-- TABLE: ai_usage_log
-- Track AI API usage for cost monitoring
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- AI Operation Details
  operation_type VARCHAR(50) NOT NULL, -- 'session_summary', 'churn_prediction', 'client_insights'
  resource_id UUID, -- Session ID, Client ID, etc.

  -- Token Usage
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,

  -- Cost
  estimated_cost DECIMAL(10, 4) DEFAULT 0, -- In INR

  -- Model Details
  model_used VARCHAR(50) DEFAULT 'claude-sonnet-4',
  processing_time_ms INT,

  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_org_date ON ai_usage_log(organization_id, created_at DESC);
CREATE INDEX idx_ai_usage_type ON ai_usage_log(operation_type, created_at DESC);

COMMENT ON TABLE ai_usage_log IS 'Tracks all AI API usage for cost monitoring and analytics';

-- =====================================================
-- TABLE: whatsapp_templates
-- Store approved message templates
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template Details
  template_name VARCHAR(100) NOT NULL,
  template_language VARCHAR(10) DEFAULT 'en',
  template_category VARCHAR(50), -- 'marketing', 'utility', 'authentication'

  -- Template Content
  header_text TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,

  -- Variables
  variables JSONB DEFAULT '[]', -- Array of variable names like ["client_name", "session_date"]

  -- WhatsApp API Details
  whatsapp_template_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'

  -- Usage Stats
  times_used INT DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, template_name)
);

CREATE INDEX idx_whatsapp_templates_org ON whatsapp_templates(organization_id, status);

COMMENT ON TABLE whatsapp_templates IS 'Stores WhatsApp message templates (must be approved by Meta)';

-- =====================================================
-- FUNCTION: Get client WhatsApp conversation history
-- =====================================================

CREATE OR REPLACE FUNCTION get_whatsapp_conversation(
  client_id_param UUID,
  limit_param INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  direction VARCHAR(10),
  message_text TEXT,
  message_type VARCHAR(20),
  status VARCHAR(20),
  sent_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wm.id,
    wm.direction,
    wm.message_text,
    wm.message_type,
    wm.status,
    u.full_name as sent_by_name,
    wm.created_at
  FROM whatsapp_messages wm
  LEFT JOIN users u ON wm.sent_by = u.id
  WHERE wm.client_id = client_id_param
  ORDER BY wm.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_whatsapp_conversation IS 'Gets WhatsApp conversation history for a client';

-- =====================================================
-- FUNCTION: Get clients at churn risk
-- =====================================================

CREATE OR REPLACE FUNCTION get_high_churn_risk_clients(
  org_id UUID,
  risk_threshold INT DEFAULT 50
)
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  churn_risk_score INT,
  churn_risk_level VARCHAR(20),
  last_session_date TIMESTAMP WITH TIME ZONE,
  days_since_last_session INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as client_id,
    c.full_name as client_name,
    c.churn_risk_score,
    c.churn_risk_level,
    (
      SELECT s.scheduled_at
      FROM sessions s
      WHERE s.client_id = c.id AND s.status = 'completed'
      ORDER BY s.scheduled_at DESC
      LIMIT 1
    ) as last_session_date,
    EXTRACT(DAY FROM NOW() - (
      SELECT s.scheduled_at
      FROM sessions s
      WHERE s.client_id = c.id AND s.status = 'completed'
      ORDER BY s.scheduled_at DESC
      LIMIT 1
    ))::INT as days_since_last_session
  FROM clients c
  WHERE c.organization_id = org_id
    AND c.churn_risk_score >= risk_threshold
    AND c.deleted_at IS NULL
  ORDER BY c.churn_risk_score DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_high_churn_risk_clients IS 'Returns clients with high churn risk for intervention';

-- =====================================================
-- FUNCTION: Update WhatsApp template usage stats
-- =====================================================

CREATE OR REPLACE FUNCTION increment_template_usage(template_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE whatsapp_templates
  SET
    times_used = times_used + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = template_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Grant permissions
-- =====================================================

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their organization's WhatsApp messages
CREATE POLICY whatsapp_messages_select_policy ON whatsapp_messages
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policy: Users can insert WhatsApp messages for their organization
CREATE POLICY whatsapp_messages_insert_policy ON whatsapp_messages
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policy: AI usage log is view-only for organization members
CREATE POLICY ai_usage_log_select_policy ON ai_usage_log
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policy: WhatsApp templates
CREATE POLICY whatsapp_templates_all_policy ON whatsapp_templates
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON POLICY whatsapp_messages_select_policy ON whatsapp_messages IS 'Users can view their organization WhatsApp messages';
COMMENT ON POLICY ai_usage_log_select_policy ON ai_usage_log IS 'Users can view their organization AI usage';
