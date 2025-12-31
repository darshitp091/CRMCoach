-- =====================================================
-- SEED DATA FOR DEVELOPMENT AND TESTING
-- =====================================================
-- This file contains sample data for testing the CRM
-- =====================================================

-- Create a demo organization
INSERT INTO organizations (
  id,
  name,
  slug,
  description,
  industry,
  email,
  phone,
  subscription_plan,
  subscription_status,
  trial_ends_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Elevate Coaching',
  'elevate-coaching',
  'Professional coaching services for business leaders and entrepreneurs',
  'Business Coaching',
  'hello@elevatecoaching.com',
  '+91-9876543210',
  'professional',
  'active',
  NOW() + INTERVAL '7 days'
) ON CONFLICT (id) DO NOTHING;

-- Create default email templates
INSERT INTO templates (organization_id, name, description, channel, category, subject, body, variables, is_active) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Welcome Email',
  'Welcome email sent to new clients',
  'email',
  'welcome',
  'Welcome to {{organization_name}}!',
  'Hi {{client_name}},

Welcome to {{organization_name}}! We''re excited to start this journey with you.

Your coach, {{coach_name}}, will be reaching out soon to schedule your first session.

If you have any questions, feel free to reply to this email.

Best regards,
{{organization_name}} Team',
  '["client_name", "organization_name", "coach_name"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Session Reminder - 24 Hours',
  'Reminder sent 24 hours before a session',
  'email',
  'reminder',
  'Reminder: Session with {{coach_name}} tomorrow',
  'Hi {{client_name}},

This is a reminder about your upcoming coaching session:

📅 Date & Time: {{session_date}} at {{session_time}}
⏱️ Duration: {{duration}} minutes
👤 Coach: {{coach_name}}
🔗 Meeting Link: {{meeting_url}}

We look forward to seeing you!

Best regards,
{{organization_name}}',
  '["client_name", "coach_name", "session_date", "session_time", "duration", "meeting_url", "organization_name"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Payment Confirmation',
  'Confirmation email after successful payment',
  'email',
  'payment',
  'Payment Received - Invoice {{invoice_number}}',
  'Hi {{client_name}},

Thank you for your payment!

Payment Details:
💰 Amount: {{currency}} {{amount}}
📋 Invoice: {{invoice_number}}
📅 Date: {{payment_date}}

You can download your invoice here: {{invoice_url}}

Best regards,
{{organization_name}}',
  '["client_name", "amount", "currency", "invoice_number", "payment_date", "invoice_url", "organization_name"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Session Follow-up',
  'Follow-up email after completed session',
  'email',
  'follow_up',
  'Thank you for today''s session',
  'Hi {{client_name}},

Thank you for our session today! Here are your action items:

{{action_items}}

Session Notes:
{{session_notes}}

Our next session is scheduled for {{next_session_date}}.

Keep up the great work!

Best,
{{coach_name}}',
  '["client_name", "coach_name", "action_items", "session_notes", "next_session_date"]'::jsonb,
  true
);

-- Create default WhatsApp templates
INSERT INTO templates (organization_id, name, description, channel, category, body, variables, is_active) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'WhatsApp Session Reminder',
  'WhatsApp reminder for upcoming session',
  'whatsapp',
  'reminder',
  'Hi {{client_name}}! 👋

Reminder: You have a coaching session tomorrow with {{coach_name}}

📅 {{session_date}} at {{session_time}}
⏱️ {{duration}} minutes
🔗 {{meeting_url}}

See you there! 🚀',
  '["client_name", "coach_name", "session_date", "session_time", "duration", "meeting_url"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'WhatsApp Payment Reminder',
  'WhatsApp reminder for pending payment',
  'whatsapp',
  'payment',
  'Hi {{client_name}}! 👋

This is a friendly reminder about your pending payment:

💰 Amount: {{currency}} {{amount}}
📋 Invoice: {{invoice_number}}

Please complete the payment here: {{payment_link}}

Thank you! 🙏',
  '["client_name", "amount", "currency", "invoice_number", "payment_link"]'::jsonb,
  true
);

-- Create sample automations
INSERT INTO automations (
  organization_id,
  name,
  description,
  trigger_type,
  trigger_config,
  actions,
  is_active
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Welcome New Clients',
  'Automatically send welcome email to new clients',
  'client_created',
  '{}'::jsonb,
  '[
    {
      "type": "send_email",
      "template_id": "welcome_email",
      "delay_minutes": 0
    }
  ]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Session Reminder - 24hrs',
  'Send session reminder 24 hours before scheduled time',
  'session_scheduled',
  '{"hours_before": 24}'::jsonb,
  '[
    {
      "type": "send_email",
      "template_id": "session_reminder_24h",
      "delay_minutes": 0
    },
    {
      "type": "send_whatsapp",
      "template_id": "whatsapp_session_reminder",
      "delay_minutes": 0
    }
  ]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Payment Confirmation',
  'Send payment confirmation and invoice when payment is received',
  'payment_received',
  '{}'::jsonb,
  '[
    {
      "type": "send_email",
      "template_id": "payment_confirmation",
      "delay_minutes": 0
    }
  ]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Session Follow-up',
  'Send follow-up email after session completion',
  'session_completed',
  '{}'::jsonb,
  '[
    {
      "type": "send_email",
      "template_id": "session_follow_up",
      "delay_minutes": 60
    },
    {
      "type": "create_task",
      "task_title": "Review session notes",
      "assign_to": "coach",
      "delay_minutes": 0
    }
  ]'::jsonb,
  true
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organizations IS 'Sample organization for testing';
