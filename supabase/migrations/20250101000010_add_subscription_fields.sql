-- =====================================================
-- Add Subscription Fields to Organizations
-- =====================================================

-- Add Razorpay-related fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS razorpay_subscription_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4),
ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_razorpay_subscription
  ON organizations(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_organizations_razorpay_customer
  ON organizations(razorpay_customer_id);

-- Create subscription_logs table for audit trail
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  razorpay_event_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_organization
  ON subscription_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_event_type
  ON subscription_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created
  ON subscription_logs(created_at);

-- Add RLS policies
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own organization subscription logs" ON subscription_logs;
CREATE POLICY "Users can view own organization subscription logs"
  ON subscription_logs
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

COMMENT ON TABLE subscription_logs IS 'Audit trail for subscription events from Razorpay';
COMMENT ON COLUMN organizations.razorpay_customer_id IS 'Razorpay customer ID';
COMMENT ON COLUMN organizations.razorpay_subscription_id IS 'Razorpay subscription ID';
