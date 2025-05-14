#!/usr/bin/env node

/**
 * This script restores the Sonar digest to its original state by using the existing
 * Twitter-enhanced Sonar digest as a base and removing any Grok integration.
 * 
 * Run with: node scripts/simple-restore-sonar-digest.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== SIMPLE SONAR DIGEST RESTORATION ===');
console.log('This script will:');
console.log('1. Use the existing Twitter-enhanced Sonar digest as a base');
console.log('2. Remove any Grok integration');
console.log('3. Restore the original functionality');
console.log('=======================================\n');

// Paths to the data files
const rootDir = path.join(__dirname, '..');
const twitterEnhancedPath = path.join(rootDir, 'public/data/twitter-enhanced-sonar-digest.json');
const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');

// Check if the Twitter-enhanced Sonar digest exists
if (!fs.existsSync(twitterEnhancedPath)) {
  console.error('❌ Twitter-enhanced Sonar digest not found');
  process.exit(1);
}

try {
  // Read the Twitter-enhanced Sonar digest
  console.log('Reading Twitter-enhanced Sonar digest...');
  const twitterEnhancedData = JSON.parse(fs.readFileSync(twitterEnhancedPath, 'utf8'));
  
  // Create a clean Sonar digest without Twitter-specific fields
  const cleanSonarDigest = {
    title: twitterEnhancedData.title,
    date: twitterEnhancedData.date,
    summary: twitterEnhancedData.summary,
    topics: twitterEnhancedData.topics.map(topic => ({
      title: topic.title,
      summary: topic.summary,
      viralReason: topic.viralReason,
      valueReason: topic.valueReason,
      insights: topic.insights,
      citations: topic.citations
    })),
    rawHtml: twitterEnhancedData.rawHtml,
    publishedAt: twitterEnhancedData.publishedAt
  };
  
  // Save the clean Sonar digest
  console.log('Saving clean Sonar digest...');
  fs.writeFileSync(sonarDigestPath, JSON.stringify(cleanSonarDigest, null, 2));
  console.log('✅ Clean Sonar digest saved successfully');
  
  // Check if we have Twitter data
  if (!fs.existsSync(twitterDataPath)) {
    console.log('Creating mock Twitter data...');
    
    // Create mock Twitter data based on the topics
    const tweets = [];
    const hashtags = [];
    
    // Generate tweets and hashtags from the topics
    cleanSonarDigest.topics.forEach((topic, topicIndex) => {
      // Create hashtags from topic title
      const topicWords = topic.title.split(' ');
      const topicHashtags = topicWords
        .filter(word => word.length > 3)
        .map(word => word.replace(/[^a-zA-Z0-9]/g, ''));
      
      // Add hashtags to global hashtags
      topicHashtags.forEach((tag, tagIndex) => {
        const likesCount = 500 - (topicIndex * 100) - (tagIndex * 50);
        const retweetsCount = Math.floor(likesCount * 0.3);
        const repliesCount = Math.floor(likesCount * 0.1);
        
        hashtags.push({
          hashtag: tag,
          tweetCount: 1,
          totalLikes: likesCount,
          totalRetweets: retweetsCount,
          totalReplies: repliesCount,
          impactScore: (likesCount + retweetsCount * 2) / 10
        });
      });
      
      // Create tweets for the topic
      for (let i = 0; i < 3; i++) {
        const likesCount = 500 - (topicIndex * 100) - (i * 50);
        const retweetsCount = Math.floor(likesCount * 0.3);
        const repliesCount = Math.floor(likesCount * 0.1);
        
        tweets.push({
          id: `mock-${topicIndex}-${i}`,
          content: i === 0 
            ? topic.title 
            : `${topic.summary.substring(0, 100)}... #${topicHashtags.join(' #')}`,
          authorUsername: `ai_expert_${topicIndex}_${i}`,
          authorName: `AI Expert ${topicIndex} ${i}`,
          authorFollowersCount: 10000 - (topicIndex * 1000) - (i * 500),
          likesCount,
          retweetsCount,
          repliesCount,
          quoteCount: Math.floor(repliesCount * 0.2),
          url: `https://twitter.com/ai_expert_${topicIndex}_${i}/status/mock-${topicIndex}-${i}`,
          createdAt: new Date().toISOString(),
          impactScore: likesCount + (retweetsCount * 2) + (repliesCount * 0.5),
          isVerified: i === 0,
          hashtags: topicHashtags
        });
      }
    });
    
    // Sort hashtags by impact score
    hashtags.sort((a, b) => b.impactScore - a.impactScore);
    
    // Save the Twitter data
    fs.writeFileSync(twitterDataPath, JSON.stringify({ tweets, hashtags }, null, 2));
    console.log(`✅ Created mock Twitter data with ${tweets.length} tweets and ${hashtags.length} hashtags`);
  } else {
    console.log('✅ Twitter data already exists');
  }
  
  // Now create a new Twitter-enhanced Sonar digest
  console.log('Creating new Twitter-enhanced Sonar digest...');
  
  // Read the Twitter data
  const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
  
  // Enhance the Sonar digest with Twitter data
  const enhancedDigest = { ...cleanSonarDigest };
  
  // Add Twitter data to each topic
  enhancedDigest.topics = enhancedDigest.topics.map(topic => {
    // Find related tweets for this topic
    const keywords = [...new Set([
      ...topic.title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
      ...topic.summary.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    ])];
    
    // Filter tweets that contain any of the keywords
    const relatedTweets = twitterData.tweets.filter(tweet => {
      const tweetContent = tweet.content.toLowerCase();
      return keywords.some(keyword => tweetContent.includes(keyword));
    }).slice(0, 3); // Take top 3
    
    // Find related hashtags
    const relatedHashtags = twitterData.hashtags.filter(hashtag => {
      return keywords.some(keyword => hashtag.hashtag.toLowerCase().includes(keyword));
    }).slice(0, 3); // Take top 3
    
    // Calculate Twitter impact score
    let twitterImpactScore = 0;
    
    // Add scores from tweets
    for (const tweet of relatedTweets) {
      twitterImpactScore += tweet.impactScore;
    }
    
    // Add scores from hashtags
    for (const hashtag of relatedHashtags) {
      twitterImpactScore += hashtag.impactScore;
    }
    
    // Normalize the score
    if (relatedTweets.length > 0 || relatedHashtags.length > 0) {
      twitterImpactScore = twitterImpactScore / (relatedTweets.length + relatedHashtags.length);
    }
    
    // Round to 2 decimal places
    twitterImpactScore = Math.round(twitterImpactScore * 100) / 100;
    
    return {
      ...topic,
      relatedTweets,
      relatedHashtags,
      twitterImpactScore
    };
  });
  
  // Save the enhanced digest
  fs.writeFileSync(twitterEnhancedPath, JSON.stringify(enhancedDigest, null, 2));
  console.log(`✅ Created new Twitter-enhanced Sonar digest with ${enhancedDigest.topics.length} topics`);
  
  console.log('\n=== RESTORATION COMPLETE ===');
  console.log('The Sonar Digest has been restored to its original state without Grok integration.');
  console.log('You can now view the updated digest in the application.');
  console.log('To view the Sonar Digest:');
  console.log('1. Go to /news/sonar-digest in the application');
  console.log('2. For Twitter-enhanced version, use /news/sonar-digest?source=twitter-enhanced');
  console.log('=======================================');
} catch (error) {
  console.error('❌ Error restoring Sonar digest:', error);
  process.exit(1);
}