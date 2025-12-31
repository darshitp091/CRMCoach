# Professional CRM Workflow Implementation

## Complete User Journey:

### **1. SIGNUP FLOW**

```
User visits /signup
   ↓
Choose Plan (Standard/Pro/Premium) ← DONE ✅
   ↓
Fill Details (Name, Email, Org, Password)
   ↓
[NEW] Select Primary Role (Owner is auto-assigned, but can add team later)
   ↓
Click "Start 7-Day Trial"
   ↓
Redirect to /checkout
   ↓
Enter Card Details (Razorpay)
   ↓
Card Authorized (₹0 charge, just authorization)
   ↓
Create Razorpay Subscription (7-day trial)
   ↓
Send Verification Email
   ↓
Email Verified → Create Organization
   ↓
Redirect to /dashboard/onboarding
   ↓
Setup Wizard (optional)
   ↓
Dashboard with Trial Banner
```

### **2. DURING TRIAL (Days 1-7)**

- Full access to selected plan features
- Trial banner shows "X days left"
- Can upgrade/change plan anytime
- Can add team members (if role permits)

### **3. TRIAL END (Day 7)**

**Razorpay Auto-Charge Flow:**
```
Day 7 arrives
   ↓
Razorpay automatically charges saved card
   ↓
Webhook → /api/razorpay/webhook
   ↓
Update organization: subscription_status = 'active'
   ↓
Send "Welcome to paid plan" email
```

**If Payment Fails:**
```
Razorpay retries (3 attempts over 7 days)
   ↓
Send "Payment failed" email
   ↓
If all retries fail → subscription_status = 'expired'
   ↓
Block access (show upgrade page)
```

### **4. PLAN-BASED FEATURES**

| Feature | Standard | Pro | Premium |
|---------|----------|-----|---------|
| Clients | 25 | 100 | Unlimited |
| Sessions | Unlimited | Unlimited | Unlimited |
| Video Calls | ❌ | 50hrs/mo | 200hrs/mo |
| WhatsApp | ❌ | ✅ | ✅ |
| AI Features | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ |
| Team Members | 1 | 5 | Unlimited |
| Analytics | Basic | Advanced | Enterprise |

**Enforcement:**
- API level: Check plan before allowing action
- UI level: Show "Upgrade" button if feature not available
- Database: RLS policies check plan

### **5. ROLE-BASED ACCESS**

**Owner** (Auto-assigned to signup user)
- Full access to everything
- Can manage billing
- Can assign roles to team
- Can delete organization

**Admin** (Assigned by Owner)
- All features except billing
- Can manage team
- Can view all clients

**Manager** (Assigned by Owner/Admin)
- Can manage clients & sessions
- Can view team
- Cannot manage billing/team

**Coach** (Assigned by Manager/Admin/Owner)
- Only see assigned clients
- Cannot see other coaches' clients
- Basic features only

**Support** (Assigned by any manager+)
- Read-only access
- Can view clients/sessions
- Cannot edit anything

### **6. UPGRADE/DOWNGRADE FLOW**

```
User clicks "Upgrade" in dashboard
   ↓
Show plan comparison
   ↓
Select new plan
   ↓
Click "Upgrade Now"
   ↓
Razorpay updates subscription
   ↓
Prorated charge (immediate)
   ↓
Update organization plan
   ↓
New features unlocked
```

## Files to Create/Modify:

### New Files:
1. `src/lib/razorpay/client.ts` - Razorpay config
2. `src/lib/razorpay/subscriptions.ts` - Subscription management
3. `src/app/api/razorpay/webhook/route.ts` - Webhook handler
4. `src/app/api/subscriptions/create/route.ts` - Create subscription
5. `src/app/(auth)/checkout/page.tsx` - Card collection
6. `src/app/dashboard/onboarding/page.tsx` - Setup wizard
7. `src/middleware/features.ts` - Feature restriction middleware
8. `src/hooks/use-plan-limits.ts` - Check plan limits
9. `src/components/upgrade-prompt.tsx` - Upgrade CTA

### Modified Files:
1. `src/app/(auth)/signup/page.tsx` - Add role selection
2. `src/app/(dashboard)/layout.tsx` - Feature-based nav
3. `src/services/auth.service.ts` - Save card details
4. Database migrations - Add subscriptions table

## Implementation Order:

**Phase 1: Checkout & Card Collection** ← START HERE
1. Create checkout page
2. Integrate Razorpay checkout
3. Save card authorization
4. Create subscription

**Phase 2: Webhooks & Auto-Charge**
1. Webhook endpoint
2. Handle subscription events
3. Update database
4. Send emails

**Phase 3: Feature Restrictions**
1. Plan limits in config
2. Check limits in API
3. Show upgrade prompts
4. Block premium features

**Phase 4: Role Management**
1. Role selection UI
2. Team invite flow
3. Role-based permissions
4. RLS policies update

## Next Action:
Start with Phase 1 - Checkout page with Razorpay integration
