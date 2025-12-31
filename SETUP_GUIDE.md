# 🚀 Complete Setup Guide - Razorpay Integration

## What I've Built For You:

✅ Razorpay server client
✅ Subscription management APIs
✅ Checkout page with card collection
✅ Webhook handler for auto-charging
✅ Database schema for subscriptions
✅ Plan configuration
✅ Trial banner & dashboard

## 🎯 What YOU Need to Do Now (Critical!):

### Step 1: Run Database Migrations in Supabase

Go to **Supabase Dashboard** → **SQL Editor** → Run these 3 migrations IN ORDER:

**Migration 1** - User creation trigger:
```sql
-- Copy from: supabase/migrations/20250101000008_handle_new_user_trigger.sql
```

**Migration 2** - RLS policies:
```sql
-- Copy from: supabase/migrations/20250101000009_fix_users_rls_policies.sql
```

**Migration 3** - Subscription fields:
```sql
-- Copy from: supabase/migrations/20250101000010_add_subscription_fields.sql
```

### Step 2: Create Razorpay Plans

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Subscriptions** → **Plans**
3. Click **Create Plan**

**Create 3 Plans:**

**Plan 1: Standard**
- Plan Name: `CoachCRM Standard`
- Billing Amount: `₹1,499`
- Billing Cycle: `Monthly`
- Description: `Standard plan with 25 clients`
- Copy the `plan_id` (looks like `plan_xxxxx`)

**Plan 2: Pro**
- Plan Name: `CoachCRM Pro`
- Billing Amount: `₹3,999`
- Billing Cycle: `Monthly`
- Description: `Pro plan with 100 clients`
- Copy the `plan_id`

**Plan 3: Premium**
- Plan Name: `CoachCRM Premium`
- Billing Amount: `₹7,999`
- Billing Cycle: `Monthly`
- Description: `Premium plan with unlimited clients`
- Copy the `plan_id`

### Step 3: Update Plan IDs in Code

Open `src/lib/razorpay/config.ts` and update:

```typescript
export const RAZORPAY_PLANS = {
  standard: {
    ...
    razorpayPlanId: 'plan_PASTE_YOUR_STANDARD_PLAN_ID_HERE',
  },
  pro: {
    ...
    razorpayPlanId: 'plan_PASTE_YOUR_PRO_PLAN_ID_HERE',
  },
  premium: {
    ...
    razorpayPlanId: 'plan_PASTE_YOUR_PREMIUM_PLAN_ID_HERE',
  },
};
```

### Step 4: Set Up Webhooks (After Deployment)

**Note**: Webhooks only work with deployed apps (not localhost).

When you deploy to Vercel/production:

1. Go to Razorpay Dashboard → **Webhooks**
2. Click **Create Webhook**
3. **Webhook URL**: `https://yourdomain.com/api/razorpay/webhook`
4. **Events to Subscribe**:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `payment.failed`
5. Click **Create**
6. Copy the **Webhook Secret**
7. Add to `.env.local`:
   ```
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
   ```

### Step 5: Update Auth Callback Flow

The callback currently redirects directly to dashboard. We need to redirect to checkout first.

**File to modify**: `src/app/auth/callback/page.tsx`

Change line 93 from:
```typescript
router.push('/dashboard');
```

To:
```typescript
// Get selected plan from user metadata
const selectedPlan = data.user.user_metadata?.selected_plan || 'standard';
router.push(`/checkout?plan=${selectedPlan}`);
```

## 📋 Complete Workflow (How It Works):

1. **User visits** `/signup`
2. **Selects plan** (Standard/Pro/Premium)
3. **Fills form** → Creates auth account
4. **Email sent** → User verifies email
5. **Redirects to** `/checkout?plan=pro`
6. **Clicks "Add Card"** → Razorpay popup opens
7. **Enters card details** → Card authorized (₹0)
8. **Subscription created** with 7-day trial
9. **Redirects to** `/dashboard`
10. **Trial banner shows** "7 days left"

**After 7 Days:**
11. **Razorpay auto-charges** the card
12. **Webhook fires** → Updates DB to "active"
13. **User continues** using the app

**If Payment Fails:**
- Razorpay retries 3 times
- Sends email notifications
- After all retries fail → status = "payment_failed"
- Block access + show upgrade page

## 🎨 Testing Razorpay (Before Going Live):

Use Razorpay **Test Mode**:

**Test Card Numbers:**
- Success: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `1234`

**Switch to Test Mode:**
1. Toggle "Test Mode" in Razorpay dashboard
2. Use test API keys
3. Create test plans
4. Test the full flow

## ⚠️ Known Issues to Fix:

1. **Checkout redirect**: Need to update auth callback
2. **Plan IDs**: Need real Razorpay plan IDs
3. **Webhook testing**: Need deployed URL (use ngrok for local testing)
4. **Feature restrictions**: Not yet implemented
5. **Role selection**: Not yet added to signup

## 📝 Files I Created:

```
src/lib/razorpay/
  ├── config.ts                          # Plan configuration
  └── server.ts                          # Razorpay server client

src/app/api/
  ├── subscriptions/create/route.ts      # Create subscription API
  └── razorpay/webhook/route.ts          # Webhook handler

src/app/(auth)/
  └── checkout/page.tsx                  # Card collection page

supabase/migrations/
  └── 20250101000010_add_subscription_fields.sql
```

## 🚀 Next Steps:

1. [ ] Run 3 database migrations
2. [ ] Create 3 Razorpay plans
3. [ ] Update plan IDs in config
4. [ ] Update auth callback redirect
5. [ ] Test signup → checkout flow
6. [ ] Deploy to test webhooks
7. [ ] Add feature restrictions
8. [ ] Add role selection

---

**Current Status**: 70% Complete
**Time to Finish**: 2-3 hours

**Questions?** Just ask!
