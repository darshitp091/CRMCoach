-- =====================================================
-- BUSINESS LOGIC FUNCTIONS AND TRIGGERS
-- =====================================================
-- This migration adds functions for automation,
-- analytics, and business logic triggers
-- =====================================================

-- =====================================================
-- FUNCTION: Update client stats after session
-- =====================================================

CREATE OR REPLACE FUNCTION update_client_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status != OLD.status)) THEN
    UPDATE clients
    SET
      total_sessions = (
        SELECT COUNT(*) FROM sessions
        WHERE client_id = NEW.client_id AND deleted_at IS NULL
      ),
      completed_sessions = (
        SELECT COUNT(*) FROM sessions
        WHERE client_id = NEW.client_id
        AND status = 'completed'
        AND deleted_at IS NULL
      ),
      last_interaction_at = CASE
        WHEN NEW.status = 'completed' THEN NEW.scheduled_at
        ELSE clients.last_interaction_at
      END
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_session_stats
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_client_session_stats();

-- =====================================================
-- FUNCTION: Update client financial stats
-- =====================================================

CREATE OR REPLACE FUNCTION update_client_financial_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status != OLD.status)) THEN
    UPDATE clients
    SET
      total_paid = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE client_id = NEW.client_id
        AND status = 'completed'
      ),
      lifetime_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE client_id = NEW.client_id
        AND status IN ('completed', 'pending')
      ),
      outstanding_balance = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE client_id = NEW.client_id
        AND status IN ('pending', 'failed')
      )
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_financial_stats
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_financial_stats();

-- =====================================================
-- FUNCTION: Auto-generate invoice number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  org_prefix VARCHAR(10);
  next_number INTEGER;
  new_invoice_number VARCHAR(100);
BEGIN
  IF NEW.invoice_number IS NULL THEN
    -- Get organization slug prefix
    SELECT UPPER(SUBSTRING(slug, 1, 3)) INTO org_prefix
    FROM organizations
    WHERE id = NEW.organization_id;

    -- Get next invoice number for this organization
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM payments
    WHERE organization_id = NEW.organization_id;

    -- Generate invoice number: ORG-INV-00001
    NEW.invoice_number := org_prefix || '-INV-' || LPAD(next_number::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- FUNCTION: Calculate session end time
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_session_end_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NULL AND NEW.scheduled_at IS NOT NULL AND NEW.duration_minutes IS NOT NULL THEN
    NEW.end_time := NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_session_end_time
  BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_end_time();

-- =====================================================
-- FUNCTION: Trigger automation on client creation
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_automation_on_client_created()
RETURNS TRIGGER AS $$
DECLARE
  automation_record RECORD;
BEGIN
  -- Find all active automations for client_created trigger
  FOR automation_record IN
    SELECT * FROM automations
    WHERE organization_id = NEW.organization_id
    AND trigger_type = 'client_created'
    AND is_active = true
  LOOP
    -- Insert into automation queue (we'll process this via backend)
    INSERT INTO automation_logs (
      automation_id,
      organization_id,
      triggered_by,
      trigger_data,
      status
    ) VALUES (
      automation_record.id,
      NEW.organization_id,
      'system',
      jsonb_build_object(
        'client_id', NEW.id,
        'client_email', NEW.email,
        'client_name', NEW.full_name,
        'client_status', NEW.status
      ),
      'pending'
    );

    -- Update execution count
    UPDATE automations
    SET execution_count = execution_count + 1,
        last_executed_at = NOW()
    WHERE id = automation_record.id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_client_created
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_automation_on_client_created();

-- =====================================================
-- FUNCTION: Trigger automation on session scheduled
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_automation_on_session_scheduled()
RETURNS TRIGGER AS $$
DECLARE
  automation_record RECORD;
  client_record RECORD;
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.scheduled_at != OLD.scheduled_at) THEN
    -- Get client details
    SELECT * INTO client_record FROM clients WHERE id = NEW.client_id;

    -- Find all active automations for session_scheduled trigger
    FOR automation_record IN
      SELECT * FROM automations
      WHERE organization_id = NEW.organization_id
      AND trigger_type = 'session_scheduled'
      AND is_active = true
    LOOP
      INSERT INTO automation_logs (
        automation_id,
        organization_id,
        triggered_by,
        trigger_data,
        status
      ) VALUES (
        automation_record.id,
        NEW.organization_id,
        'system',
        jsonb_build_object(
          'session_id', NEW.id,
          'client_id', NEW.client_id,
          'client_email', client_record.email,
          'client_name', client_record.full_name,
          'session_title', NEW.title,
          'scheduled_at', NEW.scheduled_at,
          'duration_minutes', NEW.duration_minutes,
          'meeting_url', NEW.meeting_url
        ),
        'pending'
      );

      UPDATE automations
      SET execution_count = execution_count + 1,
          last_executed_at = NOW()
      WHERE id = automation_record.id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_session_scheduled
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_automation_on_session_scheduled();

-- =====================================================
-- FUNCTION: Trigger automation on session completed
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_automation_on_session_completed()
RETURNS TRIGGER AS $$
DECLARE
  automation_record RECORD;
  client_record RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT * INTO client_record FROM clients WHERE id = NEW.client_id;

    FOR automation_record IN
      SELECT * FROM automations
      WHERE organization_id = NEW.organization_id
      AND trigger_type = 'session_completed'
      AND is_active = true
    LOOP
      INSERT INTO automation_logs (
        automation_id,
        organization_id,
        triggered_by,
        trigger_data,
        status
      ) VALUES (
        automation_record.id,
        NEW.organization_id,
        'system',
        jsonb_build_object(
          'session_id', NEW.id,
          'client_id', NEW.client_id,
          'client_email', client_record.email,
          'client_name', client_record.full_name,
          'session_title', NEW.title,
          'session_notes', NEW.session_notes,
          'completed_at', NOW()
        ),
        'pending'
      );

      UPDATE automations
      SET execution_count = execution_count + 1,
          last_executed_at = NOW()
      WHERE id = automation_record.id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_session_completed
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_automation_on_session_completed();

-- =====================================================
-- FUNCTION: Trigger automation on payment received
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_automation_on_payment_received()
RETURNS TRIGGER AS $$
DECLARE
  automation_record RECORD;
  client_record RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT * INTO client_record FROM clients WHERE id = NEW.client_id;

    FOR automation_record IN
      SELECT * FROM automations
      WHERE organization_id = NEW.organization_id
      AND trigger_type = 'payment_received'
      AND is_active = true
    LOOP
      INSERT INTO automation_logs (
        automation_id,
        organization_id,
        triggered_by,
        trigger_data,
        status
      ) VALUES (
        automation_record.id,
        NEW.organization_id,
        'system',
        jsonb_build_object(
          'payment_id', NEW.id,
          'client_id', NEW.client_id,
          'client_email', client_record.email,
          'client_name', client_record.full_name,
          'amount', NEW.amount,
          'currency', NEW.currency,
          'invoice_number', NEW.invoice_number,
          'paid_at', NEW.paid_at
        ),
        'pending'
      );

      UPDATE automations
      SET execution_count = execution_count + 1,
          last_executed_at = NOW()
      WHERE id = automation_record.id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_payment_received
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_automation_on_payment_received();

-- =====================================================
-- FUNCTION: Trigger automation on payment failed
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_automation_on_payment_failed()
RETURNS TRIGGER AS $$
DECLARE
  automation_record RECORD;
  client_record RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'failed' AND OLD.status != 'failed' THEN
    SELECT * INTO client_record FROM clients WHERE id = NEW.client_id;

    FOR automation_record IN
      SELECT * FROM automations
      WHERE organization_id = NEW.organization_id
      AND trigger_type = 'payment_failed'
      AND is_active = true
    LOOP
      INSERT INTO automation_logs (
        automation_id,
        organization_id,
        triggered_by,
        trigger_data,
        status
      ) VALUES (
        automation_record.id,
        NEW.organization_id,
        'system',
        jsonb_build_object(
          'payment_id', NEW.id,
          'client_id', NEW.client_id,
          'client_email', client_record.email,
          'client_name', client_record.full_name,
          'amount', NEW.amount,
          'currency', NEW.currency,
          'invoice_number', NEW.invoice_number
        ),
        'pending'
      );

      UPDATE automations
      SET execution_count = execution_count + 1,
          last_executed_at = NOW()
      WHERE id = automation_record.id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_payment_failed
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_automation_on_payment_failed();

-- =====================================================
-- FUNCTION: Get dashboard analytics
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_analytics(org_id UUID, date_from TIMESTAMP, date_to TIMESTAMP)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_clients', (
      SELECT COUNT(*) FROM clients
      WHERE organization_id = org_id AND deleted_at IS NULL
    ),
    'active_clients', (
      SELECT COUNT(*) FROM clients
      WHERE organization_id = org_id AND status = 'active' AND deleted_at IS NULL
    ),
    'new_clients_this_period', (
      SELECT COUNT(*) FROM clients
      WHERE organization_id = org_id
      AND created_at >= date_from
      AND created_at <= date_to
      AND deleted_at IS NULL
    ),
    'total_sessions', (
      SELECT COUNT(*) FROM sessions
      WHERE organization_id = org_id
      AND scheduled_at >= date_from
      AND scheduled_at <= date_to
      AND deleted_at IS NULL
    ),
    'completed_sessions', (
      SELECT COUNT(*) FROM sessions
      WHERE organization_id = org_id
      AND status = 'completed'
      AND scheduled_at >= date_from
      AND scheduled_at <= date_to
      AND deleted_at IS NULL
    ),
    'upcoming_sessions', (
      SELECT COUNT(*) FROM sessions
      WHERE organization_id = org_id
      AND status IN ('scheduled', 'confirmed')
      AND scheduled_at > NOW()
      AND deleted_at IS NULL
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments
      WHERE organization_id = org_id
      AND status = 'completed'
      AND paid_at >= date_from
      AND paid_at <= date_to
    ),
    'pending_payments', (
      SELECT COALESCE(SUM(amount), 0) FROM payments
      WHERE organization_id = org_id
      AND status = 'pending'
    ),
    'active_programs', (
      SELECT COUNT(*) FROM programs
      WHERE organization_id = org_id
      AND is_active = true
      AND deleted_at IS NULL
    ),
    'client_enrollments', (
      SELECT COUNT(*) FROM client_programs
      WHERE organization_id = org_id
      AND status = 'active'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Search clients
-- =====================================================

CREATE OR REPLACE FUNCTION search_clients(
  org_id UUID,
  search_query TEXT DEFAULT '',
  filter_status client_status DEFAULT NULL,
  filter_tags TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  full_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  status client_status,
  tags TEXT[],
  total_sessions INTEGER,
  lifetime_value DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.full_name,
    c.email,
    c.phone,
    c.status,
    c.tags,
    c.total_sessions,
    c.lifetime_value,
    c.created_at
  FROM clients c
  WHERE c.organization_id = org_id
    AND c.deleted_at IS NULL
    AND (
      search_query = ''
      OR c.full_name ILIKE '%' || search_query || '%'
      OR c.email ILIKE '%' || search_query || '%'
      OR c.phone ILIKE '%' || search_query || '%'
    )
    AND (filter_status IS NULL OR c.status = filter_status)
    AND (filter_tags IS NULL OR c.tags && filter_tags)
  ORDER BY c.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get upcoming sessions
-- =====================================================

CREATE OR REPLACE FUNCTION get_upcoming_sessions(
  org_id UUID,
  user_id_filter UUID DEFAULT NULL,
  days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  status session_status,
  client_name VARCHAR,
  client_email VARCHAR,
  coach_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.scheduled_at,
    s.duration_minutes,
    s.status,
    c.full_name AS client_name,
    c.email AS client_email,
    u.full_name AS coach_name
  FROM sessions s
  JOIN clients c ON s.client_id = c.id
  JOIN users u ON s.coach_id = u.id
  WHERE s.organization_id = org_id
    AND s.deleted_at IS NULL
    AND s.status IN ('scheduled', 'confirmed')
    AND s.scheduled_at > NOW()
    AND s.scheduled_at <= NOW() + (days_ahead || ' days')::INTERVAL
    AND (user_id_filter IS NULL OR s.coach_id = user_id_filter)
  ORDER BY s.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION update_client_session_stats() IS 'Auto-updates client session statistics when sessions change';
COMMENT ON FUNCTION update_client_financial_stats() IS 'Auto-updates client financial metrics when payments change';
COMMENT ON FUNCTION generate_invoice_number() IS 'Auto-generates unique invoice numbers for payments';
COMMENT ON FUNCTION calculate_session_end_time() IS 'Auto-calculates session end time based on duration';
COMMENT ON FUNCTION get_dashboard_analytics(UUID, TIMESTAMP, TIMESTAMP) IS 'Returns comprehensive dashboard analytics for an organization';
COMMENT ON FUNCTION search_clients(UUID, TEXT, client_status, TEXT[], INTEGER, INTEGER) IS 'Full-text search for clients with filters';
COMMENT ON FUNCTION get_upcoming_sessions(UUID, UUID, INTEGER) IS 'Returns upcoming sessions for an organization or specific user';
