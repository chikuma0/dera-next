#!/usr/bin/env node

/**
 * This script checks the Sonar and Grok digests to ensure they're working properly.
 * It verifies that the necessary files exist and have the correct format.
 * 
 * Run with: node scripts/check-digests.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== CHECKING SONAR AND GROK DIGESTS ===');

// Define paths to the digest files
const sonarDigestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const grokDigestPath = path.join(__dirname, '..', 'public/data/grok-digest.json');
const timestampPath = path.join(__dirname, '..', 'public/data/sonar-digest-last-update.json');
const twitterDataPath = path.join(__dirname, '..', 'public/data/twitter-data.json');
const twitterEnhancedPath = path.join(__dirname, '..', 'public/data/twitter-enhanced-sonar-digest.json');

// Check if files exist
const checkFile = (filePath, description) => {
  console.log(`Checking ${description}...`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`✅ ${description} exists and is valid JSON`);
      return data;
    } catch (error) {
      console.error(`❌ ${description} exists but is not valid JSON:`, error.message);
      return null;
    }
  } else {
    console.error(`❌ ${description} does not exist`);
    return null;
  }
};

// Check Sonar Digest
const sonarDigest = checkFile(sonarDigestPath, 'Sonar Digest');
if (sonarDigest) {
  console.log(`  - Title: ${sonarDigest.title}`);
  console.log(`  - Date: ${new Date(sonarDigest.date).toLocaleString()}`);
  console.log(`  - Topics: ${sonarDigest.topics.length}`);
  console.log(`  - Published: ${new Date(sonarDigest.publishedAt).toLocaleString()}`);
}

// Check Grok Digest
const grokDigest = checkFile(grokDigestPath, 'Grok Digest');
if (grokDigest) {
  console.log(`  - Title: ${grokDigest.title}`);
  console.log(`  - Date: ${new Date(grokDigest.date).toLocaleString()}`);
  console.log(`  - Topics: ${grokDigest.topics.length}`);
  console.log(`  - Published: ${new Date(grokDigest.publishedAt).toLocaleString()}`);
}

// Check Timestamp File
const timestamp = checkFile(timestampPath, 'Timestamp File');
if (timestamp) {
  console.log(`  - Last Updated: ${new Date(timestamp.lastUpdated).toLocaleString()}`);
  console.log(`  - Status: ${timestamp.status}`);
}

// Check Twitter Data
const twitterData = checkFile(twitterDataPath, 'Twitter Data');
if (twitterData) {
  console.log(`  - Tweets: ${twitterData.tweets ? twitterData.tweets.length : 0}`);
  console.log(`  - Hashtags: ${twitterData.hashtags ? twitterData.hashtags.length : 0}`);
}

// Check Twitter-Enhanced Sonar Digest
const twitterEnhanced = checkFile(twitterEnhancedPath, 'Twitter-Enhanced Sonar Digest');
if (twitterEnhanced) {
  console.log(`  - Title: ${twitterEnhanced.title}`);
  console.log(`  - Date: ${new Date(twitterEnhanced.date).toLocaleString()}`);
  console.log(`  - Topics: ${twitterEnhanced.topics.length}`);
  console.log(`  - Published: ${new Date(twitterEnhanced.publishedAt).toLocaleString()}`);
}

console.log('\n=== DIGEST CHECK COMPLETE ===');
console.log('To view the digests in the browser:');
console.log('1. Sonar Digest: http://localhost:3004/news/sonar-digest');
console.log('2. Twitter-Enhanced Sonar Digest: http://localhost:3004/news/sonar-digest?source=twitter-enhanced');
console.log('3. Grok Digest: http://localhost:3004/news/grok-digest');
console.log('=======================================');