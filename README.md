# 🚀 Coaching & Consulting CRM SaaS Platform

A complete, production-ready CRM platform specifically designed for coaching and consulting businesses. Built with Next.js, Supabase, and Razorpay integration.

> 📖 **RBAC Documentation:** For detailed information about the Role-Based Access Control system, see [RBAC_FULL_IMPLEMENTATION_DONE.md](RBAC_FULL_IMPLEMENTATION_DONE.md)

## 🎯 Subscription & Pricing

### 3-Tier Pricing Model (Updated 2025)

- **Standard Plan**: ₹1,999/month (₹19,190/year - Save 20%)
  - Up to 50 clients, 2 team members, 5GB storage
  - Basic scheduling, email/SMS, basic automation

- **Pro Plan**: ₹3,999/month (₹38,390/year - Save 20%) ⭐ Most Popular
  - Up to 200 clients, 5 team members, 50GB storage
  - WhatsApp integration, video calling (50hrs/month), custom branding

- **Premium Plan**: ₹6,999/month (₹67,190/year - Save 20%)
  - Unlimited clients & team members, 200GB storage
  - AI features, unlimited video calling, full API access, dedicated account manager

### Trial & Billing

- **7-Day Free Trial** - No credit card required
- **Email Verification Required** - All signups must verify email before access
- **Trial Expiration System** - Automatic notifications at 3 days, 1 day, and on expiration day
- **Razorpay Integration** - Support for UPI, cards, net banking, wallets

## ✨ Features

### 🎯 Core Features

- **Client Management** - Complete client lifecycle management with status tracking, tags, and custom fields
- **Session Scheduling** - Book and manage coaching sessions with calendar integration
- **Payment Processing** - Razorpay integration for payments, invoices, and subscriptions
- **Automation Engine** - Trigger-based automations for emails, WhatsApp, SMS, and tasks
- **Communication Hub** - Unified inbox for Email, WhatsApp, and SMS communications
- **Analytics Dashboard** - Real-time insights into clients, revenue, and sessions
- **Multi-user Support** - Role-based access control (Owner, Admin, Coach, Member)
- **Program Management** - Create and sell coaching programs and packages
- **Feature Gating** - Plan-based feature access control with upgrade prompts

### 🔥 Advanced Features

- **Automated Workflows** - Welcome emails, session reminders, payment confirmations
- **Smart Triggers** - Event-based automations (client_created, session_scheduled, payment_received, etc.)
- **Template System** - Customizable email, WhatsApp, and SMS templates
- **Task Management** - Create and assign tasks to team members
- **Notes & Documentation** - Session notes, client notes with privacy controls
- **Multi-tenant Architecture** - Complete data isolation between organizations
- **Row Level Security** - Database-level security with Supabase RLS

## 🎨 Design System

### Color Palette (Coaching & Consulting Theme)

```javascript
Primary (Professional Blue): #6366F1   // Trust, Authority, Expertise
Secondary (Success Green): #10B981    // Growth, Achievement, Progress
Accent (Warm Orange): #F97316         // Energy, Motivation, Action
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Payment**: Razorpay (India-focused payment gateway)
- **Communication**: WhatsApp Business API, Email (Supabase Auth), SMS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Project Structure

```
coaching-crm-saas/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Main dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── clients/          # Client management components
│   │   ├── sessions/         # Session components
│   │   ├── payments/         # Payment components
│   │   └── automations/      # Automation components
│   ├── lib/                  # Utility libraries
│   │   ├── supabase/        # Supabase client/server
│   │   └── utils/           # Helper functions
│   ├── services/            # Business logic services
│   │   ├── auth.service.ts
│   │   ├── client.service.ts
│   │   ├── session.service.ts
│   │   ├── payment.service.ts
│   │   └── automation.service.ts
│   ├── types/               # TypeScript types
│   └── styles/             # Global styles
├── supabase/
│   ├── migrations/         # Database migrations
│   │   ├── 20250101000000_initial_schema.sql
│   │   ├── 20250101000001_rls_policies.sql
│   │   └── 20250101000002_functions_and_triggers.sql
│   ├── seed.sql           # Seed data
│   └── config.toml        # Supabase configuration
├── public/                # Static assets
├── .env.example          # Environment variables template
├── package.json
├── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/bun
- Supabase account (free tier available)
- Razorpay account (for payment integration)
- Git

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd "CRM Model"
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
bun install
```

3. **Set up Supabase**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (or create new one)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Optional: Seed demo data
supabase db seed
```

4. **Configure environment variables**

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### Main Tables

1. **organizations** - Multi-tenant organization data
2. **users** - User profiles with roles (role, is_supervisor, is_biller)
3. **clients** - Client/lead management
4. **sessions** - Coaching session scheduling
5. **payments** - Payment records with Razorpay
6. **programs** - Coaching programs/packages
7. **automations** - Workflow automations
8. **templates** - Message templates
9. **tasks** - Task management
10. **communications** - Communication history
11. **notes** - Session and client notes

**RBAC Tables (Added Dec 2025):**

12. **coach_client_assignments** - Controls which coaches can access which clients
13. **team_invitations** - Pending team member invites with secure tokens
14. **audit_logs** - Complete audit trail for compliance and security
15. **migrations** - Database migration tracking

### Key Relationships

- Organizations → Users (1:many)
- Organizations → Clients (1:many)
- Clients → Sessions (1:many)
- Users (Coaches) → Sessions (1:many)
- Clients → Payments (1:many)
- Clients → Programs (many:many)

## 🔐 Authentication & Authorization

### User Roles (RBAC System - ✅ Production Ready)

**5 Main Roles:**

1. **Owner** 👑
   - Full access to everything
   - Billing and subscription management
   - Team management
   - Organization settings
   - Cannot be removed or changed

2. **Admin** 🛡️
   - Near-full access (except billing changes)
   - Team management
   - View all clients and sessions
   - AI features access
   - $18/month additional seat

3. **Manager** 🎯
   - Team oversight and coordination
   - View all clients and sessions
   - Assign coaches to clients
   - AI features access
   - $15/month additional seat

4. **Coach** 👤
   - View only assigned clients
   - Manage own sessions
   - AI features access
   - $12/month additional seat
   - Volume discounts: $10/mo (5+), $8/mo (10+)

5. **Support** 🎧
   - Administrative helper role
   - Basic client info (no private notes)
   - Cannot use AI features
   - FREE on all paid plans

**2 Modifier Roles (FREE, stack with main role):**

- **Supervisor** ⭐ - Can oversee other coaches' work (for licensed supervisors)
- **Biller** 💰 - Can handle invoicing and payment processing

### Row Level Security (RLS)

**Database-level security enforced by PostgreSQL:**

- ✅ Coaches CANNOT query other coaches' clients (database enforced)
- ✅ Support staff CANNOT view private session notes
- ✅ Owner role cannot be removed (account safety)
- ✅ Organization isolation (multi-tenant security)
- ✅ Automatic filtering on every query

**12 RLS Policies:**
- Clients: 6 policies (view, edit, delete by role)
- Sessions: 5 policies (view, edit by role)
- Coach assignments: 2 policies (view, manage)
- Team invitations: 2 policies (view, manage)

**Key Security Features:**
- Coaches can ONLY see clients assigned to them
- Support staff blocked from viewing session notes
- All role changes logged in audit_logs table
- Token-based secure team invitations
- Automatic audit trail for compliance

## 💳 Razorpay Integration

### Setup

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get API keys from Settings → API Keys
3. Add keys to `.env.local`

### Payment Flow

1. Create payment record in database
2. Generate Razorpay order
3. Show Razorpay checkout
4. Verify payment signature
5. Update payment status
6. Trigger automation (receipt email)

### Example Usage

```typescript
import { PaymentService } from '@/services/payment.service';

// Initialize payment
const { payment, razorpayOrder } = await PaymentService.initializePayment(
  organizationId,
  {
    clientId: 'client-uuid',
    amount: 5000,
    currency: 'INR',
    description: 'Coaching Program - Month 1',
  }
);

// After successful payment
await PaymentService.completePayment(
  payment.id,
  razorpayPaymentId,
  razorpaySignature
);
```

## 🤖 Automation System

### Trigger Types

- `client_created` - New client added
- `session_scheduled` - Session booked
- `session_completed` - Session finished
- `payment_received` - Payment successful
- `payment_failed` - Payment failed
- `milestone_achieved` - Client milestone
- `inactivity_detected` - No activity detected
- `subscription_expiring` - Subscription ending soon
- `custom` - Custom triggers

### Action Types

- `send_email` - Send email from template
- `send_whatsapp` - Send WhatsApp message
- `send_sms` - Send SMS
- `create_task` - Create task
- `update_client` - Update client data
- `webhook` - Call external webhook

### Example Automation

```typescript
import { AutomationService } from '@/services/automation.service';

await AutomationService.create(organizationId, userId, {
  name: 'Welcome New Clients',
  triggerType: 'client_created',
  actions: [
    {
      type: 'send_email',
      template_id: 'welcome_email',
      delay_minutes: 0,
    },
    {
      type: 'create_task',
      config: {
        title: 'Call new client',
        assign_to: 'coach',
      },
      delay_minutes: 60,
    },
  ],
});
```

## 📱 Communication Integrations

### WhatsApp Business API

1. Sign up for WhatsApp Business API
2. Get API credentials
3. Add to `.env.local`:

```env
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_API_TOKEN=your_whatsapp_api_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### Email (via Supabase Auth)

Supabase handles email out of the box. For custom SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### SMS (Twilio/MSG91)

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## 📈 Analytics & Reports

Access pre-built analytics functions:

```typescript
import { supabase } from '@/lib/supabase/client';

// Get dashboard analytics
const analytics = await supabase.rpc('get_dashboard_analytics', {
  org_id: organizationId,
  date_from: '2025-01-01',
  date_to: '2025-12-31',
});

// Search clients
const clients = await supabase.rpc('search_clients', {
  org_id: organizationId,
  search_query: 'john',
  filter_status: 'active',
});

// Get upcoming sessions
const sessions = await supabase.rpc('get_upcoming_sessions', {
  org_id: organizationId,
  days_ahead: 7,
});
```

## 🎨 UI Components

All components built with TailwindCSS using the brand color system:

- `brand-primary-500` - Main brand color
- `brand-secondary-500` - Success/growth color
- `brand-accent-500` - Action/CTA color

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage
npm run test:coverage
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Works on any Next.js compatible platform:
- Netlify
- Railway
- AWS Amplify
- Google Cloud Run

## 🔧 Configuration

### Subscription Plans

Edit in database or via admin panel:

- **Free** - 5 clients, 10 sessions/month
- **Starter** - 50 clients, unlimited sessions (₹999/month)
- **Professional** - 200 clients, automation, WhatsApp (₹2,499/month)
- **Business** - Unlimited everything (₹4,999/month)

### Customization

- Colors: `tailwind.config.js`
- Branding: Organization settings
- Email templates: Templates table
- Automation templates: `automation.service.ts`

## 📚 API Documentation

### RBAC Permission System

```typescript
import { hasPermission, requirePermission, PERMISSIONS } from '@/lib/auth/permissions';

// Check if user has permission
const canAddMembers = await hasPermission(userId, PERMISSIONS.ADD_TEAM_MEMBERS);

if (canAddMembers) {
  // Show invite button
}

// In API routes - require permission or throw error
await requirePermission(userId, PERMISSIONS.CHANGE_SUBSCRIPTION);

// Check client access
import { canAccessClient } from '@/lib/auth/permissions';
const hasAccess = await canAccessClient(userId, clientId);

// Assign client to coach (Owner/Admin/Manager only)
import { assignClientToCoach } from '@/lib/auth/permissions';
const result = await assignClientToCoach(clientId, coachId, assignedByUserId);
```

### Client Service

```typescript
import { ClientService } from '@/services/client.service';

// Create client
const client = await ClientService.create(organizationId, {
  email: 'john@example.com',
  fullName: 'John Doe',
  status: 'lead',
});

// Search clients (automatically filtered by role via RLS)
const { clients, total } = await ClientService.search(organizationId, {
  searchQuery: 'john',
  status: 'active',
  limit: 50,
});
```

### Session Service

```typescript
import { SessionService } from '@/services/session.service';

// Create session
const session = await SessionService.create(organizationId, {
  clientId: 'client-uuid',
  coachId: 'coach-uuid',
  title: 'Strategy Session',
  scheduledAt: '2025-01-15T10:00:00Z',
  durationMinutes: 60,
});

// Get upcoming sessions
const upcoming = await SessionService.getUpcoming(organizationId);
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Documentation: Check this README
- Issues: GitHub Issues
- Email: support@yourcrm.com

## 🗺️ Roadmap

**✅ Completed (December 2025):**
- [x] Role-Based Access Control (RBAC) system
- [x] 5 hierarchical roles with 65+ permissions
- [x] Database-level security with RLS
- [x] Team management UI
- [x] Audit logging system
- [x] AI features with Gemini API
- [x] WhatsApp integration

**🚧 In Progress:**
- [ ] Email invitation sending (Resend API)
- [ ] Client assignment UI
- [ ] Dynamic navigation sidebar by role

**📋 Planned:**
- [ ] Mobile app (React Native)
- [ ] AI-powered client insights & churn prediction
- [ ] Calendar integrations (Google, Outlook)
- [ ] Zoom/Meet integration
- [ ] Advanced reporting & custom dashboards
- [ ] API webhooks
- [ ] White-label options
- [ ] Multi-language support
- [ ] Granular permission toggles
- [ ] Custom roles beyond 5 standard ones

## 💡 Use Cases

Perfect for:
- Business Coaches
- Life Coaches
- Career Coaches
- Consultants
- Therapists
- Fitness Trainers
- Music Teachers
- Any 1-on-1 service business

## 🌟 Why This CRM?

- **Niche-Specific**: Built specifically for coaching/consulting
- **All-in-One**: No need for multiple tools
- **Automation-First**: Save 7-10 hours/week
- **India-Ready**: Razorpay, WhatsApp, INR support
- **Affordable**: Much cheaper than enterprise CRMs
- **Modern Stack**: Fast, secure, scalable
- **Open Source**: Customize as needed

---

Built with ❤️ for Coaches and Consultants

**Start transforming your coaching business today!** 🚀
