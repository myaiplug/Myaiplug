# Stripe Webhook Integration

This document describes the Stripe webhook integration for MyAiPlug subscription management.

## Overview

The Stripe webhook handler processes subscription events from Stripe and manages user memberships, token grants, and tier assignments server-side.

## Webhook Endpoint

**URL**: `/api/webhooks/stripe`
**Method**: POST
**Security**: Stripe signature verification using `STRIPE_WEBHOOK_SECRET`

## Events Handled

### 1. customer.subscription.created
Triggered when a new subscription is created.

**Actions**:
- Creates subscription record in database
- Sets user tier to `pro`
- Grants 500 monthly tokens
- Maps Stripe customer to user

### 2. customer.subscription.updated
Triggered when subscription details change.

**Actions**:
- Updates subscription record
- Syncs user tier with subscription status
- Handles status changes (active, past_due, etc.)

### 3. customer.subscription.deleted
Triggered when subscription is canceled.

**Actions**:
- Marks subscription as canceled
- Downgrades user to `free` tier
- Preserves historical data (jobs, leaderboard stats)

### 4. invoice.payment_succeeded
Triggered when payment succeeds (initial or renewal).

**Actions**:
- Marks subscription as active
- Updates user tier to pro
- Unfreezes token usage
- Grants monthly tokens on renewals (with idempotency)

### 5. invoice.payment_failed
Triggered when payment fails.

**Actions**:
- Marks subscription as past_due
- Freezes token usage (prevents new jobs)
- Does NOT delete user data

## Architecture

### Services

#### SubscriptionService (`lib/services/subscriptionService.ts`)
Manages subscription records and lookups.

Key functions:
- `upsertSubscription()` - Create/update subscription
- `getSubscriptionByUserId()` - Get user's subscription
- `hasActiveSubscription()` - Check if subscription is active
- `updateSubscriptionStatus()` - Update status

#### TokenService (`lib/services/tokenService.ts`)
Manages token balance and grants.

Key functions:
- `grantMonthlyProTokens()` - Grant 500 tokens (idempotent)
- `getTokenBalance()` - Get user's token balance
- `deductTokens()` - Deduct tokens (respects freeze)
- `freezeTokenUsage()` - Freeze for past_due
- `unfreezeTokenUsage()` - Unfreeze after payment

#### UserService Updates
- `getUserByEmail()` - Lookup users by email
- `syncUserTierWithSubscription()` - Auto-sync tier

## Configuration

Required environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## User Mapping

The webhook maps Stripe customers to users using:

1. **Stripe Customer Metadata**: `metadata.user_id`
2. **Email Matching**: Falls back to email lookup
3. **Cached Mappings**: Uses in-memory index for performance

## Idempotency

Token grants are idempotent based on:
- Subscription ID
- Billing period (month/year)

This prevents duplicate grants if the same webhook is received multiple times.

## Token Management

### Monthly Token Grant
- **Amount**: 500 tokens
- **Trigger**: New subscription or renewal payment
- **Idempotency**: Per billing period

### Token Freeze
- **Trigger**: Payment failure
- **Effect**: Prevents token deduction
- **Duration**: Until payment succeeds
- **Data**: Preserved (not deleted)

## Leaderboard Eligibility

Only users with active subscriptions (status = `active` or `trialing`) are eligible for the leaderboard.

## Testing

Run tests:
```bash
npx tsx __tests__/stripe-webhook.test.ts
```

Tests verify:
- Subscription creation and updates
- Token grants with idempotency
- Tier changes
- Token freeze/unfreeze
- Subscription cancellation

## Stripe Dashboard Setup

1. **Webhook Configuration**:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: 
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Customer Metadata**:
   When creating Stripe customers, add:
   ```javascript
   metadata: {
     user_id: 'user_123abc'
   }
   ```

## Security

- ✅ Webhook signature verification prevents unauthorized requests
- ✅ All operations are server-side only (frontend cannot modify)
- ✅ No sensitive data exposed in responses
- ✅ Comprehensive error logging
- ✅ CodeQL security scan passed

## Monitoring

Key logs to monitor:
- `Received Stripe event: <event_type>`
- `Subscription created for user <userId>`
- `Payment failed for subscription <subId>, tokens frozen`
- `Granted N tokens to user <userId>`
- `Tokens already granted for <userId> in period <period>`

## Error Handling

- **Missing signature**: Returns 400
- **Invalid signature**: Returns 400 with error message
- **User not found**: Logs error, returns 200 (acknowledges webhook)
- **Stripe not configured**: Returns 500

## Future Enhancements

Potential improvements:
- Database persistence (replace in-memory stores)
- Supabase integration for subscription tables
- Email notifications for payment failures
- Webhook retry mechanism
- Multiple subscription tiers
- Annual vs monthly plans
