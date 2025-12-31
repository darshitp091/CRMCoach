-- =====================================================
-- USAGE TRACKING & COST MONITORING SYSTEM
-- =====================================================
-- This migration creates tables and functions for tracking
-- resource usage, enforcing limits, and monitoring costs
-- =====================================================

-- =====================================================
-- TABLE: organization_usage
-- Tracks monthly usage metrics per organization
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  billing_period DATE NOT NULL, -- First day of the billing month

  -- Client & Team Usage
  clients_count INT DEFAULT 0,
  active_clients_count INT DEFAULT 0,
  team_members_count INT DEFAULT 0,

  -- Session Usage
  sessions_count INT DEFAULT 0,
  completed_sessions_count INT DEFAULT 0,

  -- Storage Usage (in bytes, convert to GB when displaying)
  storage_used_bytes BIGINT DEFAULT 0,

  -- Communication Usage
  emails_sent INT DEFAULT 0,
  sms_sent INT DEFAULT 0,
  whatsapp_sent INT DEFAULT 0,

  -- Video Calling Usage (in minutes)
  video_minutes_used INT DEFAULT 0,
  video_participants_minutes INT DEFAULT 0, -- Total participant-minutes

  -- AI Features Usage
  ai_summaries_generated INT DEFAULT 0,
  ai_insights_generated INT DEFAULT 0,
  transcription_minutes_used INT DEFAULT 0,

  -- Automation Usage
  automations_count INT DEFAULT 0,
  automation_executions INT DEFAULT 0,

  -- Overage Tracking
  overage_charges DECIMAL(10, 2) DEFAULT 0,
  overage_details JSONB DEFAULT '{}',

  -- Cost Tracking (internal)
  estimated_monthly_cost DECIMAL(10, 2) DEFAULT 0,
  actual_cost_to_date DECIMAL(10, 2) DEFAULT 0,
  cost_alerts_sent INT DEFAULT 0,
  last_cost_alert_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one record per org per billing period
  UNIQUE(organization_id, billing_period)
);

-- Create indexes for fast lookups
CREATE INDEX idx_org_usage_org_period ON organization_usage(organization_id, billing_period);
CREATE INDEX idx_org_usage_period ON organization_usage(billing_period);
CREATE INDEX idx_org_usage_cost_alerts ON organization_usage(organization_id) WHERE cost_alerts_sent > 0;

-- Add comments
COMMENT ON TABLE organization_usage IS 'Tracks monthly resource usage and costs per organization';
COMMENT ON COLUMN organization_usage.video_participants_minutes IS 'Total participant-minutes (e.g., 2 people on 30-min call = 60 participant-minutes)';
COMMENT ON COLUMN organization_usage.estimated_monthly_cost IS 'Expected cost based on plan (internal use only)';
COMMENT ON COLUMN organization_usage.actual_cost_to_date IS 'Actual accumulated cost this billing period (internal use only)';

-- =====================================================
-- TABLE: usage_alerts
-- Stores usage alert history
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'usage_warning', 'usage_limit', 'cost_warning', 'cost_critical'
  resource_type VARCHAR(50) NOT NULL, -- 'emails', 'video', 'ai_summaries', etc.
  current_usage INT NOT NULL,
  limit_value INT NOT NULL,
  usage_percentage INT NOT NULL, -- e.g., 85 for 85% of limit
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_alerts_org ON usage_alerts(organization_id, created_at DESC);
CREATE INDEX idx_usage_alerts_unack ON usage_alerts(organization_id) WHERE acknowledged = FALSE;

COMMENT ON TABLE usage_alerts IS 'History of usage and cost alerts sent to organizations';

-- =====================================================
-- TABLE: cost_tracking_log
-- Detailed log of costs incurred per organization
-- =====================================================

CREATE TABLE IF NOT EXISTS cost_tracking_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL, -- 'video', 'ai_summary', 'transcription', 'sms', 'whatsapp', etc.
  resource_id UUID, -- Optional: ID of related resource (session, etc.)
  quantity INT DEFAULT 1,
  unit_cost DECIMAL(10, 4) NOT NULL, -- Cost per unit in INR
  total_cost DECIMAL(10, 4) NOT NULL, -- Total cost for this event
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cost_log_org_date ON cost_tracking_log(organization_id, created_at DESC);
CREATE INDEX idx_cost_log_type ON cost_tracking_log(cost_type, created_at DESC);

COMMENT ON TABLE cost_tracking_log IS 'Detailed log of every cost event for internal monitoring';

-- =====================================================
-- FUNCTION: Get or create usage record for current period
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_usage_record(org_id UUID)
RETURNS organization_usage AS $$
DECLARE
  current_period DATE;
  usage_record organization_usage;
BEGIN
  -- Get first day of current month
  current_period := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  -- Try to get existing record
  SELECT * INTO usage_record
  FROM organization_usage
  WHERE organization_id = org_id
    AND billing_period = current_period;

  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO organization_usage (organization_id, billing_period)
    VALUES (org_id, current_period)
    RETURNING * INTO usage_record;
  END IF;

  RETURN usage_record;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_current_usage_record(UUID) IS 'Gets or creates usage tracking record for current billing period';

-- =====================================================
-- FUNCTION: Increment usage counter
-- =====================================================

CREATE OR REPLACE FUNCTION increment_usage(
  org_id UUID,
  usage_type VARCHAR(50),
  amount INT DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  current_period DATE;
  column_name TEXT;
BEGIN
  current_period := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  -- Map usage_type to column name
  column_name := CASE usage_type
    WHEN 'email' THEN 'emails_sent'
    WHEN 'sms' THEN 'sms_sent'
    WHEN 'whatsapp' THEN 'whatsapp_sent'
    WHEN 'video_minutes' THEN 'video_minutes_used'
    WHEN 'video_participant_minutes' THEN 'video_participants_minutes'
    WHEN 'ai_summary' THEN 'ai_summaries_generated'
    WHEN 'ai_insight' THEN 'ai_insights_generated'
    WHEN 'transcription_minutes' THEN 'transcription_minutes_used'
    WHEN 'session' THEN 'sessions_count'
    WHEN 'automation_execution' THEN 'automation_executions'
    ELSE NULL
  END;

  IF column_name IS NULL THEN
    RAISE EXCEPTION 'Invalid usage type: %', usage_type;
  END IF;

  -- Insert or update usage record
  INSERT INTO organization_usage (
    organization_id,
    billing_period
  )
  VALUES (org_id, current_period)
  ON CONFLICT (organization_id, billing_period)
  DO NOTHING;

  -- Update the specific counter using dynamic SQL
  EXECUTE format(
    'UPDATE organization_usage SET %I = %I + $1, updated_at = NOW() WHERE organization_id = $2 AND billing_period = $3',
    column_name, column_name
  ) USING amount, org_id, current_period;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_usage(UUID, VARCHAR, INT) IS 'Increments a specific usage counter for an organization';

-- =====================================================
-- FUNCTION: Track cost event
-- =====================================================

CREATE OR REPLACE FUNCTION track_cost(
  org_id UUID,
  cost_type_param VARCHAR(50),
  quantity_param INT,
  unit_cost_param DECIMAL,
  metadata_param JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
  total_cost_param DECIMAL;
  current_period DATE;
BEGIN
  total_cost_param := quantity_param * unit_cost_param;
  current_period := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  -- Log the cost event
  INSERT INTO cost_tracking_log (
    organization_id,
    cost_type,
    quantity,
    unit_cost,
    total_cost,
    metadata
  ) VALUES (
    org_id,
    cost_type_param,
    quantity_param,
    unit_cost_param,
    total_cost_param,
    metadata_param
  );

  -- Update actual cost in usage record
  INSERT INTO organization_usage (
    organization_id,
    billing_period,
    actual_cost_to_date
  )
  VALUES (org_id, current_period, total_cost_param)
  ON CONFLICT (organization_id, billing_period)
  DO UPDATE SET
    actual_cost_to_date = organization_usage.actual_cost_to_date + total_cost_param,
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION track_cost(UUID, VARCHAR, INT, DECIMAL, JSONB) IS 'Tracks a cost event and updates running total';

-- =====================================================
-- FUNCTION: Check if usage limit exceeded
-- =====================================================

CREATE OR REPLACE FUNCTION check_usage_limit(
  org_id UUID,
  limit_type VARCHAR(50)
)
RETURNS JSON AS $$
DECLARE
  org_record RECORD;
  usage_record organization_usage;
  plan_limit INT;
  current_usage INT;
  result JSON;
BEGIN
  -- Get organization and plan
  SELECT * INTO org_record FROM organizations WHERE id = org_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'allowed', false,
      'error', 'Organization not found'
    );
  END IF;

  -- Get current usage
  usage_record := get_current_usage_record(org_id);

  -- Get plan limits based on subscription_plan
  -- This is a simplified version - in production, you'd query a limits table
  plan_limit := CASE org_record.subscription_plan
    WHEN 'standard' THEN
      CASE limit_type
        WHEN 'clients' THEN 25
        WHEN 'emails' THEN 500
        WHEN 'sms' THEN 25
        WHEN 'whatsapp' THEN 0
        WHEN 'video_minutes' THEN 0
        WHEN 'ai_summaries' THEN 0
        ELSE -1 -- unlimited
      END
    WHEN 'pro' THEN
      CASE limit_type
        WHEN 'clients' THEN 100
        WHEN 'emails' THEN 2000
        WHEN 'sms' THEN 100
        WHEN 'whatsapp' THEN 500
        WHEN 'video_minutes' THEN 3000
        WHEN 'ai_summaries' THEN 80
        WHEN 'ai_insights' THEN 20
        ELSE -1 -- unlimited
      END
    WHEN 'premium' THEN
      CASE limit_type
        WHEN 'emails' THEN 10000
        WHEN 'sms' THEN 300
        WHEN 'whatsapp' THEN 2000
        WHEN 'video_minutes' THEN 12000
        WHEN 'ai_insights' THEN 200
        WHEN 'transcription_minutes' THEN 4800 -- 80 hours
        ELSE -1 -- unlimited
      END
    ELSE -1
  END;

  -- Get current usage for this limit type
  current_usage := CASE limit_type
    WHEN 'emails' THEN usage_record.emails_sent
    WHEN 'sms' THEN usage_record.sms_sent
    WHEN 'whatsapp' THEN usage_record.whatsapp_sent
    WHEN 'video_minutes' THEN usage_record.video_participants_minutes
    WHEN 'ai_summaries' THEN usage_record.ai_summaries_generated
    WHEN 'ai_insights' THEN usage_record.ai_insights_generated
    WHEN 'transcription_minutes' THEN usage_record.transcription_minutes_used
    WHEN 'clients' THEN usage_record.active_clients_count
    ELSE 0
  END;

  -- Check if limit exceeded
  IF plan_limit = -1 THEN
    -- Unlimited
    result := json_build_object(
      'allowed', true,
      'limit', 'unlimited',
      'current', current_usage,
      'remaining', -1
    );
  ELSIF plan_limit = 0 THEN
    -- Feature not available
    result := json_build_object(
      'allowed', false,
      'limit', 0,
      'current', current_usage,
      'remaining', 0,
      'message', 'Feature not available in your plan. Please upgrade.'
    );
  ELSIF current_usage >= plan_limit THEN
    -- Limit exceeded
    result := json_build_object(
      'allowed', false,
      'limit', plan_limit,
      'current', current_usage,
      'remaining', 0,
      'message', format('Usage limit exceeded. %s/%s used. Upgrade or purchase add-ons.', current_usage, plan_limit)
    );
  ELSE
    -- Within limit
    result := json_build_object(
      'allowed', true,
      'limit', plan_limit,
      'current', current_usage,
      'remaining', plan_limit - current_usage
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_usage_limit(UUID, VARCHAR) IS 'Checks if organization has exceeded usage limit for a resource type';

-- =====================================================
-- FUNCTION: Update usage counts from actual data
-- =====================================================

CREATE OR REPLACE FUNCTION update_usage_from_actuals()
RETURNS VOID AS $$
DECLARE
  current_period DATE;
  org RECORD;
BEGIN
  current_period := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  -- Update for each organization
  FOR org IN SELECT id FROM organizations LOOP
    -- Update client counts
    UPDATE organization_usage
    SET
      clients_count = (SELECT COUNT(*) FROM clients WHERE organization_id = org.id AND deleted_at IS NULL),
      active_clients_count = (SELECT COUNT(*) FROM clients WHERE organization_id = org.id AND status = 'active' AND deleted_at IS NULL),
      team_members_count = (SELECT COUNT(*) FROM organization_members WHERE organization_id = org.id),
      sessions_count = (SELECT COUNT(*) FROM sessions WHERE organization_id = org.id AND deleted_at IS NULL AND scheduled_at >= current_period),
      completed_sessions_count = (SELECT COUNT(*) FROM sessions WHERE organization_id = org.id AND status = 'completed' AND deleted_at IS NULL AND scheduled_at >= current_period),
      automations_count = (SELECT COUNT(*) FROM automations WHERE organization_id = org.id AND is_active = true),
      updated_at = NOW()
    WHERE organization_id = org.id AND billing_period = current_period;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_usage_from_actuals() IS 'Updates usage counts based on actual database records (run daily via cron)';

-- =====================================================
-- TRIGGER: Auto-update clients count
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_client_count()
RETURNS TRIGGER AS $$
DECLARE
  current_period DATE;
BEGIN
  current_period := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE organization_usage
    SET
      clients_count = (SELECT COUNT(*) FROM clients WHERE organization_id = NEW.organization_id AND deleted_at IS NULL),
      active_clients_count = (SELECT COUNT(*) FROM clients WHERE organization_id = NEW.organization_id AND status = 'active' AND deleted_at IS NULL),
      updated_at = NOW()
    WHERE organization_id = NEW.organization_id AND billing_period = current_period;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_count_update
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_client_count();

-- =====================================================
-- Grant permissions
-- =====================================================

-- Grant access to authenticated users (via RLS policies)
ALTER TABLE organization_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own organization's usage
CREATE POLICY usage_select_policy ON organization_usage
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY alerts_select_policy ON usage_alerts
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Cost logs are internal only - no direct access
CREATE POLICY cost_log_admin_only ON cost_tracking_log
  FOR ALL
  USING (false);

-- =====================================================
-- Initialize usage records for existing organizations
-- =====================================================

INSERT INTO organization_usage (organization_id, billing_period)
SELECT id, DATE_TRUNC('month', CURRENT_DATE)::DATE
FROM organizations
ON CONFLICT (organization_id, billing_period) DO NOTHING;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TRIGGER trigger_client_count_update ON clients IS 'Automatically updates client count in usage tracking when clients are added/modified';
