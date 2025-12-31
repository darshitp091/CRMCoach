# ✅ Implementation Checklist

## IMMEDIATE ACTIONS (Do These First):

### 1. Database Setup
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Run migration: `20250101000008_handle_new_user_trigger.sql`
- [ ] Run migration: `20250101000009_fix_users_rls_policies.sql`
- [ ] Run migration: `20250101000010_add_subscription_fields.sql`

### 2. Razorpay Plans
- [ ] Login to Razorpay Dashboard
- [ ] Go to Subscriptions → Plans
- [ ] Create "Standard" plan (₹1,499/month)
- [ ] Create "Pro" plan (₹3,999/month)
- [ ] Create "Premium" plan (₹7,999/month)
- [ ] Copy all 3 plan IDs

### 3. Update Code
- [ ] Open `src/lib/razorpay/config.ts`
- [ ] Paste Standard plan ID
- [ ] Paste Pro plan ID
- [ ] Paste Premium plan ID

### 4. Fix Auth Flow
- [ ] Open `src/app/auth/callback/page.tsx`
- [ ] Find line 93: `router.push('/dashboard');`
- [ ] Replace with redirect to checkout (see SETUP_GUIDE.md)

## TESTING (After Above Steps):

- [ ] Restart dev server
- [ ] Go to `/signup`
- [ ] Select a plan
- [ ] Fill form and submit
- [ ] Check email for verification
- [ ] Click verification link
- [ ] Should redirect to `/checkout`
- [ ] Click "Add Card"
- [ ] Razorpay popup should open
- [ ] Use test card: 4111 1111 1111 1111
- [ ] Complete checkout
- [ ] Should redirect to dashboard
- [ ] Trial banner should show "7 days left"

## DEPLOYMENT (For Webhooks):

- [ ] Deploy to Vercel/production
- [ ] Get production URL
- [ ] Add webhook in Razorpay Dashboard
- [ ] URL: `https://yourdomain.com/api/razorpay/webhook`
- [ ] Subscribe to events
- [ ] Copy webhook secret
- [ ] Add to production environment variables

## ADVANCED (Later):

- [ ] Feature restrictions
- [ ] Role selection in signup
- [ ] Usage tracking
- [ ] Email notifications
- [ ] Admin panel

---

**Start Here**: Step 1 - Database Setup
**Then**: Step 2 - Razorpay Plans
**Then**: Step 3 - Update Code
**Finally**: Step 4 - Testing

Everything you need is in `SETUP_GUIDE.md`!
