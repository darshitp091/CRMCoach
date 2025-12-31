-- ============================================================================
-- CoachCRM Complete Database Schema - Based on Existing Migrations
-- ============================================================================
-- This file combines all three migration files into one
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- You already have migrations in supabase/migrations/ folder
-- Instead of running this file, use the Supabase CLI to push migrations:
--
-- Step 1: Install Supabase CLI
--   npm install -g supabase
--
-- Step 2: Login to Supabase
--   supabase login
--
-- Step 3: Link your project
--   supabase link --project-ref ihbplunncorcktmxtene
--
-- Step 4: Push all migrations
--   supabase db push
--
-- This will run all 3 migration files in order:
--   1. 20250101000000_initial_schema.sql (creates all tables)
--   2. 20250101000001_rls_policies.sql (sets up security)
--   3. 20250101000002_functions_and_triggers.sql (adds business logic)
--
-- ============================================================================
-- IMPORTANT: What's Missing for Signup
-- ============================================================================
--
-- The migrations don't include the auth trigger for auto-creating user profiles.
-- After running migrations, also run this in SQL Editor:

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- Verification Steps
-- ============================================================================
--
-- After running migrations + auth trigger:
--
-- 1. Check Table Editor - should see all these tables:
--    ✓ organizations
--    ✓ users
--    ✓ clients
--    ✓ programs
--    ✓ client_programs
--    ✓ sessions
--    ✓ payments
--    ✓ tasks
--    ✓ automations
--    ✓ automation_logs
--    ✓ communications
--    ✓ notes
--    ✓ templates
--    ✓ analytics_events
--
-- 2. Check Database → Triggers → should see:
--    ✓ on_auth_user_created (on auth.users)
--    ✓ update_*_updated_at (on each table)
--
-- 3. Check Auth → Policies → should see RLS policies for each table
--
-- 4. Test signup at http://localhost:3001/signup
--
-- ============================================================================
