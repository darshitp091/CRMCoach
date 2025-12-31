-- =====================================================
-- UPDATE SUBSCRIPTION PLANS TO MATCH NEW PRICING
-- =====================================================
-- This migration updates the subscription plans enum
-- From: 'free', 'starter', 'professional', 'business', 'enterprise'
-- To: 'standard', 'pro', 'premium'
-- =====================================================

-- Step 1: Since PostgreSQL doesn't support removing enum values directly,
-- and new enum values can't be used in the same transaction,
-- we create a new enum and swap it
CREATE TYPE subscription_plan_new AS ENUM ('standard', 'pro', 'premium');

-- Step 2: Drop the existing default constraint before type change
-- This prevents "default cannot be cast automatically" error
ALTER TABLE organizations
  ALTER COLUMN subscription_plan DROP DEFAULT;

-- Step 3: Alter the table to use the new enum with data migration
-- This safely converts old values to new ones:
-- 'free', 'starter' -> 'standard'
-- 'professional', 'business' -> 'pro'
-- 'enterprise' -> 'premium'
ALTER TABLE organizations
  ALTER COLUMN subscription_plan TYPE subscription_plan_new
  USING (
    CASE subscription_plan::text
      WHEN 'free' THEN 'standard'::subscription_plan_new
      WHEN 'starter' THEN 'standard'::subscription_plan_new
      WHEN 'professional' THEN 'pro'::subscription_plan_new
      WHEN 'business' THEN 'pro'::subscription_plan_new
      WHEN 'enterprise' THEN 'premium'::subscription_plan_new
      -- Handle any already-converted values (in case migration runs twice)
      WHEN 'standard' THEN 'standard'::subscription_plan_new
      WHEN 'pro' THEN 'pro'::subscription_plan_new
      WHEN 'premium' THEN 'premium'::subscription_plan_new
      ELSE 'standard'::subscription_plan_new  -- Default fallback
    END
  );

-- Step 4: Drop the old enum and rename the new one
DROP TYPE subscription_plan;
ALTER TYPE subscription_plan_new RENAME TO subscription_plan;

-- Step 5: Set the default for new signups
ALTER TABLE organizations
  ALTER COLUMN subscription_plan SET DEFAULT 'standard';

-- Add comment
COMMENT ON TYPE subscription_plan IS 'Subscription plan types: standard (₹1,999/mo), pro (₹3,999/mo), premium (₹6,999/mo)';
