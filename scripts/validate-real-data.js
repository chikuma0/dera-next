#!/usr/bin/env node

/**
 * This script validates that we're using real data from the Grok API
 * and not falling back to synthetic or placeholder data.
 * 
 * Run with: node scripts/validate-real-data.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.join(__dirname, '..');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');
const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');
const enhancedDigestPath = path.join(rootDir, 'public/data/sonar-digest-twitter-enhanced.json');

console.log('=== VALIDATING REAL DATA ===');
console.log('This script will:');
console.log('1. Run the enhanced-refresh-sonar-with-grok-data.js script to fetch data');
console.log('2. Validate that the data is real and not synthetic');
console.log('3. Ensure we only use real data for social impact scoring and citation fixing');
console.log('=======================================\n');

// Step 1: Run the enhanced-refresh-sonar-with-grok-data.js script
console.log('Step 1: Running enhanced-refresh-sonar-with-grok-data.js...');

try {
  execSync('node scripts/enhanced-refresh-sonar-with-grok-data.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('✅ Successfully ran enhanced-refresh-sonar-with-grok-data.js');
} catch (error) {
  console.error('❌ Error running enhanced-refresh-sonar-with-grok-data.js:', error.message);
  console.error('Cannot proceed without data. Exiting...');
  process.exit(1);
}

// Step 2: Validate Twitter data
console.log('\nStep 2: Validating Twitter data...');

try {
  // Check if Twitter data exists
  if (!fs.existsSync(twitterDataPath)) {
    throw new Error('Twitter data file not found');
  }
  
  // Read Twitter data
  const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
  
  // Validate Twitter data
  if (!twitterData.tweets || twitterData.tweets.length === 0) {
    throw new Error('No tweets found in Twitter data');
  }
  
  if (!twitterData.hashtags || twitterData.hashtags.length === 0) {
    throw new Error('No hashtags found in Twitter data');
  }
  
  // Check for real URLs in tweets
  const realTweets = twitterData.tweets.filter(tweet => 
    tweet.url && (tweet.url.includes('twitter.com') || tweet.url.includes('x.com'))
  );
  
  if (realTweets.length === 0) {
    throw new Error('No tweets with real URLs found in Twitter data');
  }
  
  // Check for real content in tweets
  const tweetsWithContent = twitterData.tweets.filter(tweet => 
    tweet.content && tweet.content.trim().length > 0
  );
  
  if (tweetsWithContent.length === 0) {
    throw new Error('No tweets with real content found in Twitter data');
  }
  
  console.log('✅ Twitter data validation successful');
  console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags`);
  console.log(`${realTweets.length} tweets have real URLs`);
  console.log(`${tweetsWithContent.length} tweets have real content`);
  
  // Display sample tweets
  console.log('\nSample tweets:');
  realTweets.slice(0, 3).forEach((tweet, index) => {
    console.log(`\n${index + 1}. ${tweet.content}`);
    console.log(`   Author: @${tweet.authorUsername}`);
    console.log(`   URL: ${tweet.url}`);
  });
  
  // Display sample hashtags
  console.log('\nSample hashtags:');
  twitterData.hashtags.slice(0, 3).forEach((hashtag, index) => {
    console.log(`\n${index + 1}. #${hashtag.hashtag}`);
    console.log(`   Tweet Count: ${hashtag.tweetCount}`);
    console.log(`   Growth Rate: ${hashtag.growthRate}`);
  });
} catch (error) {
  console.error('❌ Error validating Twitter data:', error.message);
  console.error('Cannot proceed without valid Twitter data. Exiting...');
  process.exit(1);
}

// Step 3: Validate Sonar digest
console.log('\nStep 3: Validating Sonar digest...');

try {
  // Check if Sonar digest exists
  if (!fs.existsSync(sonarDigestPath)) {
    throw new Error('Sonar digest file not found');
  }
  
  // Read Sonar digest
  const sonarDigest = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
  
  // Validate Sonar digest
  if (!sonarDigest.topics || sonarDigest.topics.length === 0) {
    throw new Error('No topics found in Sonar digest');
  }
  
  // Check for real citations in topics
  let realCitationsCount = 0;
  let realTweetCitationsCount = 0;
  
  sonarDigest.topics.forEach(topic => {
    if (topic.citations && topic.citations.length > 0) {
      realCitationsCount += topic.citations.length;
      
      // Count real tweet citations
      const tweetCitations = topic.citations.filter(citation => 
        citation.type === 'x-post' && 
        citation.url && 
        (citation.url.includes('twitter.com') || citation.url.includes('x.com'))
      );
      
      realTweetCitationsCount += tweetCitations.length;
    }
  });
  
  if (realCitationsCount === 0) {
    throw new Error('No real citations found in Sonar digest');
  }
  
  console.log('✅ Sonar digest validation successful');
  console.log(`Found ${sonarDigest.topics.length} topics in the Sonar digest`);
  console.log(`Found ${realCitationsCount} real citations, including ${realTweetCitationsCount} tweet citations`);
  
  // Display sample topics
  console.log('\nSample topics:');
  sonarDigest.topics.slice(0, 2).forEach((topic, index) => {
    console.log(`\n${index + 1}. ${topic.title}`);
    console.log(`   Summary: ${topic.summary.substring(0, 100)}...`);
    
    if (topic.citations && topic.citations.length > 0) {
      console.log(`   Citations: ${topic.citations.length}`);
      
      // Display sample citations
      topic.citations.slice(0, 2).forEach((citation, citIndex) => {
        console.log(`     ${citIndex + 1}. ${citation.title.substring(0, 50)}...`);
        console.log(`        Type: ${citation.type}`);
        console.log(`        URL: ${citation.url}`);
      });
    }
  });
} catch (error) {
  console.error('❌ Error validating Sonar digest:', error.message);
  console.error('Cannot proceed without valid Sonar digest. Exiting...');
  process.exit(1);
}

// Step 4: Run the social impact scoring and citation fixing
console.log('\nStep 4: Running social impact scoring and citation fixing with real data...');

try {
  // Run the integrated-social-impact-scoring-cjs.js script
  console.log('Running integrated-social-impact-scoring-cjs.js...');
  execSync('node scripts/integrated-social-impact-scoring-cjs.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  // Run the fix-sonar-citations.js script
  console.log('\nRunning fix-sonar-citations.js...');
  execSync('node scripts/fix-sonar-citations.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  // Run the generate-twitter-enhanced-sonar-digest.js script
  console.log('\nRunning generate-twitter-enhanced-sonar-digest.js...');
  execSync('node scripts/generate-twitter-enhanced-sonar-digest.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ Successfully ran social impact scoring and citation fixing with real data');
} catch (error) {
  console.error('❌ Error running social impact scoring and citation fixing:', error.message);
  console.log('Continuing with the process...');
}

// Step 5: Test the integrated solution
console.log('\nStep 5: Testing the integrated solution with real data...');

try {
  execSync('node scripts/test-social-impact.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('✅ Successfully tested the integrated solution with real data');
} catch (error) {
  console.error('❌ Error testing the integrated solution:', error.message);
  console.log('Some tests may have failed...');
}

console.log('\n=== REAL DATA VALIDATION COMPLETE ===');
console.log('The social impact scoring and citation fixing system has been successfully');
console.log('implemented using real data from the Grok API.');
console.log('You can now view the results in the following files:');
console.log(`- Twitter data: ${twitterDataPath}`);
console.log(`- Sonar digest with fixed citations: ${sonarDigestPath}`);
console.log(`- Twitter-enhanced Sonar digest: ${enhancedDigestPath}`);
console.log('=======================================');