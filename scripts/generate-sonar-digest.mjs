#!/usr/bin/env node

/**
 * This script generates a new Sonar digest and stores it in the database.
 * It's designed to be run on a schedule (e.g., every Monday) to create
 * the weekly digest that will be served to users throughout the week.
 * 
 * Run with: npx next-sonar-digest
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Create a temporary file that will be executed by Next.js
const tempFile = join(rootDir, 'src/pages/api/temp-generate-sonar.ts');
import * as fs from 'fs';

// Write the temporary file
fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import { SonarDigestService } from '@/lib/services/sonarDigestService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Generating weekly Sonar digest...');
  
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
    
    console.log(\`Successfully generated digest with \${digest.topics.length} topics:\`);
    digest.topics.forEach((topic, index) => {
      console.log(\`  \${index + 1}. \${topic.title}\`);
    });
    
    console.log('Weekly digest generation complete!');
    console.log('This digest will be served to users throughout the week.');
    
    res.status(200).json({ success: true, topicsCount: digest.topics.length });
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

try {
  console.log('Executing Next.js API route to generate Sonar digest...');
  
  // Execute the Next.js API route using curl
  execSync('curl -s http://localhost:3003/api/temp-generate-sonar', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('\nSonar digest generation complete!');
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