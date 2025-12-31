# Professional CRM Implementation Plan

## Current Issues to Fix:

### 1. **Plan Selection & Trial Flow** ❌
**Current**: No plan selection, trial starts automatically
**Needed**:
- Plan selection during signup
- Card collection (via Stripe)
- Trial starts after card is saved
- Auto-charge after 7 days

### 2. **Feature Restrictions** ❌
**Current**: All users can access all features
**Needed**:
- Standard: Limited clients (25), basic features
- Pro: More clients (100), advanced features
- Premium: Unlimited clients, all features
- Enforce limits in backend

### 3. **Role-Based Access** ❌
**Current**: All roles see everything
**Needed**:
- Owner/Admin: Full access
- Manager: Team + clients management
- Coach: Only assigned clients
- Support: Limited read-only access

### 4. **Payment Integration** ❌
**Current**: Razorpay placeholders
**Needed**:
- Stripe integration
- Card element during signup
- Subscription creation
- Webhook handling for auto-charge

## Implementation Steps:

### Phase 1: Stripe Setup
1. Install Stripe SDK
2. Create Stripe products/prices
3. Set up webhook endpoint
4. Configure environment variables

### Phase 2: Signup Workflow
1. Update signup to show plan selection
2. Create checkout step after signup
3. Collect card details with Stripe Elements
4. Create Stripe customer + subscription
5. Email verification flow
6. Trial period handling

### Phase 3: Feature Restrictions
1. Create subscription middleware
2. Add plan limits to database
3. Enforce limits in API endpoints
4. Show upgrade prompts when limits reached
5. Role-based permission checks

### Phase 4: Auto-Charging
1. Set up Stripe webhooks
2. Handle trial_ending event
3. Handle payment_failed event
4. Update subscription status in database
5. Send email notifications

### Phase 5: Role Permissions
1. Update RLS policies
2. Add role-based UI hiding
3. Implement permission checks
4. Create role assignment flow

## File Structure:

```
src/
├── lib/
│   ├── stripe/
│   │   ├── client.ts          # Stripe client config
│   │   ├── products.ts        # Product definitions
│   │   └── webhooks.ts        # Webhook handlers
│   ├── middleware/
│   │   ├── subscription.ts    # Plan limit checks
│   │   └── permissions.ts     # Role checks
│   └── hooks/
│       ├── use-subscription.ts
│       └── use-features.ts
├── app/
│   ├── (auth)/
│   │   ├── signup/
│   │   │   └── page.tsx       # Plan selection
│   │   └── checkout/
│   │       └── page.tsx       # Card collection
│   └── api/
│       ├── stripe/
│       │   └── webhook/
│       │       └── route.ts   # Webhook endpoint
│       └── subscriptions/
│           └── route.ts       # Subscription API
```

## Environment Variables Needed:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product IDs
STRIPE_PRODUCT_STANDARD=price_...
STRIPE_PRODUCT_PRO=price_...
STRIPE_PRODUCT_PREMIUM=price_...
```

## Stripe Products to Create:

1. **Standard Plan**
   - Price: ₹1,499/month
   - Trial: 7 days
   - Features: 25 clients, basic scheduling

2. **Pro Plan**
   - Price: ₹3,999/month
   - Trial: 7 days
   - Features: 100 clients, advanced analytics

3. **Premium Plan**
   - Price: ₹7,999/month
   - Trial: 7 days
   - Features: Unlimited clients, white-label

## Next Actions:

1. Set up Stripe account
2. Create products in Stripe dashboard
3. Install Stripe packages
4. Implement step by step

---

**Note**: This is a COMPLETE rewrite of the subscription and authentication flow to match professional SaaS standards.
