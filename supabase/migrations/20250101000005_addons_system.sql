-- =====================================================
-- ADD-ONS SUBSCRIPTION SYSTEM
-- =====================================================
-- This migration creates tables and functions for managing
-- add-on purchases, subscriptions, and billing
-- =====================================================

-- =====================================================
-- TABLE: organization_addons
-- Tracks add-on subscriptions per organization
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Add-on Details
  addon_type VARCHAR(50) NOT NULL, -- 'clients', 'team_members', 'storage', 'emails', 'sms', 'whatsapp', 'video', 'transcription', 'ai_summaries'
  addon_package VARCHAR(50), -- 'package30', 'package100', 'unlimited' (for transcription), NULL for usage-based

  -- Quantity & Pricing
  quantity INT DEFAULT 1, -- For countable add-ons (clients, team members, storage GB)
  price_paid DECIMAL(10, 2) NOT NULL, -- Amount paid in INR

  -- Subscription Details
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'one_time'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'

  -- Limits (for package-based add-ons like transcription)
  monthly_limit INT, -- e.g., 30 hours for transcription package
  usage_this_month INT DEFAULT 0, -- Track usage against limit

  -- Razorpay Details
  razorpay_subscription_id VARCHAR(100), -- For recurring add-ons
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for one-time, or end date for subscriptions
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Store additional info (original limits, promo codes, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_org_addons_org_id ON organization_addons(organization_id);
CREATE INDEX idx_org_addons_type ON organization_addons(addon_type, status);
CREATE INDEX idx_org_addons_status ON organization_addons(status);
CREATE INDEX idx_org_addons_expires ON organization_addons(expires_at) WHERE status = 'active';

-- Comments
COMMENT ON TABLE organization_addons IS 'Tracks add-on purchases and subscriptions per organization';
COMMENT ON COLUMN organization_addons.addon_type IS 'Type of add-on: clients, team_members, storage, emails, sms, whatsapp, video, transcription, ai_summaries';
COMMENT ON COLUMN organization_addons.addon_package IS 'Package tier for transcription add-ons: package30, package100, unlimited';
COMMENT ON COLUMN organization_addons.monthly_limit IS 'Usage limit for package-based add-ons (e.g., 30 hours transcription)';
COMMENT ON COLUMN organization_addons.usage_this_month IS 'Current usage against monthly_limit for package-based add-ons';

-- =====================================================
-- TABLE: addon_transactions
-- Tracks all add-on purchase transactions
-- =====================================================

CREATE TABLE IF NOT EXISTS addon_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES organization_addons(id) ON DELETE SET NULL,

  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'renewal', 'upgrade', 'downgrade', 'refund', 'overage_charge'
  addon_type VARCHAR(50) NOT NULL,
  addon_package VARCHAR(50),
  quantity INT DEFAULT 1,

  -- Pricing
  amount DECIMAL(10, 2) NOT NULL, -- Amount in INR
  currency VARCHAR(3) DEFAULT 'INR',

  -- Payment Details
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'

  -- Metadata
  description TEXT,
  invoice_url VARCHAR(500), -- Razorpay invoice URL
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addon_txn_org ON addon_transactions(organization_id, created_at DESC);
CREATE INDEX idx_addon_txn_addon ON addon_transactions(addon_id);
CREATE INDEX idx_addon_txn_status ON addon_transactions(payment_status);

COMMENT ON TABLE addon_transactions IS 'Transaction history for all add-on purchases and charges';

-- =====================================================
-- FUNCTION: Get active add-ons for organization
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_addons(org_id UUID)
RETURNS TABLE (
  addon_type VARCHAR(50),
  addon_package VARCHAR(50),
  quantity INT,
  monthly_limit INT,
  usage_this_month INT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oa.addon_type,
    oa.addon_package,
    oa.quantity,
    oa.monthly_limit,
    oa.usage_this_month,
    oa.expires_at
  FROM organization_addons oa
  WHERE oa.organization_id = org_id
    AND oa.status = 'active'
    AND (oa.expires_at IS NULL OR oa.expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_addons(UUID) IS 'Returns all active add-ons for an organization';

-- =====================================================
-- FUNCTION: Purchase add-on
-- =====================================================

CREATE OR REPLACE FUNCTION purchase_addon(
  org_id UUID,
  addon_type_param VARCHAR(50),
  addon_package_param VARCHAR(50),
  quantity_param INT,
  price_param DECIMAL,
  billing_cycle_param VARCHAR(20),
  monthly_limit_param INT DEFAULT NULL,
  razorpay_order_id_param VARCHAR(100) DEFAULT NULL,
  razorpay_payment_id_param VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_addon_id UUID;
  expires_at_param TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate expiration date
  IF billing_cycle_param = 'yearly' THEN
    expires_at_param := NOW() + INTERVAL '1 year';
  ELSIF billing_cycle_param = 'monthly' THEN
    expires_at_param := NOW() + INTERVAL '1 month';
  ELSE
    expires_at_param := NULL; -- One-time purchase
  END IF;

  -- Insert add-on subscription
  INSERT INTO organization_addons (
    organization_id,
    addon_type,
    addon_package,
    quantity,
    price_paid,
    billing_cycle,
    status,
    monthly_limit,
    razorpay_order_id,
    razorpay_payment_id,
    expires_at
  ) VALUES (
    org_id,
    addon_type_param,
    addon_package_param,
    quantity_param,
    price_param,
    billing_cycle_param,
    'active',
    monthly_limit_param,
    razorpay_order_id_param,
    razorpay_payment_id_param,
    expires_at_param
  )
  RETURNING id INTO new_addon_id;

  -- Create transaction record
  INSERT INTO addon_transactions (
    organization_id,
    addon_id,
    transaction_type,
    addon_type,
    addon_package,
    quantity,
    amount,
    razorpay_order_id,
    razorpay_payment_id,
    payment_status,
    description
  ) VALUES (
    org_id,
    new_addon_id,
    'purchase',
    addon_type_param,
    addon_package_param,
    quantity_param,
    price_param,
    razorpay_order_id_param,
    razorpay_payment_id_param,
    'completed',
    format('Purchased %s %s add-on', quantity_param, addon_type_param)
  );

  RETURN new_addon_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION purchase_addon IS 'Creates a new add-on subscription and transaction record';

-- =====================================================
-- FUNCTION: Cancel add-on subscription
-- =====================================================

CREATE OR REPLACE FUNCTION cancel_addon(addon_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  org_id_var UUID;
  addon_type_var VARCHAR(50);
BEGIN
  -- Get organization ID and addon type
  SELECT organization_id, addon_type INTO org_id_var, addon_type_var
  FROM organization_addons
  WHERE id = addon_id_param;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update status to cancelled
  UPDATE organization_addons
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = addon_id_param;

  -- Create transaction record
  INSERT INTO addon_transactions (
    organization_id,
    addon_id,
    transaction_type,
    addon_type,
    amount,
    payment_status,
    description
  ) VALUES (
    org_id_var,
    addon_id_param,
    'cancellation',
    addon_type_var,
    0,
    'completed',
    'Add-on subscription cancelled by user'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cancel_addon(UUID) IS 'Cancels an active add-on subscription';

-- =====================================================
-- FUNCTION: Increment add-on usage (for package-based)
-- =====================================================

CREATE OR REPLACE FUNCTION increment_addon_usage(
  org_id UUID,
  addon_type_param VARCHAR(50),
  amount_param INT
)
RETURNS JSONB AS $$
DECLARE
  addon_record RECORD;
  new_usage INT;
  result JSONB;
BEGIN
  -- Get active add-on
  SELECT * INTO addon_record
  FROM organization_addons
  WHERE organization_id = org_id
    AND addon_type = addon_type_param
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- No active add-on
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active add-on found'
    );
  END IF;

  -- Update usage
  new_usage := addon_record.usage_this_month + amount_param;

  UPDATE organization_addons
  SET
    usage_this_month = new_usage,
    updated_at = NOW()
  WHERE id = addon_record.id;

  -- Check if limit exceeded
  IF addon_record.monthly_limit IS NOT NULL AND new_usage > addon_record.monthly_limit THEN
    result := jsonb_build_object(
      'success', true,
      'warning', 'Limit exceeded',
      'limit', addon_record.monthly_limit,
      'usage', new_usage,
      'overage', new_usage - addon_record.monthly_limit
    );
  ELSE
    result := jsonb_build_object(
      'success', true,
      'limit', addon_record.monthly_limit,
      'usage', new_usage,
      'remaining', COALESCE(addon_record.monthly_limit - new_usage, -1)
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_addon_usage IS 'Increments usage for package-based add-ons (e.g., transcription)';

-- =====================================================
-- FUNCTION: Get add-on usage summary
-- =====================================================

CREATE OR REPLACE FUNCTION get_addon_usage_summary(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'addon_type', addon_type,
      'addon_package', addon_package,
      'quantity', quantity,
      'monthly_limit', monthly_limit,
      'usage_this_month', usage_this_month,
      'usage_percentage', CASE
        WHEN monthly_limit IS NOT NULL AND monthly_limit > 0
        THEN ROUND((usage_this_month::DECIMAL / monthly_limit::DECIMAL) * 100, 2)
        ELSE NULL
      END,
      'expires_at', expires_at
    )
  ) INTO result
  FROM organization_addons
  WHERE organization_id = org_id
    AND status = 'active';

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_addon_usage_summary IS 'Returns usage summary for all active add-ons';

-- =====================================================
-- FUNCTION: Reset monthly usage for add-ons
-- =====================================================

CREATE OR REPLACE FUNCTION reset_addon_monthly_usage()
RETURNS VOID AS $$
BEGIN
  -- Reset usage_this_month for all active add-ons at start of new billing period
  UPDATE organization_addons
  SET
    usage_this_month = 0,
    updated_at = NOW()
  WHERE status = 'active'
    AND billing_cycle IN ('monthly', 'yearly');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_addon_monthly_usage IS 'Resets monthly usage counters (run via cron on 1st of month)';

-- =====================================================
-- FUNCTION: Process overage charges
-- =====================================================

CREATE OR REPLACE FUNCTION process_overage_charges(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  usage_record RECORD;
  total_overage DECIMAL := 0;
  overage_details JSONB := '[]'::jsonb;
  plan_record RECORD;
BEGIN
  -- Get organization plan
  SELECT subscription_plan INTO plan_record
  FROM organizations
  WHERE id = org_id;

  -- Get current month's usage
  SELECT * INTO usage_record
  FROM organization_usage
  WHERE organization_id = org_id
    AND billing_period = DATE_TRUNC('month', CURRENT_DATE)::DATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('total_overage', 0, 'details', '[]'::jsonb);
  END IF;

  -- This function would calculate overages based on plan limits
  -- and add them to overage_details JSONB array
  -- Implementation depends on specific business logic

  -- Update overage charges in usage record
  UPDATE organization_usage
  SET
    overage_charges = total_overage,
    overage_details = overage_details,
    updated_at = NOW()
  WHERE organization_id = org_id
    AND billing_period = DATE_TRUNC('month', CURRENT_DATE)::DATE;

  RETURN jsonb_build_object(
    'total_overage', total_overage,
    'details', overage_details
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_overage_charges IS 'Calculates and records overage charges for the month';

-- =====================================================
-- Grant permissions
-- =====================================================

ALTER TABLE organization_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's add-ons
CREATE POLICY addons_select_policy ON organization_addons
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can view their organization's transactions
CREATE POLICY addon_txn_select_policy ON addon_transactions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON POLICY addons_select_policy ON organization_addons IS 'Users can view their organization add-ons';
COMMENT ON POLICY addon_txn_select_policy ON addon_transactions IS 'Users can view their organization add-on transactions';
