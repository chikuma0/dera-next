#!/usr/bin/env node

/**
 * This script extracts real Twitter data from the Grok digest file.
 * It looks for x-post citations in the digest and extracts tweet IDs and other data.
 * 
 * Run with: node scripts/extract-real-twitter-data.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.join(__dirname, '..');
const grokDigestPath = path.join(rootDir, 'public/data/grok-digest.json');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');

console.log('=== EXTRACTING REAL TWITTER DATA ===');
console.log('This script will:');
console.log('1. Extract real Twitter data from the Grok digest');
console.log('2. Save it to the twitter-data.json file');
console.log('3. Validate that the data is real and not synthetic');
console.log('=======================================\n');

try {
  // Step 1: Read the Grok digest file
  console.log('Step 1: Reading the Grok digest file...');
  
  if (!fs.existsSync(grokDigestPath)) {
    throw new Error('Grok Digest file not found. Make sure the Grok Digest was generated successfully.');
  }
  
  const grokDigestData = JSON.parse(fs.readFileSync(grokDigestPath, 'utf8'));
  
  console.log(`✅ Found Grok digest with ${grokDigestData.topics.length} topics`);
  
  // Step 2: Extract Twitter data from citations
  console.log('\nStep 2: Extracting Twitter data from citations...');
  
  const tweets = [];
  const hashtags = new Map();
  
  // Process each topic
  grokDigestData.topics.forEach((topic) => {
    // Extract tweets from X-post citations
    if (topic.citations) {
      const xPosts = topic.citations.filter(citation => 
        citation.type === 'x-post' && 
        citation.url && 
        (citation.url.includes('twitter.com') || citation.url.includes('x.com'))
      );
      
      if (xPosts.length === 0) {
        console.log(`No X-post citations found in topic: ${topic.title}`);
        return;
      }
      
      console.log(`Found ${xPosts.length} X-post citations in topic: ${topic.title}`);
      
      xPosts.forEach(post => {
        // Extract tweet ID from URL
        const urlParts = post.url.split('/');
        const tweetId = urlParts[urlParts.length - 1];
        
        // Extract username from URL
        const username = urlParts[urlParts.length - 2];
        
        // Create tweet object with only the data we have
        const tweet = {
          id: tweetId,
          content: post.title || `Tweet by @${username}`,
          authorUsername: username,
          authorName: username,
          url: post.url
        };
        
        // Only add if we have real content and a real tweet ID
        if (
          tweet.content && 
          tweet.content.length > 0 && 
          tweet.url && 
          tweet.id && 
          !tweet.id.startsWith('grok-') && 
          !tweet.id.startsWith('mock-') && 
          !tweet.id.startsWith('sample-') && 
          !tweet.id.startsWith('test-') && 
          !tweet.id.startsWith('fake-') && 
          !tweet.id.startsWith('placeholder-')
        ) {
          tweets.push(tweet);
        }
      });
    }
  });
  
  if (tweets.length === 0) {
    throw new Error('No real tweets extracted from Grok Digest');
  }
  
  console.log(`✅ Extracted ${tweets.length} real tweets`);
  
  // Extract hashtags from tweets
  console.log('\nStep 3: Extracting hashtags from tweets...');
  
  tweets.forEach(tweet => {
    const hashtagRegex = /#(\w+)/g;
    let match;
    
    while ((match = hashtagRegex.exec(tweet.content)) !== null) {
      const hashtag = match[1];
      if (hashtag.length >= 3) { // Skip very short hashtags
        if (!hashtags.has(hashtag)) {
          hashtags.set(hashtag, {
            hashtag,
            tweetCount: 1
          });
        } else {
          const hashtagData = hashtags.get(hashtag);
          hashtagData.tweetCount += 1;
          hashtags.set(hashtag, hashtagData);
        }
      }
    }
  });
  
  // Convert hashtags map to array
  const hashtagsArray = Array.from(hashtags.values());
  
  console.log(`✅ Extracted ${hashtagsArray.length} hashtags`);
  
  // Step 4: Save the Twitter data to a file
  console.log('\nStep 4: Saving Twitter data to file...');
  
  // Create a backup of the existing file if it exists
  if (fs.existsSync(twitterDataPath)) {
    const backupPath = `${twitterDataPath}.backup-${Date.now()}`;
    fs.copyFileSync(twitterDataPath, backupPath);
    console.log(`Created backup of existing Twitter data at: ${backupPath}`);
  }
  
  // Save the new Twitter data
  fs.writeFileSync(twitterDataPath, JSON.stringify({ tweets, hashtags: hashtagsArray }, null, 2));
  
  console.log(`✅ Saved Twitter data to: ${twitterDataPath}`);
  
  // Step 5: Validate the data
  console.log('\nStep 5: Validating the data...');
  
  // Check for synthetic tweet IDs
  const syntheticIdPatterns = [
    /grok-/i,
    /mock-/i,
    /sample-/i,
    /test-/i,
    /fake-/i,
    /placeholder-/i
  ];
  
  const tweetsWithSyntheticIds = tweets.filter(tweet => 
    syntheticIdPatterns.some(pattern => pattern.test(tweet.id))
  );
  
  if (tweetsWithSyntheticIds.length > 0) {
    console.error('❌ Found tweets with synthetic IDs:');
    tweetsWithSyntheticIds.forEach((tweet, index) => {
      console.error(`   ${index + 1}. ${tweet.id}`);
    });
    throw new Error('Synthetic tweet IDs detected in Twitter data');
  }
  
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
  
  const tweetsWithPlaceholderUrls = tweets.filter(tweet => 
    placeholderUrlPatterns.some(pattern => pattern.test(tweet.url))
  );
  
  if (tweetsWithPlaceholderUrls.length > 0) {
    console.error('❌ Found tweets with placeholder URLs:');
    tweetsWithPlaceholderUrls.forEach((tweet, index) => {
      console.error(`   ${index + 1}. ${tweet.url}`);
    });
    throw new Error('Placeholder URLs detected in Twitter data');
  }
  
  console.log('✅ Data validation passed');
  
  console.log('\n=== REAL TWITTER DATA EXTRACTION COMPLETE ===');
  console.log(`Successfully extracted ${tweets.length} real tweets and ${hashtagsArray.length} hashtags.`);
  console.log('The data is ready for use in the social impact scoring and citation fixing system.');
  console.log('=======================================');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}