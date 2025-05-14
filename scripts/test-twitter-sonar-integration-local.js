#!/usr/bin/env node

/**
 * This script tests the Twitter integration with Sonar digest locally
 * by bypassing the database and directly using the Twitter data from the file.
 * 
 * Run with: node scripts/test-twitter-sonar-integration-local.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a temporary file that will be executed by Next.js
const rootDir = path.join(__dirname, '..');
const tempFile = path.join(rootDir, 'src/pages/api/temp-test-twitter-sonar.ts');

// Write the temporary file
fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import { SonarDigestService } from '@/lib/services/sonarDigestService';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing Twitter integration with Sonar digest locally...');
  
  try {
    // Read the existing Sonar digest from file
    const sonarDigestPath = path.join(process.cwd(), 'public/data/sonar-digest.json');
    const sonarDigestData = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
    
    // Read the Twitter data from file
    const twitterDataPath = path.join(process.cwd(), 'public/data/twitter-data.json');
    const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
    
    console.log(\`Found \${twitterData.tweets.length} tweets and \${twitterData.hashtags.length} hashtags in Twitter data file\`);
    
    // Create a new instance of the SonarDigestService
    const sonarDigestService = new SonarDigestService();
    
    // Enhance each topic with Twitter data
    const enhancedTopics = await Promise.all(sonarDigestData.topics.map(async (topic) => {
      // Find related tweets for this topic
      const relatedTweets = await sonarDigestService.findRelatedTweets(
        topic.title,
        topic.summary,
        twitterData.tweets
      );
      
      // Find related hashtags for this topic
      const relatedHashtags = await sonarDigestService.findRelatedHashtags(
        topic.title,
        topic.summary,
        twitterData.hashtags
      );
      
      // Calculate Twitter impact score
      const twitterImpactScore = sonarDigestService.calculateTwitterImpactScore(
        relatedTweets,
        relatedHashtags
      );
      
      console.log(\`Topic: \${topic.title}\`);
      console.log(\`  Related tweets: \${relatedTweets.length}\`);
      console.log(\`  Related hashtags: \${relatedHashtags.length}\`);
      console.log(\`  Twitter impact score: \${twitterImpactScore}\`);
      
      // Return the enhanced topic
      return {
        ...topic,
        relatedTweets,
        relatedHashtags,
        twitterImpactScore
      };
    }));
    
    // Create the enhanced digest
    const enhancedDigest = {
      ...sonarDigestData,
      topics: enhancedTopics
    };
    
    // Save the enhanced digest to a new file
    const enhancedDigestPath = path.join(process.cwd(), 'public/data/twitter-enhanced-sonar-digest.json');
    fs.writeFileSync(enhancedDigestPath, JSON.stringify(enhancedDigest, null, 2));
    
    console.log('Twitter-enhanced Sonar digest saved to:', enhancedDigestPath);
    console.log('To view the enhanced digest, visit: http://localhost:3004/news/sonar-digest?source=twitter-enhanced');
    
    // Add a route parameter to the SonarDigest component to load the enhanced digest
    const sonarDigestComponentPath = path.join(process.cwd(), 'src/components/news/SonarDigest.tsx');
    let sonarDigestComponent = fs.readFileSync(sonarDigestComponentPath, 'utf8');
    
    // Check if the component already has the source parameter
    if (!sonarDigestComponent.includes('source = urlParams.get')) {
      // Add the source parameter to the fetchDigest function
      sonarDigestComponent = sonarDigestComponent.replace(
        'const fetchDigest = async () => {',
        \`const fetchDigest = async () => {
        // Check if the URL has a source parameter
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        \`
      );
      
      // Modify the file reading logic to check for the source parameter
      sonarDigestComponent = sonarDigestComponent.replace(
        'const filePath = path.join(process.cwd(), \\'public/data/sonar-digest.json\\');',
        \`const filePath = path.join(process.cwd(), source === 'twitter-enhanced' 
          ? 'public/data/twitter-enhanced-sonar-digest.json' 
          : 'public/data/sonar-digest.json');
        \`
      );
      
      // Save the modified component
      fs.writeFileSync(sonarDigestComponentPath, sonarDigestComponent);
      console.log('SonarDigest component updated to support the source parameter');
    } else {
      console.log('SonarDigest component already supports the source parameter');
    }
    
    res.status(200).json({ 
      success: true, 
      topicsCount: enhancedTopics.length,
      hasTwitterData: enhancedTopics.some(t => 
        (t.relatedTweets && t.relatedTweets.length > 0) || 
        (t.relatedHashtags && t.relatedHashtags.length > 0)
      )
    });
  } catch (error) {
    console.error('Error testing Twitter integration:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

try {
  console.log('Executing Next.js API route to test Twitter integration with Sonar digest...');
  
  // Execute the Next.js API route using curl
  // Try to detect the port from the running server
  let port = 3004; // Default to 3004 since that's what we saw in the logs
  
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
  
  execSync(`curl -s http://localhost:${port}/api/temp-test-twitter-sonar`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('\nTwitter integration test complete!');
  console.log(`To view the enhanced digest, visit: http://localhost:${port}/news/sonar-digest?source=twitter-enhanced`);
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