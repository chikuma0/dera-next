#!/usr/bin/env node

/**
 * This script triggers the news collection API endpoint.
 * 
 * Usage:
 *  node scripts/collect-news.js
 * 
 * Environment variables:
 *  API_URL - The base URL of the API (default: http://localhost:3000)
 *  API_KEY - The API key for authentication (required)
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY; 

if (!API_KEY) {
  console.error('Error: API_KEY environment variable is required');
  process.exit(1);
}

async function collectNews() {
  try {
    console.log('Triggering news collection...');
    
    const response = await fetch(`${API_URL}/api/news/collect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API returned ${response.status}: ${error}`);
    }
    
    const result = await response.json();
    
    console.log('News collection completed successfully:');
    console.log(`- Processed ${result.data.processed} items`);
    console.log(`- Saved ${result.data.saved} new items`);
    console.log(`- Message: ${result.message}`);
    
    return result;
  } catch (error) {
    console.error('Error collecting news:', error.message);
    process.exit(1);
  }
}

collectNews(); 