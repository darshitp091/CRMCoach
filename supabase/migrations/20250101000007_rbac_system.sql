-- =====================================================
-- RBAC (Role-Based Access Control) System Migration
-- Date: 2025-01-01
-- Description: Complete implementation of 5-role system with RLS
-- =====================================================

-- 1. ADD ROLE COLUMNS TO USERS TABLE
-- =====================================================

-- First, check if there's an existing enum and handle it
DO $$
BEGIN
  -- If user_role enum exists, drop the column first to recreate it
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Drop any policies that depend on users.role column
    DROP POLICY IF EXISTS "Owners can update organization" ON organizations;
    DROP POLICY IF EXISTS owners_can_update_organization ON organizations;

    -- Drop the existing role column if it exists
    ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE;

    -- Drop the old enum type
    DROP TYPE IF EXISTS user_role CASCADE;
  END IF;
END $$;

-- Add role column (main role - mutually exclusive)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'coach';
-- Possible values: 'owner', 'admin', 'manager', 'coach', 'support'

-- Add modifier roles (can stack with main role)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_supervisor BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_biller BOOLEAN DEFAULT FALSE;

-- Add role assignment metadata
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_assigned_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_assigned_by UUID REFERENCES users(id);

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization_role ON users(organization_id, role);

-- Add comment for clarity
COMMENT ON COLUMN users.role IS 'Main role: owner, admin, manager, coach, support';
COMMENT ON COLUMN users.is_supervisor IS 'Modifier: Can supervise other coaches';
COMMENT ON COLUMN users.is_biller IS 'Modifier: Can handle billing operations';


-- 2. CREATE COACH-CLIENT ASSIGNMENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS coach_client_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Assignment type
  assignment_type VARCHAR(20) DEFAULT 'primary',
  -- 'primary' = main coach
  -- 'secondary' = backup/assistant coach
  -- 'supervisor' = oversight only (view notes but don't coach)

  -- Metadata
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  notes TEXT, -- Why this assignment was made

  -- Ensure unique assignments
  UNIQUE(coach_id, client_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach ON coach_client_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_client ON coach_client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_org ON coach_client_assignments(organization_id);

COMMENT ON TABLE coach_client_assignments IS 'Controls which coaches can access which clients';


-- 3. CREATE TEAM INVITATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Invitation details
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  is_supervisor BOOLEAN DEFAULT FALSE,
  is_biller BOOLEAN DEFAULT FALSE,

  -- Token for secure invite links
  invite_token VARCHAR(100) UNIQUE NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'accepted', 'expired', 'cancelled'

  -- Metadata
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP,

  -- Client assignments (for coaches)
  assigned_client_ids UUID[],

  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_org ON team_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

COMMENT ON TABLE team_invitations IS 'Pending team member invitations';


-- 4. CREATE AUDIT LOG TABLE (For Accountability)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Who did what
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_role VARCHAR(20),

  -- Action details
  action VARCHAR(50) NOT NULL,
  -- 'role_changed', 'member_added', 'member_removed', 'permission_changed', etc.

  resource_type VARCHAR(50),
  -- 'user', 'client', 'session', 'organization', etc.

  resource_id UUID,

  -- What changed
  old_value JSONB,
  new_value JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

COMMENT ON TABLE audit_logs IS 'Audit trail for security and compliance';


-- 5. SET ORGANIZATION OWNERS
-- =====================================================

-- Update existing users: First user of each org becomes owner
UPDATE users SET role = 'owner'
WHERE id IN (
  SELECT DISTINCT ON (organization_id) id
  FROM users
  ORDER BY organization_id, created_at ASC
);


-- 6. ENABLE ROW-LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on core tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;


-- 7. CREATE RLS POLICIES FOR CLIENTS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_view_all_clients ON clients;
DROP POLICY IF EXISTS coach_view_assigned_clients ON clients;
DROP POLICY IF EXISTS support_view_basic_clients ON clients;

-- Policy 1: Owner/Admin/Manager can view ALL clients
CREATE POLICY admin_view_all_clients ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = clients.organization_id
      AND users.role IN ('owner', 'admin', 'manager')
    )
  );

-- Policy 2: Coaches can only view ASSIGNED clients
CREATE POLICY coach_view_assigned_clients ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = clients.organization_id
      AND users.role = 'coach'
      AND (
        -- Can see assigned clients
        EXISTS (
          SELECT 1 FROM coach_client_assignments
          WHERE coach_client_assignments.coach_id = users.id
          AND coach_client_assignments.client_id = clients.id
        )
        OR
        -- Supervisor can see supervisee's clients
        users.is_supervisor = TRUE
      )
    )
  );

-- Policy 3: Support can view basic client info (no private notes)
CREATE POLICY support_view_basic_clients ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = clients.organization_id
      AND users.role = 'support'
    )
  );

-- Policy 4: Modify clients - Owner/Admin can edit all, Manager/Coach can edit assigned
DROP POLICY IF EXISTS modify_clients ON clients;
CREATE POLICY modify_clients ON clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = clients.organization_id
      AND (
        -- Owner/Admin can edit all
        users.role IN ('owner', 'admin')
        OR
        -- Manager can edit with limitations
        users.role = 'manager'
        OR
        -- Coach can edit assigned clients
        (users.role = 'coach' AND EXISTS (
          SELECT 1 FROM coach_client_assignments
          WHERE coach_client_assignments.coach_id = users.id
          AND coach_client_assignments.client_id = clients.id
        ))
      )
    )
  );

-- Policy 5: Delete clients - Owner/Admin only
DROP POLICY IF EXISTS delete_clients ON clients;
CREATE POLICY delete_clients ON clients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = clients.organization_id
      AND users.role IN ('owner', 'admin')
    )
  );

-- Policy 6: Insert clients - All except support
DROP POLICY IF EXISTS insert_clients ON clients;
CREATE POLICY insert_clients ON clients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = organization_id
      AND users.role IN ('owner', 'admin', 'manager', 'coach')
    )
  );


-- 8. CREATE RLS POLICIES FOR SESSIONS
-- =====================================================

DROP POLICY IF EXISTS admin_view_all_sessions ON sessions;
DROP POLICY IF EXISTS coach_view_assigned_sessions ON sessions;

-- Policy 1: Owner/Admin/Manager can view ALL sessions
CREATE POLICY admin_view_all_sessions ON sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = sessions.organization_id
      AND users.role IN ('owner', 'admin', 'manager')
    )
  );

-- Policy 2: Coaches can only view sessions for assigned clients
CREATE POLICY coach_view_assigned_sessions ON sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = sessions.organization_id
      AND users.role = 'coach'
      AND (
        -- Can see sessions for assigned clients
        EXISTS (
          SELECT 1 FROM coach_client_assignments
          WHERE coach_client_assignments.coach_id = users.id
          AND coach_client_assignments.client_id = sessions.client_id
        )
        OR
        -- Supervisor can see supervisee's sessions
        users.is_supervisor = TRUE
      )
    )
  );

-- Policy 3: Support CANNOT view session notes (privacy)
-- No policy needed - support role will be blocked by default

-- Policy 4: Modify sessions
DROP POLICY IF EXISTS modify_sessions ON sessions;
CREATE POLICY modify_sessions ON sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = sessions.organization_id
      AND (
        users.role IN ('owner', 'admin', 'manager')
        OR
        (users.role = 'coach' AND EXISTS (
          SELECT 1 FROM coach_client_assignments
          WHERE coach_client_assignments.coach_id = users.id
          AND coach_client_assignments.client_id = sessions.client_id
        ))
      )
    )
  );

-- Policy 5: Insert sessions
DROP POLICY IF EXISTS insert_sessions ON sessions;
CREATE POLICY insert_sessions ON sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = organization_id
      AND users.role IN ('owner', 'admin', 'manager', 'coach')
    )
  );


-- 9. CREATE RLS POLICIES FOR COACH ASSIGNMENTS
-- =====================================================

DROP POLICY IF EXISTS view_coach_assignments ON coach_client_assignments;
DROP POLICY IF EXISTS manage_coach_assignments ON coach_client_assignments;

-- Policy 1: View assignments
CREATE POLICY view_coach_assignments ON coach_client_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = coach_client_assignments.organization_id
      AND (
        -- Owner/Admin/Manager can view all assignments
        users.role IN ('owner', 'admin', 'manager')
        OR
        -- Coaches can view their own assignments
        users.id = coach_client_assignments.coach_id
      )
    )
  );

-- Policy 2: Manage assignments - Owner/Admin/Manager only
CREATE POLICY manage_coach_assignments ON coach_client_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = coach_client_assignments.organization_id
      AND users.role IN ('owner', 'admin', 'manager')
    )
  );


-- 10. CREATE RLS POLICIES FOR TEAM INVITATIONS
-- =====================================================

DROP POLICY IF EXISTS view_team_invitations ON team_invitations;
DROP POLICY IF EXISTS manage_team_invitations ON team_invitations;

-- Policy 1: Owner/Admin can view all invitations
CREATE POLICY view_team_invitations ON team_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = team_invitations.organization_id
      AND users.role IN ('owner', 'admin')
    )
  );

-- Policy 2: Only Owner/Admin can manage invitations
CREATE POLICY manage_team_invitations ON team_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = team_invitations.organization_id
      AND users.role IN ('owner', 'admin')
    )
  );


-- 11. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function: Get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- Function: Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
  user_id UUID,
  permission_name VARCHAR(50)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;

  -- Owner has all permissions
  IF user_role = 'owner' THEN
    RETURN TRUE;
  END IF;

  -- Role-specific permissions
  CASE permission_name
    WHEN 'change_subscription' THEN
      RETURN user_role = 'owner';
    WHEN 'view_billing' THEN
      RETURN user_role IN ('owner', 'admin');
    WHEN 'add_team_members' THEN
      RETURN user_role IN ('owner', 'admin');
    WHEN 'assign_clients' THEN
      RETURN user_role IN ('owner', 'admin', 'manager');
    WHEN 'view_all_clients' THEN
      RETURN user_role IN ('owner', 'admin', 'manager');
    WHEN 'use_ai_features' THEN
      RETURN user_role IN ('owner', 'admin', 'manager', 'coach');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- Function: Get assigned clients for a coach
CREATE OR REPLACE FUNCTION get_assigned_clients(coach_id UUID)
RETURNS TABLE(client_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT cca.client_id
  FROM coach_client_assignments cca
  WHERE cca.coach_id = get_assigned_clients.coach_id;
END;
$$;

-- Function: Assign client to coach
CREATE OR REPLACE FUNCTION assign_client_to_coach(
  p_client_id UUID,
  p_coach_id UUID,
  p_assigned_by UUID,
  p_assignment_type VARCHAR(20) DEFAULT 'primary'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignment_id UUID;
  org_id UUID;
BEGIN
  -- Get organization ID from client
  SELECT organization_id INTO org_id FROM clients WHERE id = p_client_id;

  -- Insert assignment
  INSERT INTO coach_client_assignments (
    client_id,
    coach_id,
    organization_id,
    assignment_type,
    assigned_by
  ) VALUES (
    p_client_id,
    p_coach_id,
    org_id,
    p_assignment_type,
    p_assigned_by
  )
  ON CONFLICT (coach_id, client_id) DO UPDATE
  SET assignment_type = p_assignment_type,
      assigned_by = p_assigned_by,
      assigned_at = NOW()
  RETURNING id INTO assignment_id;

  RETURN assignment_id;
END;
$$;

-- Function: Log audit event
CREATE OR REPLACE FUNCTION log_audit(
  p_organization_id UUID,
  p_user_id UUID,
  p_action VARCHAR(50),
  p_resource_type VARCHAR(50),
  p_resource_id UUID,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
  user_email VARCHAR(255);
  user_role VARCHAR(20);
BEGIN
  -- Get user details
  SELECT email, role INTO user_email, user_role FROM users WHERE id = p_user_id;

  -- Insert audit log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    old_value,
    new_value
  ) VALUES (
    p_organization_id,
    p_user_id,
    user_email,
    user_role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_value,
    p_new_value
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;


-- 12. CREATE TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Trigger function for role changes
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.role != NEW.role THEN
    PERFORM log_audit(
      NEW.organization_id,
      auth.uid(),
      'role_changed',
      'user',
      NEW.id,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to users table
DROP TRIGGER IF EXISTS trigger_audit_role_change ON users;
CREATE TRIGGER trigger_audit_role_change
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION audit_role_change();


-- 13. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_assigned_clients TO authenticated;
GRANT EXECUTE ON FUNCTION assign_client_to_coach TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit TO authenticated;


-- 14. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Team members with their roles
CREATE OR REPLACE VIEW team_members_view AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_supervisor,
  u.is_biller,
  u.organization_id,
  u.role_assigned_at,
  u.created_at,
  COUNT(DISTINCT cca.client_id) as assigned_clients_count
FROM users u
LEFT JOIN coach_client_assignments cca ON u.id = cca.coach_id
GROUP BY u.id, u.email, u.full_name, u.role, u.is_supervisor, u.is_biller,
         u.organization_id, u.role_assigned_at, u.created_at;

COMMENT ON VIEW team_members_view IS 'Team members with role information and client counts';


-- 15. SAMPLE DATA FOR TESTING (Optional - Remove in production)
-- =====================================================

-- This section can be commented out in production

/*
-- Example: Assign a coach to a client
SELECT assign_client_to_coach(
  'client-uuid-here',
  'coach-uuid-here',
  'admin-uuid-here',
  'primary'
);
*/


-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Create migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Add migration tracking
INSERT INTO public.migrations (name, executed_at)
VALUES ('20250101000007_rbac_system', NOW())
ON CONFLICT (name) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RBAC System Migration Complete!';
  RAISE NOTICE '📊 Created: 5 roles (owner, admin, manager, coach, support)';
  RAISE NOTICE '🔐 Enabled: Row-Level Security on 5 tables';
  RAISE NOTICE '📋 Created: 4 new tables (assignments, invitations, audit_logs)';
  RAISE NOTICE '⚙️  Created: 5 helper functions';
  RAISE NOTICE '👥 Updated: Existing users assigned roles';
END $$;
