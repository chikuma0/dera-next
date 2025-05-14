#!/usr/bin/env node

/**
 * This script refreshes the Sonar Digest with real news data.
 * It fetches real news from various sources, updates the database,
 * and then regenerates the Sonar Digest with this real data.
 * 
 * Run with: node scripts/refresh-sonar-with-real-news.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a temporary file that will be executed by Next.js
const rootDir = path.join(__dirname, '..');
const tempFile = path.join(rootDir, 'src/pages/api/temp-refresh-sonar-news.ts');

console.log('=== SONAR DIGEST REAL NEWS REFRESH ===');
console.log('This script will:');
console.log('1. Fetch real news data from all sources');
console.log('2. Update the database with fresh news');
console.log('3. Regenerate the Sonar Digest with real news data');
console.log('4. Update the Twitter-enhanced Sonar Digest');
console.log('=======================================\n');

// Step 1: Fetch real Twitter data
console.log('Step 1: Fetching real Twitter data...');
try {
  execSync('node scripts/fetch-real-twitter-data.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('✅ Twitter data fetched successfully\n');
} catch (error) {
  console.error('❌ Error fetching Twitter data:', error);
  console.log('Continuing with the process...\n');
}

// Step 2: Fetch real news from all sources
console.log('Step 2: Fetching real news from all sources...');

// Write the temporary file for fetching news
fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndStoreNews } from '@/lib/news/fetcher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Fetching real news from all sources...');
  
  try {
    // Fetch English news with alternative sources
    console.log('Fetching English news...');
    const enNews = await fetchAndStoreNews('en', true);
    console.log(\`Fetched \${enNews.length} English news items\`);
    
    // Fetch Japanese news with alternative sources
    console.log('Fetching Japanese news...');
    const jaNews = await fetchAndStoreNews('ja', true);
    console.log(\`Fetched \${jaNews.length} Japanese news items\`);
    
    console.log('News fetch complete!');
    
    res.status(200).json({ 
      success: true, 
      enNewsCount: enNews.length,
      jaNewsCount: jaNews.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
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
  
  execSync(`curl -s http://localhost:${port}/api/temp-refresh-sonar-news`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ Real news fetched successfully\n');
} catch (error) {
  console.error('❌ Error fetching real news:', error);
  console.log('Continuing with the process...\n');
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary news fetch file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}

// Step 3: Generate Sonar Digest with real news
console.log('Step 3: Generating Sonar Digest with real news...');

// Write the temporary file for generating Sonar Digest
fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import { SonarDigestService } from '@/lib/services/sonarDigestService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Generating Sonar digest with real news...');
  
  try {
    // Create a new instance of the SonarDigestService
    const sonarDigestService = new SonarDigestService();
    
    // Generate a new weekly digest with real news
    console.log('Calling Perplexity API to generate digest with real news...');
    const digest = await sonarDigestService.generateWeeklyDigest();
    
    if (!digest) {
      console.error('Failed to generate digest');
      res.status(500).json({ error: 'Failed to generate digest' });
      return;
    }
    
    console.log(\`Successfully generated digest with \${digest.topics.length} topics:\`);
    digest.topics.forEach((topic, index) => {
      console.log(\`  \${index + 1}. \${topic.title}\`);
      
      if (topic.citations && topic.citations.length > 0) {
        console.log(\`     Citations: \${topic.citations.length}\`);
      }
    });
    
    console.log('Sonar digest generation complete!');
    console.log('This digest will be served to users throughout the week.');
    
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
  
  execSync(`curl -s http://localhost:${port}/api/temp-refresh-sonar-news`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ Sonar Digest generated successfully\n');
} catch (error) {
  console.error('❌ Error generating Sonar Digest:', error);
  console.log('Continuing with the process...\n');
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary Sonar Digest file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}

// Step 4: Generate Twitter-enhanced Sonar Digest
console.log('Step 4: Generating Twitter-enhanced Sonar Digest...');
try {
  execSync('node scripts/generate-twitter-enhanced-sonar-digest.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('✅ Twitter-enhanced Sonar Digest generated successfully\n');
} catch (error) {
  console.error('❌ Error generating Twitter-enhanced Sonar Digest:', error);
  console.log('Continuing with the process...\n');
}

console.log('=== SONAR DIGEST REFRESH COMPLETE ===');
console.log('The Sonar Digest has been refreshed with real news data.');
console.log('You can now view the updated digest in the application.');
console.log('To view the Sonar Digest:');
console.log('1. Go to /news/sonar-digest in the application');
console.log('2. For Twitter-enhanced version, use /news/sonar-digest?source=twitter-enhanced');
console.log('=======================================');