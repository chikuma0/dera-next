// Simple test script to verify language switching functionality

// Test 1: Check if the root URL redirects to /en/home
async function testRootRedirect() {
  console.log('Test 1: Testing root URL redirect...');
  const response = await fetch('http://localhost:3000', { redirect: 'manual' });
  const location = response.headers.get('location');
  
  if (location === '/en/home') {
    console.log('✅ Test 1 passed: Root URL redirects to /en/home');
  } else {
    console.error('❌ Test 1 failed: Root URL does not redirect to /en/home');
    console.error(`Expected: /en/home, Got: ${location}`);
  }
}

// Test 2: Check if language switching works
async function testLanguageSwitching() {
  console.log('\nTest 2: Testing language switching...');
  
  // Test switching to Japanese
  const responseJa = await fetch('http://localhost:3000/ja/home');
  const htmlJa = await responseJa.text();
  
  if (htmlJa.includes('AIソリューションで未来を切り開く')) {
    console.log('✅ Japanese content is loading correctly');
  } else {
    console.error('❌ Failed to load Japanese content');
  }
  
  // Test switching back to English
  const responseEn = await fetch('http://localhost:3000/en/home');
  const htmlEn = await responseEn.text();
  
  if (htmlEn.includes('AI Solutions for the Future')) {
    console.log('✅ English content is loading correctly');
  } else {
    console.error('❌ Failed to load English content');
  }
}

// Run the tests
async function runTests() {
  try {
    await testRootRedirect();
    await testLanguageSwitching();
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

runTests();
