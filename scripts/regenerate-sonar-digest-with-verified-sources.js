#!/usr/bin/env node

/**
 * This script regenerates the sonar digest with verified sources.
 * It uses the SonarDigestService with the modified prompt to generate a new digest,
 * then verifies all URLs in the digest to ensure they are accessible.
 * 
 * Run with: node scripts/regenerate-sonar-digest-with-verified-sources.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths to the digest files
const sonarDigestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const tempFile = path.join(__dirname, '..', 'src/pages/api/temp-regenerate-sonar.ts');

console.log('=== REGENERATING SONAR DIGEST WITH VERIFIED SOURCES ===');
console.log('This script will:');
console.log('1. Generate a new sonar digest with the modified prompt');
console.log('2. Verify all URLs in the digest to ensure they are accessible');
console.log('3. Save the verified digest to sonar-digest.json');
console.log('=======================================\n');

// Write the temporary file content
const tempFileContent = `import { NextApiRequest, NextApiResponse } from 'next';
import { SonarDigestService } from '@/lib/services/sonarDigestService';
import { verifyUrls } from '@/lib/utils/urlVerifier';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Regenerating sonar digest with verified sources...');
  
  try {
    // Create a new instance of the SonarDigestService
    const sonarDigestService = new SonarDigestService();
    
    // Generate a new weekly digest
    console.log('Calling Perplexity API to generate digest...');
    const digest = await sonarDigestService.generateWeeklyDigest();
    
    if (!digest) {
      console.error('Failed to generate digest');
      res.status(500).json({ error: 'Failed to generate digest' });
      return;
    }
    
    console.log(\`Successfully generated digest with \${digest.topics.length} topics\`);
    
    // Extract URLs from the digest
    const urls = [];
    digest.topics.forEach((topic) => {
      if (topic.citations && Array.isArray(topic.citations)) {
        topic.citations.forEach((citation) => {
          if (citation.url) {
            urls.push(citation.url);
          }
        });
      }
    });
    
    console.log(\`Found \${urls.length} URLs in the digest\`);
    
    // Verify URLs
    console.log('Verifying URLs...');
    const results = await verifyUrls(urls);
    
    // Count accessible and inaccessible URLs
    const accessibleUrls = results.filter((result) => result.accessible);
    const inaccessibleUrls = results.filter((result) => !result.accessible);
    
    console.log(\`✅ \${accessibleUrls.length} URLs are accessible\`);
    console.log(\`❌ \${inaccessibleUrls.length} URLs are inaccessible\`);
    
    // Print inaccessible URLs
    if (inaccessibleUrls.length > 0) {
      console.log('\\nInaccessible URLs:');
      inaccessibleUrls.forEach((result) => {
        console.log(\`- \${result.url} (\${result.error || \`Status: \${result.status}\`})\`);
      });
      
      // If more than 50% of URLs are inaccessible, reject the digest
      if (inaccessibleUrls.length > urls.length / 2) {
        console.error('More than 50% of URLs are inaccessible. Rejecting digest.');
        res.status(500).json({ error: 'More than 50% of URLs are inaccessible' });
        return;
      }
    }
    
    // Store the digest in the database or file
    await sonarDigestService.storeDigestInDatabase(digest);
    
    res.status(200).json({ 
      success: true, 
      topicsCount: digest.topics.length,
      accessibleUrls: accessibleUrls.length,
      inaccessibleUrls: inaccessibleUrls.length
    });
  } catch (error) {
    console.error('Error regenerating sonar digest:', error);
    res.status(500).json({ error: String(error) });
  }
}`;

// Write the temporary file
fs.writeFileSync(tempFile, tempFileContent);

try {
  console.log('Executing Next.js API route to regenerate sonar digest...');
  
  // Execute the Next.js API route using curl
  // Try to detect the port from the running server
  let port = 3001; // Default to 3001 since we saw the server is running on this port
  
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
  
  execSync(`curl -s http://localhost:${port}/api/temp-regenerate-sonar`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\nSonar digest regeneration complete!');
} catch (error) {
  console.error('Error executing API route:', error);
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}
