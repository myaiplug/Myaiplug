#!/usr/bin/env node
/**
 * API Test Script for Phase 4
 * Tests all endpoints to ensure they work correctly
 */

const BASE_URL = 'http://localhost:3000';
let sessionToken = '';
let userId = '';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test suite
async function runTests() {
  console.log('🚀 Starting Phase 4 API Tests\n');

  // Test 1: Sign Up
  console.log('1️⃣  Testing Sign Up...');
  const signupResult = await apiCall('POST', '/api/auth/signup', {
    email: `testuser${Date.now()}@example.com`,
    password: 'testpassword123',
    handle: `testuser${Date.now()}`,
  });
  
  if (signupResult.status === 200 && signupResult.data.success) {
    console.log('✅ Sign Up successful');
    sessionToken = signupResult.data.sessionToken;
    userId = signupResult.data.user.id;
    console.log(`   User ID: ${userId}`);
    console.log(`   Points: ${signupResult.data.profile.pointsTotal}`);
  } else {
    console.log('❌ Sign Up failed:', signupResult.data.error);
    return;
  }

  // Test 2: Get Session
  console.log('\n2️⃣  Testing Get Session...');
  const sessionResult = await apiCall('GET', '/api/auth/session', null, sessionToken);
  if (sessionResult.status === 200 && sessionResult.data.success) {
    console.log('✅ Session check successful');
  } else {
    console.log('❌ Session check failed');
  }

  // Test 3: Get Profile
  console.log('\n3️⃣  Testing Get Profile...');
  const profileResult = await apiCall('GET', '/api/user/profile', null, sessionToken);
  if (profileResult.status === 200 && profileResult.data.success) {
    console.log('✅ Get Profile successful');
    console.log(`   Level: ${profileResult.data.profile.level}`);
  } else {
    console.log('❌ Get Profile failed');
  }

  // Test 4: Update Profile
  console.log('\n4️⃣  Testing Update Profile...');
  const updateResult = await apiCall('PUT', '/api/user/profile', {
    bio: 'Test bio for API testing',
  }, sessionToken);
  if (updateResult.status === 200 && updateResult.data.success) {
    console.log('✅ Update Profile successful');
  } else {
    console.log('❌ Update Profile failed');
  }

  // Test 5: Create Job
  console.log('\n5️⃣  Testing Create Job...');
  const jobResult = await apiCall('POST', '/api/jobs', {
    type: 'audio_basic',
    inputDurationSec: 180,
  }, sessionToken);
  if (jobResult.status === 200 && jobResult.data.success) {
    console.log('✅ Create Job successful');
    console.log(`   Job ID: ${jobResult.data.job.id}`);
    console.log(`   Status: ${jobResult.data.job.status}`);
  } else {
    console.log('❌ Create Job failed');
  }

  // Test 6: Get Jobs
  console.log('\n6️⃣  Testing Get Jobs...');
  // Wait a moment for job to process
  await new Promise(resolve => setTimeout(resolve, 1000));
  const jobsResult = await apiCall('GET', '/api/jobs', null, sessionToken);
  if (jobsResult.status === 200 && jobsResult.data.success) {
    console.log('✅ Get Jobs successful');
    console.log(`   Total jobs: ${jobsResult.data.total}`);
  } else {
    console.log('❌ Get Jobs failed');
  }

  // Test 7: Create Creation
  console.log('\n7️⃣  Testing Create Creation...');
  const creationResult = await apiCall('POST', '/api/creations', {
    jobId: jobResult.data?.job?.id || 'job_test',
    title: 'Test Creation',
    tags: ['test', 'api'],
    mediaUrl: 'https://example.com/test.wav',
    isPublic: true,
  }, sessionToken);
  if (creationResult.status === 200 && creationResult.data.success) {
    console.log('✅ Create Creation successful');
    console.log(`   Creation ID: ${creationResult.data.creation.id}`);
  } else {
    console.log('❌ Create Creation failed');
  }

  // Test 8: Get Referrals
  console.log('\n8️⃣  Testing Get Referrals...');
  const referralsResult = await apiCall('GET', '/api/referrals', null, sessionToken);
  if (referralsResult.status === 200 && referralsResult.data.success) {
    console.log('✅ Get Referrals successful');
    console.log(`   Referral code: ${referralsResult.data.referralLink.code}`);
  } else {
    console.log('❌ Get Referrals failed');
  }

  // Test 9: Get User Stats
  console.log('\n9️⃣  Testing Get User Stats...');
  const statsResult = await apiCall('GET', '/api/user/stats', null, sessionToken);
  if (statsResult.status === 200 && statsResult.data.success) {
    console.log('✅ Get User Stats successful');
    console.log(`   Total points: ${statsResult.data.stats.points.total}`);
    console.log(`   Total jobs: ${statsResult.data.stats.jobs.totalJobs}`);
  } else {
    console.log('❌ Get User Stats failed');
  }

  // Test 10: Get Leaderboard
  console.log('\n🔟 Testing Get Leaderboard...');
  const leaderboardResult = await apiCall('GET', '/api/leaderboard?type=time_saved&period=alltime');
  if (leaderboardResult.status === 200 && leaderboardResult.data.success) {
    console.log('✅ Get Leaderboard successful');
    console.log(`   Entries: ${leaderboardResult.data.entries.length}`);
  } else {
    console.log('❌ Get Leaderboard failed');
  }

  // Test 11: Logout
  console.log('\n1️⃣1️⃣  Testing Logout...');
  const logoutResult = await apiCall('POST', '/api/auth/logout', null, sessionToken);
  if (logoutResult.status === 200 && logoutResult.data.success) {
    console.log('✅ Logout successful');
  } else {
    console.log('❌ Logout failed');
  }

  console.log('\n✨ All tests completed!\n');
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
