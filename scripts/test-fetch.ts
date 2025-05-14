import fetch from 'node-fetch';

async function testFetch() {
  try {
    const response = await fetch('https://example.com');
    console.log('Fetch works!');
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testFetch(); 