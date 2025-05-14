#!/usr/bin/env node

/**
 * This script tests the news collection API endpoint.
 */

const API_URL = 'http://localhost:3003';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

async function testNewsCollection() {
  try {
    console.log('Testing news collection...');
    console.log('Using Supabase URL:', SUPABASE_URL);
    
    const response = await fetch(`${API_URL}/api/news/collect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'X-Supabase-URL': SUPABASE_URL,
        'X-Supabase-Anon-Key': SUPABASE_ANON_KEY
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API returned ${response.status}: ${error}`);
    }
    
    const result = await response.json();
    
    console.log('News collection test completed:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error testing news collection:', error.message);
    process.exit(1);
  }
}

testNewsCollection(); 