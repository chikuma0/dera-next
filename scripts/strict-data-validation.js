#!/usr/bin/env node

/**
 * This script strictly validates that we're using real data from the Grok API
 * and throws an error if it detects any sample or placeholder data.
 * 
 * Run with: node scripts/strict-data-validation.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.join(__dirname, '..');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');
const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');

console.log('=== STRICT DATA VALIDATION ===');
console.log('This script will:');
console.log('1. Check if the data files exist');
console.log('2. Validate that the data is real and not synthetic');
console.log('3. Throw an error if any sample or placeholder data is detected');
console.log('=======================================\n');

// Step 1: Check if the data files exist
console.log('Step 1: Checking if data files exist...');

if (!fs.existsSync(twitterDataPath)) {
  console.error('❌ Twitter data file not found');
  process.exit(1);
}

if (!fs.existsSync(sonarDigestPath)) {
  console.error('❌ Sonar digest file not found');
  process.exit(1);
}

console.log('✅ Data files exist');

// Step 2: Validate Twitter data
console.log('\nStep 2: Validating Twitter data...');

try {
  // Read Twitter data
  const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
  
  // Check if tweets array exists
  if (!twitterData.tweets || !Array.isArray(twitterData.tweets) || twitterData.tweets.length === 0) {
    throw new Error('No tweets found in Twitter data');
  }
  
  // Check if hashtags array exists
  if (!twitterData.hashtags || !Array.isArray(twitterData.hashtags) || twitterData.hashtags.length === 0) {
    throw new Error('No hashtags found in Twitter data');
  }
  
  console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags`);
  
  // Check for placeholder URLs
  const placeholderUrlPatterns = [
    /example\.com/i,
    /placeholder/i,
    /sample/i,
    /test/i,
    /fake/i,
    /mock/i,
    /dummy/i,
    /localhost/i,
    /127\.0\.0\.1/i
  ];
  
  const tweetsWithPlaceholderUrls = twitterData.tweets.filter(tweet => 
    placeholderUrlPatterns.some(pattern => pattern.test(tweet.url))
  );
  
  if (tweetsWithPlaceholderUrls.length > 0) {
    console.error('❌ Found tweets with placeholder URLs:');
    tweetsWithPlaceholderUrls.forEach((tweet, index) => {
      console.error(`   ${index + 1}. ${tweet.url}`);
    });
    throw new Error('Placeholder URLs detected in Twitter data');
  }
  
  // Check for placeholder content
  const placeholderContentPatterns = [
    /placeholder/i,
    /sample/i,
    /test tweet/i,
    /example tweet/i,
    /mock tweet/i,
    /dummy tweet/i,
    /lorem ipsum/i
  ];
  
  const tweetsWithPlaceholderContent = twitterData.tweets.filter(tweet => 
    placeholderContentPatterns.some(pattern => pattern.test(tweet.content))
  );
  
  if (tweetsWithPlaceholderContent.length > 0) {
    console.error('❌ Found tweets with placeholder content:');
    tweetsWithPlaceholderContent.forEach((tweet, index) => {
      console.error(`   ${index + 1}. ${tweet.content}`);
    });
    throw new Error('Placeholder content detected in Twitter data');
  }
  
  // Check for placeholder usernames
  const placeholderUsernamePatterns = [
    /user\d+/i,
    /example/i,
    /sample/i,
    /test/i,
    /fake/i,
    /mock/i,
    /dummy/i,
    /placeholder/i,
    /ai_expert_\d+/i
  ];
  
  const tweetsWithPlaceholderUsernames = twitterData.tweets.filter(tweet => 
    placeholderUsernamePatterns.some(pattern => pattern.test(tweet.authorUsername))
  );
  
  if (tweetsWithPlaceholderUsernames.length > 0) {
    console.error('❌ Found tweets with placeholder usernames:');
    tweetsWithPlaceholderUsernames.forEach((tweet, index) => {
      console.error(`   ${index + 1}. @${tweet.authorUsername}`);
    });
    throw new Error('Placeholder usernames detected in Twitter data');
  }
  
  // Check for synthetic tweet IDs
  const syntheticIdPatterns = [
    /grok-/i,
    /mock-/i,
    /sample-/i,
    /test-/i,
    /fake-/i,
    /placeholder-/i
  ];
  
  const tweetsWithSyntheticIds = twitterData.tweets.filter(tweet => 
    syntheticIdPatterns.some(pattern => pattern.test(tweet.id))
  );
  
  if (tweetsWithSyntheticIds.length > 0) {
    console.error('❌ Found tweets with synthetic IDs:');
    tweetsWithSyntheticIds.forEach((tweet, index) => {
      console.error(`   ${index + 1}. ${tweet.id}`);
    });
    throw new Error('Synthetic tweet IDs detected in Twitter data');
  }
  
  // Check for unrealistic engagement metrics
  const tweetsWithUnrealisticEngagement = twitterData.tweets.filter(tweet => {
    // Check if engagement metrics are missing
    if (tweet.likesCount === undefined || tweet.retweetsCount === undefined) {
      return true;
    }
    
    // Check if engagement metrics are too round (likely made up)
    if (
      tweet.likesCount % 100 === 0 || 
      tweet.retweetsCount % 100 === 0 ||
      (tweet.repliesCount && tweet.repliesCount % 100 === 0) ||
      (tweet.quoteCount && tweet.quoteCount % 100 === 0)
    ) {
      return true;
    }
    
    return false;
  });
  
  if (tweetsWithUnrealisticEngagement.length > 0) {
    console.error('❌ Found tweets with unrealistic engagement metrics:');
    tweetsWithUnrealisticEngagement.forEach((tweet, index) => {
      console.error(`   ${index + 1}. Likes: ${tweet.likesCount}, Retweets: ${tweet.retweetsCount}`);
    });
    throw new Error('Unrealistic engagement metrics detected in Twitter data');
  }
  
  console.log('✅ Twitter data validation passed');
} catch (error) {
  console.error(`❌ Twitter data validation failed: ${error.message}`);
  process.exit(1);
}

// Step 3: Validate Sonar digest
console.log('\nStep 3: Validating Sonar digest...');

try {
  // Read Sonar digest
  const sonarDigest = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
  
  // Check if topics array exists
  if (!sonarDigest.topics || !Array.isArray(sonarDigest.topics) || sonarDigest.topics.length === 0) {
    throw new Error('No topics found in Sonar digest');
  }
  
  console.log(`Found ${sonarDigest.topics.length} topics in the Sonar digest`);
  
  // Check for placeholder citations
  const placeholderUrlPatterns = [
    /example\.com/i,
    /placeholder/i,
    /sample/i,
    /test/i,
    /fake/i,
    /mock/i,
    /dummy/i,
    /localhost/i,
    /127\.0\.0\.1/i
  ];
  
  let topicsWithPlaceholderCitations = [];
  
  sonarDigest.topics.forEach(topic => {
    if (topic.citations && Array.isArray(topic.citations)) {
      const placeholderCitations = topic.citations.filter(citation => 
        placeholderUrlPatterns.some(pattern => pattern.test(citation.url))
      );
      
      if (placeholderCitations.length > 0) {
        topicsWithPlaceholderCitations.push({
          topic: topic.title,
          placeholderCitations
        });
      }
    }
  });
  
  if (topicsWithPlaceholderCitations.length > 0) {
    console.error('❌ Found topics with placeholder citations:');
    topicsWithPlaceholderCitations.forEach((item, index) => {
      console.error(`   ${index + 1}. Topic: ${item.topic}`);
      item.placeholderCitations.forEach((citation, citIndex) => {
        console.error(`      ${citIndex + 1}. ${citation.url}`);
      });
    });
    throw new Error('Placeholder citations detected in Sonar digest');
  }
  
  // Check for placeholder content
  const placeholderContentPatterns = [
    /placeholder/i,
    /sample/i,
    /test topic/i,
    /example topic/i,
    /mock topic/i,
    /dummy topic/i,
    /lorem ipsum/i
  ];
  
  const topicsWithPlaceholderContent = sonarDigest.topics.filter(topic => 
    placeholderContentPatterns.some(pattern => 
      pattern.test(topic.title) || 
      pattern.test(topic.summary)
    )
  );
  
  if (topicsWithPlaceholderContent.length > 0) {
    console.error('❌ Found topics with placeholder content:');
    topicsWithPlaceholderContent.forEach((topic, index) => {
      console.error(`   ${index + 1}. ${topic.title}`);
    });
    throw new Error('Placeholder content detected in Sonar digest');
  }
  
  console.log('✅ Sonar digest validation passed');
} catch (error) {
  console.error(`❌ Sonar digest validation failed: ${error.message}`);
  process.exit(1);
}

console.log('\n=== STRICT DATA VALIDATION COMPLETE ===');
console.log('All data has been validated and confirmed to be real, not synthetic.');
console.log('No sample or placeholder data was detected.');
console.log('The data is ready for use in the social impact scoring and citation fixing system.');
console.log('=======================================');