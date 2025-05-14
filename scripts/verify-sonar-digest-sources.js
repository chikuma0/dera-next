#!/usr/bin/env node

/**
 * This script verifies the URLs in the sonar-digest.json file to ensure they are real and accessible.
 * It also modifies the SonarDigestService prompt to emphasize using only verified information.
 * 
 * Run with: node scripts/verify-sonar-digest-sources.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Paths to the digest files
const sonarDigestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const sonarDigestServicePath = path.join(__dirname, '..', 'src/lib/services/sonarDigestService.ts');

console.log('=== VERIFYING SONAR DIGEST SOURCES ===');
console.log('This script will:');
console.log('1. Check all URLs in the sonar-digest.json file');
console.log('2. Verify if they are accessible');
console.log('3. Modify the SonarDigestService prompt to emphasize using only verified information');
console.log('=======================================\n');

// Function to check if a URL is accessible
async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = protocol.request(
        {
          method: 'HEAD',
          host: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          timeout: 5000,
        },
        (res) => {
          resolve({
            url,
            status: res.statusCode,
            accessible: res.statusCode >= 200 && res.statusCode < 400,
          });
        }
      );
      
      req.on('error', (err) => {
        resolve({
          url,
          status: 0,
          accessible: false,
          error: err.message,
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 0,
          accessible: false,
          error: 'Request timed out',
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        url,
        status: 0,
        accessible: false,
        error: error.message,
      });
    }
  });
}

// Function to extract URLs from the sonar digest
function extractUrls(digest) {
  const urls = [];
  
  if (digest.topics && Array.isArray(digest.topics)) {
    digest.topics.forEach((topic) => {
      if (topic.citations && Array.isArray(topic.citations)) {
        topic.citations.forEach((citation) => {
          if (citation.url) {
            urls.push(citation.url);
          }
        });
      }
    });
  }
  
  return urls;
}

// Function to modify the SonarDigestService prompt
function modifySonarDigestServicePrompt(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find the createSonarPrompt method
    const promptRegex = /(private async createSonarPrompt.*?return\s+`)([^`]*?)(`)/s;
    const match = content.match(promptRegex);
    
    if (!match) {
      console.log('Trying alternative regex pattern...');
      // Try an alternative pattern
      const altRegex = /(return\s+`)([^`]*?)(`)/s;
      const altMatch = content.match(altRegex);
      
      if (!altMatch) {
        console.error('Could not find the createSonarPrompt method in the SonarDigestService');
        return false;
      }
      
      // Use the alternative match
      const modifiedContent = content.replace(
        altRegex,
        `$1${altMatch[2]}${additionalInstructions}$3`
      );
      
      // Write the modified content back to the file
      fs.writeFileSync(filePath, modifiedContent);
      
      console.log('✅ Modified SonarDigestService prompt to emphasize using only verified information');
      return true;
    }
    
    // Add emphasis on using only verified information
    const additionalInstructions = `

IMPORTANT: You must ONLY use verified, real-world sources for your research. Do not hallucinate or fabricate any sources, citations, or URLs. Every citation you include must be to a real, accessible webpage that contains the information you are citing. Do not include any Twitter/X posts, hashtags, or trends that don't actually exist. Only report on real, verifiable news and trends.

For each topic:
1. First find reliable sources that confirm the news is real
2. Only then create the topic with accurate information from those sources
3. Include ONLY citations to real, accessible webpages
4. For viral metrics, only cite real social media trends with accurate numbers
5. For expert quotes, only include real quotes from real experts that can be verified

If you cannot find reliable sources for a topic, DO NOT include that topic in the digest. It's better to have fewer topics with verified information than more topics with fabricated sources.`;
    
    // Insert the additional instructions before the closing backtick
    const modifiedContent = content.replace(
      promptRegex,
      `$1${match[2]}${additionalInstructions}$3`
    );
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, modifiedContent);
    
    console.log('✅ Modified SonarDigestService prompt to emphasize using only verified information');
    return true;
  } catch (error) {
    console.error('Error modifying SonarDigestService prompt:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Read the sonar digest file
    console.log('Reading sonar digest file:', sonarDigestPath);
    const sonarDigestData = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
    
    // Extract URLs from the digest
    const urls = extractUrls(sonarDigestData);
    console.log(`Found ${urls.length} URLs in the sonar digest`);
    
    // Check each URL
    console.log('Checking URLs...');
    const results = await Promise.all(urls.map(checkUrl));
    
    // Count accessible and inaccessible URLs
    const accessibleUrls = results.filter((result) => result.accessible);
    const inaccessibleUrls = results.filter((result) => !result.accessible);
    
    console.log(`✅ ${accessibleUrls.length} URLs are accessible`);
    console.log(`❌ ${inaccessibleUrls.length} URLs are inaccessible`);
    
    // Print inaccessible URLs
    if (inaccessibleUrls.length > 0) {
      console.log('\nInaccessible URLs:');
      inaccessibleUrls.forEach((result) => {
        console.log(`- ${result.url} (${result.error || `Status: ${result.status}`})`);
      });
    }
    
    // Modify the SonarDigestService prompt
    console.log('\nModifying SonarDigestService prompt...');
    const promptModified = modifySonarDigestServicePrompt(sonarDigestServicePath);
    
    if (!promptModified) {
      console.error('Failed to modify SonarDigestService prompt');
    }
    
    // Create a verification function to add to the SonarDigestService
    console.log('\nCreating URL verification function...');
    
    // Create a new file with the URL verification function
    const verificationFunctionPath = path.join(__dirname, '..', 'src/lib/utils/urlVerifier.ts');
    fs.writeFileSync(
      verificationFunctionPath,
      `/**
 * Utility function to verify if a URL is accessible
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Check if a URL is accessible
 * @param url The URL to check
 * @returns A promise that resolves to an object with the URL, status code, and accessibility
 */
export async function verifyUrl(url: string): Promise<{
  url: string;
  status: number;
  accessible: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = protocol.request(
        {
          method: 'HEAD',
          host: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          timeout: 5000,
        },
        (res) => {
          resolve({
            url,
            status: res.statusCode,
            accessible: res.statusCode >= 200 && res.statusCode < 400,
          });
        }
      );
      
      req.on('error', (err) => {
        resolve({
          url,
          status: 0,
          accessible: false,
          error: err.message,
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 0,
          accessible: false,
          error: 'Request timed out',
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        url,
        status: 0,
        accessible: false,
        error: error.message,
      });
    }
  });
}

/**
 * Verify multiple URLs
 * @param urls An array of URLs to check
 * @returns A promise that resolves to an array of URL verification results
 */
export async function verifyUrls(urls: string[]): Promise<{
  url: string;
  status: number;
  accessible: boolean;
  error?: string;
}[]> {
  return Promise.all(urls.map(verifyUrl));
}
`
    );
    
    console.log(`✅ Created URL verification function at ${verificationFunctionPath}`);
    
    // Create a script to regenerate the sonar digest with verified sources
    const regenerateScriptPath = path.join(__dirname, '..', 'scripts/regenerate-sonar-digest-with-verified-sources.js');
    fs.writeFileSync(
      regenerateScriptPath,
      `#!/usr/bin/env node

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
console.log('=======================================\\n');

// Write the temporary file
fs.writeFileSync(
  tempFile,
  \`
import { NextApiRequest, NextApiResponse } from 'next';
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
}
\`
);

try {
  console.log('Executing Next.js API route to regenerate sonar digest...');
  
  // Execute the Next.js API route using curl
  // Try to detect the port from the running server
  let port = 3000; // Default to 3000
  
  try {
    // Check if we can find the port in the environment
    const nextPort = process.env.PORT || process.env.NEXT_PUBLIC_PORT;
    if (nextPort) {
      port = nextPort;
    }
  } catch (portError) {
    console.warn('Could not detect port from environment, using default:', port);
  }
  
  console.log(\`Using port \${port} for API request\`);
  
  execSync(\`curl -s http://localhost:\${port}/api/temp-regenerate-sonar\`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\\nSonar digest regeneration complete!');
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
`
    );
    
    console.log(`✅ Created regenerate script at ${regenerateScriptPath}`);
    
    // Make the regenerate script executable
    fs.chmodSync(regenerateScriptPath, '755');
    
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Run the regenerate script to create a new sonar digest with verified sources:');
    console.log('   node scripts/regenerate-sonar-digest-with-verified-sources.js');
    console.log('2. After regenerating the digest, run the Twitter enhancement script:');
    console.log('   node scripts/refresh-twitter-enhanced-sonar-digest.js');
    console.log('3. Clear the browser cache and reload the sonar digest page');
    console.log('=======================================');
    
  } catch (error) {
    console.error('Error verifying sonar digest sources:', error);
  }
}

// Run the main function
main();