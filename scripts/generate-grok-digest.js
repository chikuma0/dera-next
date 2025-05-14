// scripts/generate-grok-digest.js

/**
 * This script generates a new Grok AI News Digest.
 * It can be scheduled to run weekly using a cron job or similar.
 * 
 * Example cron job (runs every Sunday at midnight):
 * 0 0 * * 0 cd /path/to/your/project && node scripts/generate-grok-digest.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set.');
  process.exit(1);
}

if (!process.env.XAI_API_KEY) {
  console.error('Error: XAI_API_KEY environment variable is not set.');
  process.exit(1);
}

async function generateGrokDigest() {
  try {
    console.log('Generating new Grok digest...');
    
    // Determine the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    
    // Call the API to generate a new digest
    const response = await fetch(`${baseUrl}/api/news/grok-digest?generate=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Grok digest generated successfully!');
      console.log(`Title: ${data.data.title}`);
      console.log(`Topics: ${data.data.topics.length}`);
      console.log(`Date: ${new Date(data.data.date).toLocaleDateString()}`);
      console.log(`Published at: ${new Date(data.data.publishedAt).toLocaleString()}`);
    } else {
      throw new Error(`Failed to generate digest: ${data.error}`);
    }
  } catch (error) {
    console.error('Error generating Grok digest:', error);
    process.exit(1);
  }
}

// Run the function
generateGrokDigest();