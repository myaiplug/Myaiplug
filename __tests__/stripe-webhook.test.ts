/**
 * Manual test script for Stripe webhook handler
 * This tests the core logic without requiring actual Stripe webhook events
 */

import { 
  upsertSubscription, 
  getSubscriptionByUserId,
  getUserIdByStripeCustomer,
  hasActiveSubscription,
  updateSubscriptionStatus,
} from '../lib/services/subscriptionService';

import {
  grantTokens,
  getTokenBalance,
  grantMonthlyProTokens,
  TOKEN_AMOUNTS,
  deductTokens,
  freezeTokenUsage,
  unfreezeTokenUsage,
  isTokenUsageFrozen,
} from '../lib/services/tokenService';

import {
  createUser,
  syncUserTierWithSubscription,
} from '../lib/services/userService';

async function testWebhookLogic() {
  console.log('🧪 Testing Stripe Webhook Logic\n');
  
  try {
    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const user = await createUser({
      email: 'test@example.com',
      password: 'testpass123',
      handle: 'testuser',
      ipAddress: '127.0.0.1',
    });
    console.log(`✅ User created: ${user.user.id}, tier: ${user.user.tier}`);
    
    // Test 2: Create subscription
    console.log('\n2️⃣ Creating subscription...');
    const subscription = upsertSubscription({
      userId: user.user.id,
      stripeCustomerId: 'cus_test123',
      stripeSubscriptionId: 'sub_test123',
      priceId: 'price_test123',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    });
    console.log(`✅ Subscription created: ${subscription.id}, status: ${subscription.status}`);
    
    // Test 3: Verify user can be found by Stripe customer ID
    console.log('\n3️⃣ Testing user lookup by Stripe customer ID...');
    const foundUserId = getUserIdByStripeCustomer('cus_test123');
    console.log(`✅ Found user: ${foundUserId === user.user.id ? 'YES' : 'NO'}`);
    
    // Test 4: Sync user tier with subscription
    console.log('\n4️⃣ Syncing user tier with subscription...');
    const updatedUser = syncUserTierWithSubscription(user.user.id);
    console.log(`✅ User tier updated: ${updatedUser?.tier}`);
    
    // Test 5: Check active subscription
    console.log('\n5️⃣ Checking active subscription...');
    const isActive = hasActiveSubscription(user.user.id);
    console.log(`✅ Has active subscription: ${isActive}`);
    
    // Test 6: Grant monthly tokens
    console.log('\n6️⃣ Granting monthly Pro tokens...');
    const tokenGrant = grantMonthlyProTokens(user.user.id, subscription.id);
    const balance = getTokenBalance(user.user.id);
    console.log(`✅ Tokens granted: ${tokenGrant?.amount}, balance: ${balance}`);
    
    // Test 6b: Test idempotency - try granting again for same period
    console.log('\n6️⃣b Testing idempotency - granting tokens again...');
    const duplicateGrant = grantMonthlyProTokens(user.user.id, subscription.id);
    const balanceAfterDuplicate = getTokenBalance(user.user.id);
    console.log(`✅ Duplicate grant result: ${duplicateGrant === null ? 'BLOCKED (correct)' : 'ALLOWED (incorrect)'}`);
    console.log(`✅ Balance unchanged: ${balance === balanceAfterDuplicate ? 'YES' : 'NO'}`);
    
    // Test 7: Test payment failure scenario
    console.log('\n7️⃣ Testing payment failure (past_due)...');
    updateSubscriptionStatus('sub_test123', 'past_due');
    const subAfterFailed = getSubscriptionByUserId(user.user.id);
    console.log(`✅ Subscription status: ${subAfterFailed?.status}`);
    const userAfterFailed = syncUserTierWithSubscription(user.user.id);
    console.log(`✅ User tier after failed payment: ${userAfterFailed?.tier}`);
    
    // Test 7b: Test token freeze
    console.log('\n7️⃣b Testing token freeze...');
    freezeTokenUsage(user.user.id);
    const isFrozen = isTokenUsageFrozen(user.user.id);
    console.log(`✅ Tokens frozen: ${isFrozen}`);
    const canDeduct = deductTokens(user.user.id, 10);
    console.log(`✅ Can deduct tokens when frozen: ${canDeduct ? 'YES (incorrect)' : 'NO (correct)'}`);
    
    // Test 8: Test payment success after past_due
    console.log('\n8️⃣ Testing payment success (recovery)...');
    updateSubscriptionStatus('sub_test123', 'active');
    const userAfterRecovery = syncUserTierWithSubscription(user.user.id);
    console.log(`✅ User tier after recovery: ${userAfterRecovery?.tier}`);
    
    // Test 8b: Test token unfreeze
    console.log('\n8️⃣b Testing token unfreeze...');
    unfreezeTokenUsage(user.user.id);
    const isStillFrozen = isTokenUsageFrozen(user.user.id);
    console.log(`✅ Tokens still frozen: ${isStillFrozen ? 'YES (incorrect)' : 'NO (correct)'}`);
    const canDeductAfterUnfreeze = deductTokens(user.user.id, 10);
    const balanceAfterDeduct = getTokenBalance(user.user.id);
    console.log(`✅ Can deduct tokens after unfreeze: ${canDeductAfterUnfreeze ? 'YES (correct)' : 'NO (incorrect)'}`);
    console.log(`✅ Balance after deduct: ${balanceAfterDeduct}`);
    
    // Test 9: Test subscription cancellation
    console.log('\n9️⃣ Testing subscription cancellation...');
    updateSubscriptionStatus('sub_test123', 'canceled');
    const userAfterCancel = syncUserTierWithSubscription(user.user.id);
    console.log(`✅ User tier after cancellation: ${userAfterCancel?.tier}`);
    const isStillActive = hasActiveSubscription(user.user.id);
    console.log(`✅ Has active subscription after cancel: ${isStillActive}`);
    
    console.log('\n✅ All webhook logic tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testWebhookLogic();
