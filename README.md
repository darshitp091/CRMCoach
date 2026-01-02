# 🚀 FlowCoach - Complete SaaS Platform for Coaching Businesses

A production-ready, multi-tenant CRM platform built specifically for coaching and consulting businesses. Fully integrated with Razorpay payments, advanced RBAC system, and comprehensive automation workflows.

## ✨ Key Features

### 🎯 Core Capabilities
- **Multi-Tenant Architecture** - Complete data isolation with PostgreSQL RLS
- **Role-Based Access Control** - 5 hierarchical roles with 65+ permissions
- **Client Management** - Full lifecycle tracking with smart assignments
- **Session Scheduling** - Calendar integration with automated reminders
- **Payment Processing** - Razorpay integration with subscriptions & invoicing
- **Automation Engine** - Trigger-based workflows for emails, WhatsApp, and tasks
- **Usage Tracking** - Plan-based limits with real-time monitoring
- **Team Management** - Invite system with secure tokens
- **Analytics Dashboard** - Real-time insights and custom reports

### 💳 Subscription Plans

**Standard Plan** - ₹1,999/month (₹19,190/year - Save 20%)
- 25 clients, 1 team member, 5GB storage
- Email automation, basic scheduling
- SMS: 100/month, Email: 1,000/month

**Pro Plan** - ₹3,999/month (₹38,390/year - Save 20%) ⭐ Most Popular
- 100 clients, 5 team members, 20GB storage
- WhatsApp integration, video calls (50hrs/month)
- SMS: 500/month, Email: 5,000/month
- AI summaries (20/month) + insights (10/month)

**Premium Plan** - ₹6,999/month (₹67,190/year - Save 20%)
- 500 clients, 15 team members, 100GB storage
- Unlimited video calls, priority support
- SMS: 2,000/month, Email: 25,000/month
- AI summaries (100/month) + insights (50/month)
- Advanced analytics, custom branding

**Trial Period:** 7 days free, auto-charged after trial via Razorpay

### 🔐 RBAC System

**5 Main Roles:**

1. **Owner** 👑 - Full system access, billing, cannot be removed
2. **Admin** 🛡️ - Team management, all clients, AI features ($18/mo seat)
3. **Manager** 🎯 - Team oversight, client assignments, AI features ($15/mo seat)
4. **Coach** 👤 - Assigned clients only, own sessions, AI features ($12/mo seat, volume discounts)
5. **Support** 🎧 - Basic access, no private notes, FREE on paid plans

**Security Features:**
- Database-level RLS policies (12+ policies)
- Coaches can ONLY access assigned clients
- Complete audit trail in audit_logs table
- Token-based team invitations
- Automatic permission checks on all queries

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14.1.0 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide Icons

**Backend:**
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Razorpay (Payment Gateway)
- Row Level Security (RLS)

**State & Forms:**
- Zustand (State Management)
- React Hook Form + Zod (Form Validation)
- Recharts (Analytics)

## 📦 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── signup/
│   │   ├── signin/
│   │   └── callback/
│   ├── (dashboard)/         # Protected dashboard
│   │   ├── clients/
│   │   ├── sessions/
│   │   ├── analytics/
│   │   ├── billing/
│   │   └── settings/
│   └── api/                 # API routes
│       ├── addons/
│       ├── razorpay/
│       └── webhooks/
├── components/
│   ├── ui/                  # Reusable components
│   ├── dashboard/           # Dashboard widgets
│   └── subscription/        # Billing components
├── lib/
│   ├── supabase/           # Client & server helpers
│   ├── razorpay/           # Payment integration
│   ├── auth/               # RBAC & permissions
│   └── middleware/         # Feature restrictions
├── services/
│   ├── auth.service.ts
│   ├── client.service.ts
│   ├── session.service.ts
│   ├── payment.service.ts
│   └── automation.service.ts
└── types/                  # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Razorpay account (India)
- Git

### Installation

1. **Clone repository**
```bash
git clone <your-repo-url>
cd "CRM Model"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**

Copy `.env.example` to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up database**

Run Supabase migrations (see `supabase/migrations/` directory):
```bash
supabase db push
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Tables
- **organizations** - Multi-tenant org data with subscriptions
- **users** - User profiles with roles
- **clients** - Client/lead management
- **sessions** - Coaching session scheduling
- **payments** - Payment records with Razorpay
- **programs** - Coaching packages
- **automations** - Workflow definitions
- **templates** - Message templates
- **tasks** - Task management
- **communications** - Message history
- **notes** - Session & client notes

### RBAC Tables
- **coach_client_assignments** - Client access control
- **team_invitations** - Pending invites
- **audit_logs** - Complete audit trail

### Usage & Billing
- **organization_usage** - Monthly usage tracking
- **organization_addons** - Add-on purchases
- **usage_alerts** - Limit warnings

## 🤖 Automation System

**Trigger Types:**
- `client_created` - New client onboarding
- `session_scheduled` - Booking confirmations
- `session_completed` - Follow-up workflows
- `payment_received` - Payment receipts
- `payment_failed` - Failed payment recovery
- `trial_ending` - Trial expiration reminders
- Custom triggers

**Action Types:**
- `send_email` - Email from template
- `send_whatsapp` - WhatsApp messaging
- `send_sms` - SMS notifications
- `create_task` - Task creation
- `update_client` - Client data updates
- `webhook` - External API calls

## 💳 Payment Integration

**Razorpay Features:**
- Subscription management
- One-time payments
- Auto-charge after trial
- Payment links
- Refunds & reconciliation
- Webhook notifications

**Supported Methods:**
- UPI, Cards, Net Banking
- Wallets, EMI
- International cards

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Environment Variables Required:**
- All from `.env.example`
- Set `NODE_ENV=production`

### Build Verification

```bash
npm run build
```

Build completes successfully with:
- ✅ TypeScript compilation
- ✅ All type checks passing
- ✅ Static page generation (44 pages)

## 📈 Usage Limits & Add-Ons

**Tracked Resources:**
- Active clients
- Team members
- Email sends
- SMS messages
- WhatsApp messages
- Video call minutes
- AI summaries & insights
- Transcription minutes
- Storage (GB)

**Add-On Pricing:**
- Extra clients: ₹99/5 clients
- SMS packs: ₹199/500 messages
- WhatsApp packs: ₹299/500 messages
- Video minutes: ₹599/20 hours
- AI summaries: ₹499/50 summaries
- Storage: ₹99/10GB
- Transcription: ₹799/100 minutes

## 🔧 Configuration

### Customization
- **Colors**: `tailwind.config.js` (brand-primary, secondary, accent)
- **Plans**: `src/config/pricing.ts`
- **Email Templates**: Templates table in database
- **Automation Templates**: `automation.service.ts`

### Feature Flags
Plan-based features automatically gate access:
- WhatsApp integration (Pro+)
- Advanced analytics (Pro+)
- AI features (Pro+)
- Custom branding (Premium)
- API access (Premium)

## 📚 API Examples

### Client Management
```typescript
import { ClientService } from '@/services/client.service';

// Create client (automatically checks limits)
const client = await ClientService.create(organizationId, {
  email: 'client@example.com',
  fullName: 'John Doe',
  status: 'lead',
});

// Search clients (auto-filtered by RLS)
const { clients, total } = await ClientService.search(organizationId, {
  searchQuery: 'john',
  status: 'active',
});
```

### Permission Checks
```typescript
import { hasPermission, canAccessClient, PERMISSIONS } from '@/lib/auth/permissions';

// Check permission
const canInvite = await hasPermission(userId, PERMISSIONS.ADD_TEAM_MEMBERS);

// Check client access
const hasAccess = await canAccessClient(userId, clientId);
```

### Usage Tracking
```typescript
import { checkUsageLimit, trackUsage } from '@/lib/usage-limits';

// Check before action
const check = await checkUsageLimit(organizationId, 'emails', 1);

if (check.allowed) {
  // Send email
  await trackUsage(organizationId, 'emails', 1);
}
```

## 🧪 Testing

The application includes comprehensive type safety and build verification:

```bash
npm run build  # Full TypeScript + build check
npm run dev    # Development server
```

## 🎯 Recent Updates (January 2025)

- ✅ Fixed all TypeScript build errors
- ✅ Lazy-loaded Razorpay initialization for Vercel builds
- ✅ Added comprehensive type assertions for Supabase queries
- ✅ Implemented usage tracking and limit warnings
- ✅ Added client onboarding wizard
- ✅ Built email notification system
- ✅ Added role selection during signup
- ✅ Implemented feature restriction middleware
- ✅ Created usage stats dashboard

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Database**: Check `supabase/migrations/` for schema

## 💡 Perfect For

- Business Coaches
- Life Coaches
- Career Consultants
- Therapists & Counselors
- Fitness Trainers
- Music Teachers
- Any 1-on-1 service business

## 🌟 Why FlowCoach?

- **Niche-Specific** - Built for coaching businesses
- **All-in-One** - No need for multiple tools
- **Automation-First** - Save 10+ hours/week
- **India-Ready** - Razorpay, WhatsApp, INR pricing
- **Scalable** - Multi-tenant with RLS security
- **Modern Stack** - Fast, secure, maintainable
- **Production-Ready** - Complete with RBAC, billing, automation

---

**Built for coaches who want to focus on coaching, not admin work.** 🚀
