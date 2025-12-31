-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- This migration sets up comprehensive RLS policies
-- to ensure data isolation between organizations
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get current user's organization
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Check if user is admin/owner
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'owner') FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================

-- Users can view their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

-- Only owners can update organization
CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (
    id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
  );

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Users can view users in their organization
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Admins can insert new users
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- Admins can update other users
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- =====================================================
-- CLIENTS POLICIES
-- =====================================================

-- Users can view clients in their organization
CREATE POLICY "Users can view org clients"
  ON clients FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Users can create clients
CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Users can update clients in their organization
CREATE POLICY "Users can update org clients"
  ON clients FOR UPDATE
  USING (organization_id = get_user_organization_id());

-- Admins can delete clients
CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- =====================================================
-- PROGRAMS POLICIES
-- =====================================================

-- Users can view programs in their organization
CREATE POLICY "Users can view org programs"
  ON programs FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Users can create programs
CREATE POLICY "Users can create programs"
  ON programs FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Users can update programs
CREATE POLICY "Users can update org programs"
  ON programs FOR UPDATE
  USING (organization_id = get_user_organization_id());

-- Admins can delete programs
CREATE POLICY "Admins can delete programs"
  ON programs FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- =====================================================
-- CLIENT_PROGRAMS POLICIES
-- =====================================================

CREATE POLICY "Users can view org client programs"
  ON client_programs FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create client programs"
  ON client_programs FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org client programs"
  ON client_programs FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can delete client programs"
  ON client_programs FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- =====================================================
-- SESSIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view org sessions"
  ON sessions FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org sessions"
  ON sessions FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete org sessions"
  ON sessions FOR DELETE
  USING (organization_id = get_user_organization_id());

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view org payments"
  ON payments FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- =====================================================
-- TASKS POLICIES
-- =====================================================

CREATE POLICY "Users can view org tasks"
  ON tasks FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update own or assigned tasks"
  ON tasks FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND (created_by_id = auth.uid() OR assigned_to_id = auth.uid())
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

-- =====================================================
-- AUTOMATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view org automations"
  ON automations FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can create automations"
  ON automations FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

CREATE POLICY "Admins can update automations"
  ON automations FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

CREATE POLICY "Admins can delete automations"
  ON automations FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- =====================================================
-- AUTOMATION_LOGS POLICIES
-- =====================================================

CREATE POLICY "Users can view org automation logs"
  ON automation_logs FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "System can insert automation logs"
  ON automation_logs FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- =====================================================
-- COMMUNICATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view org communications"
  ON communications FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create communications"
  ON communications FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- =====================================================
-- NOTES POLICIES
-- =====================================================

CREATE POLICY "Users can view org notes"
  ON notes FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND (is_private = false OR created_by_id = auth.uid())
  );

CREATE POLICY "Users can create notes"
  ON notes FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND created_by_id = auth.uid()
  );

-- =====================================================
-- TEMPLATES POLICIES
-- =====================================================

CREATE POLICY "Users can view org templates"
  ON templates FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org templates"
  ON templates FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can delete templates"
  ON templates FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin()
  );

-- =====================================================
-- ANALYTICS_EVENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view org analytics"
  ON analytics_events FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_user_organization_id() IS 'Returns the organization_id for the current authenticated user';
COMMENT ON FUNCTION is_admin() IS 'Checks if the current user has admin or owner role';
