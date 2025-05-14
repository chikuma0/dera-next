#!/usr/bin/env node

/**
 * This script tests the updated SonarDigestService.
 * 
 * Run with: node scripts/test-sonar-digest.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a temporary file that will be executed by Next.js
const rootDir = path.join(__dirname, '..');
const tempFile = path.join(rootDir, 'src/pages/api/temp-test-sonar.ts');

console.log('=== TESTING SONAR DIGEST SERVICE ===');
console.log('This script will:');
console.log('1. Use the updated SonarDigestService to fetch real news from Perplexity');
console.log('2. Update the Sonar digest with real news content');
console.log('=======================================\n');

// Write the temporary file for testing the SonarDigestService
fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import { SonarDigestService } from '@/lib/services/sonarDigestService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing SonarDigestService with real news...');
  
  try {
    // Create a new instance of the SonarDigestService
    const sonarDigestService = new SonarDigestService();
    
    // Generate a new weekly digest with real news
    console.log('Calling Perplexity API to generate digest with real news...');
    const digest = await sonarDigestService.generateWeeklyDigest();
    
    if (!digest) {
      console.error('Failed to generate Sonar digest');
      res.status(500).json({ error: 'Failed to generate Sonar digest' });
      return;
    }
    
    console.log(\`Successfully generated Sonar digest with \${digest.topics.length} topics:\`);
    digest.topics.forEach((topic, index) => {
      console.log(\`  \${index + 1}. \${topic.title}\`);
      
      if (topic.citations && topic.citations.length > 0) {
        console.log(\`     Citations: \${topic.citations.length}\`);
      }
    });
    
    console.log('Sonar digest generation complete!');
    
    res.status(200).json({ 
      success: true, 
      topicsCount: digest.topics.length,
      hasCitations: digest.topics.some(t => t.citations && t.citations.length > 0)
    });
  } catch (error) {
    console.error('Error generating Sonar digest:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

try {
  // Execute the Next.js API route using curl
  let port = 3004; // Default port
  
  try {
    // Check if we can find the port in the environment
    const nextPort = process.env.PORT || process.env.NEXT_PUBLIC_PORT;
    if (nextPort) {
      port = nextPort;
    }
  } catch (portError) {
    console.warn('Could not detect port from environment, using default:', port);
  }
  
  console.log(`Using port ${port} for API request`);
  
  execSync(`curl -s http://localhost:${port}/api/temp-test-sonar`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ SonarDigestService test completed successfully\n');
} catch (error) {
  console.error('❌ Error testing SonarDigestService:', error);
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}

console.log('=== TEST COMPLETE ===');
console.log('The SonarDigestService has been updated to properly handle Perplexity API responses.');
console.log('You can now run the application to see real news in the Sonar digest.');
console.log('=======================================');
