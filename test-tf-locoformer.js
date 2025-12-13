/**
 * Manual test script for TF-Locoformer API endpoints
 * Run with: node test-tf-locoformer.js
 */

const TEST_URLS = {
  separate: 'http://localhost:3000/api/audio/separate',
  clean: 'http://localhost:3000/api/audio/clean',
  enhance: 'http://localhost:3000/api/audio/enhance',
};

async function testGetEndpoint(name, url) {
  console.log(`\n[TEST] GET ${name}...`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('✓ Status:', response.status);
    console.log('✓ Response:', JSON.stringify(data, null, 2));
    
    return true;
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== TF-Locoformer API Tests ===\n');
  console.log('Testing GET endpoints for API information...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test GET endpoints
  for (const [name, url] of Object.entries(TEST_URLS)) {
    const result = await testGetEndpoint(name, url);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  console.log('\n=== API Endpoint Information ===');
  console.log('The following endpoints are now available:');
  console.log('');
  console.log('1. POST /api/audio/separate');
  console.log('   - Separates audio into stems (vocals/instrumental for free, 5 stems for pro)');
  console.log('   - Parameters: audio (file), tier, format, normalize');
  console.log('');
  console.log('2. POST /api/audio/clean');
  console.log('   - Cleans audio for HalfScrew pre-FX processing');
  console.log('   - Parameters: audio (file), tier, format');
  console.log('');
  console.log('3. POST /api/audio/enhance');
  console.log('   - Enhances audio for NoDAW polish');
  console.log('   - Parameters: audio (file), tier, format, enhancementLevel');
  console.log('');
  console.log('To test POST endpoints, start the dev server and use curl or a tool like Postman:');
  console.log('');
  console.log('curl -X POST http://localhost:3000/api/audio/separate \\');
  console.log('  -F "audio=@test.wav" \\');
  console.log('  -F "tier=free" \\');
  console.log('  -F "format=wav"');
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Check Node.js version for fetch support
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.log('Note: This test requires Node.js 18+ with native fetch support');
    console.log(`Current version: ${nodeVersion}`);
    console.log('\nAlternatively, start the Next.js dev server and access the API endpoints directly');
    console.log('\nTo start the server: npm run dev');
  } else {
    runTests().catch(console.error);
  }
} else {
  // Browser environment
  runTests().catch(console.error);
}

// Export for potential use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGetEndpoint, runTests, TEST_URLS };
}
