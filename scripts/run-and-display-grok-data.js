#!/usr/bin/env node

/**
 * This script runs the enhanced-refresh-sonar-with-grok-data.js script
 * and displays the output in a more readable format.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING ENHANCED REFRESH SONAR WITH GROK DATA ===');
console.log('This will fetch data from the Grok API and process it...\n');

try {
  // Run the enhanced-refresh-sonar-with-grok-data.js script
  execSync('node scripts/enhanced-refresh-sonar-with-grok-data.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\n=== GROK API OUTPUT ===');
  
  // Read the Grok digest file
  const grokDigestPath = path.join(__dirname, '..', 'public/data/grok-digest.json');
  
  if (fs.existsSync(grokDigestPath)) {
    const grokDigestData = JSON.parse(fs.readFileSync(grokDigestPath, 'utf8'));
    
    console.log(`\nGrok Digest Title: ${grokDigestData.title}`);
    console.log(`Date: ${new Date(grokDigestData.date).toLocaleDateString()}`);
    console.log(`Summary: ${grokDigestData.summary}`);
    console.log(`Topics: ${grokDigestData.topics.length}`);
    
    // Display topics
    grokDigestData.topics.forEach((topic, index) => {
      console.log(`\n--- TOPIC ${index + 1}: ${topic.title} ---`);
      console.log(`Summary: ${topic.summary}`);
      console.log(`Why Viral: ${topic.viralReason}`);
      console.log(`Why Valuable: ${topic.valueReason}`);
      console.log(`Insights: ${topic.insights}`);
      
      // Display citations
      if (topic.citations && topic.citations.length > 0) {
        console.log(`\nCitations (${topic.citations.length}):`);
        topic.citations.forEach((citation, citIndex) => {
          console.log(`  ${citIndex + 1}. ${citation.title}`);
          console.log(`     URL: ${citation.url}`);
          console.log(`     Type: ${citation.type}`);
        });
      }
      
      // Display related hashtags
      if (topic.relatedHashtags && topic.relatedHashtags.length > 0) {
        console.log(`\nRelated Hashtags (${topic.relatedHashtags.length}):`);
        topic.relatedHashtags.forEach((hashtag, hashIndex) => {
          const hashtagStr = typeof hashtag === 'string' ? hashtag : hashtag.hashtag;
          console.log(`  ${hashIndex + 1}. #${hashtagStr}`);
          
          if (typeof hashtag !== 'string') {
            console.log(`     Tweet Count: ${hashtag.tweetCount || 'N/A'}`);
            console.log(`     Total Likes: ${hashtag.totalLikes || 'N/A'}`);
            console.log(`     Total Retweets: ${hashtag.totalRetweets || 'N/A'}`);
            console.log(`     Impact Score: ${hashtag.impactScore || 'N/A'}`);
          }
        });
      }
      
      // Display related tweets
      if (topic.relatedTweets && topic.relatedTweets.length > 0) {
        console.log(`\nRelated Tweets (${topic.relatedTweets.length}):`);
        topic.relatedTweets.forEach((tweet, tweetIndex) => {
          console.log(`  ${tweetIndex + 1}. ${tweet.content || 'No content'}`);
          console.log(`     Author: @${tweet.authorUsername || 'unknown'}`);
          console.log(`     Engagement: ${tweet.likesCount || 0} likes, ${tweet.retweetsCount || 0} retweets`);
          console.log(`     URL: ${tweet.url || 'No URL'}`);
        });
      }
    });
  } else {
    console.log('Grok Digest file not found. The API might not have returned any data.');
  }
  
  // Read the Twitter data file
  const twitterDataPath = path.join(__dirname, '..', 'public/data/twitter-data.json');
  
  if (fs.existsSync(twitterDataPath)) {
    const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
    
    console.log('\n=== EXTRACTED TWITTER DATA ===');
    console.log(`Tweets: ${twitterData.tweets.length}`);
    console.log(`Hashtags: ${twitterData.hashtags.length}`);
    
    // Display tweets
    console.log('\n--- TWEETS ---');
    twitterData.tweets.forEach((tweet, index) => {
      console.log(`\n${index + 1}. ${tweet.content}`);
      console.log(`   Author: @${tweet.authorUsername} (${tweet.authorName})`);
      console.log(`   Followers: ${tweet.authorFollowersCount.toLocaleString()}`);
      console.log(`   Engagement: ${tweet.likesCount} likes, ${tweet.retweetsCount} retweets, ${tweet.repliesCount} replies, ${tweet.quoteCount} quotes`);
      console.log(`   Impact Score: ${tweet.impactScore}`);
      console.log(`   URL: ${tweet.url}`);
      
      if (tweet.hashtags && tweet.hashtags.length > 0) {
        console.log(`   Hashtags: ${tweet.hashtags.map(tag => `#${tag}`).join(', ')}`);
      }
    });
    
    // Display hashtags
    console.log('\n--- HASHTAGS ---');
    twitterData.hashtags.forEach((hashtag, index) => {
      console.log(`\n${index + 1}. #${hashtag.hashtag}`);
      console.log(`   Tweet Count: ${hashtag.tweetCount}`);
      console.log(`   Total Engagement: ${hashtag.totalEngagement} (${hashtag.avgEngagementPerTweet} avg per tweet)`);
      console.log(`   Breakdown: ${hashtag.totalLikes} likes, ${hashtag.totalRetweets} retweets, ${hashtag.totalReplies} replies, ${hashtag.totalQuotes} quotes`);
      console.log(`   Growth Rate: ${hashtag.growthRate}`);
      console.log(`   Impact Score: ${hashtag.impactScore}`);
    });
  } else {
    console.log('Twitter data file not found. The extraction process might have failed.');
  }
  
  // Read the Sonar digest file
  const sonarDigestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
  
  if (fs.existsSync(sonarDigestPath)) {
    const sonarDigestData = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
    
    console.log('\n=== SONAR DIGEST ===');
    console.log(`Title: ${sonarDigestData.title}`);
    console.log(`Date: ${new Date(sonarDigestData.date).toLocaleDateString()}`);
    console.log(`Summary: ${sonarDigestData.summary}`);
    console.log(`Topics: ${sonarDigestData.topics.length}`);
    
    // Display a sample topic
    if (sonarDigestData.topics.length > 0) {
      const sampleTopic = sonarDigestData.topics[0];
      console.log('\n--- SAMPLE TOPIC ---');
      console.log(`Title: ${sampleTopic.title}`);
      console.log(`Summary: ${sampleTopic.summary}`);
      
      if (sampleTopic.citations && sampleTopic.citations.length > 0) {
        console.log(`\nCitations (${sampleTopic.citations.length}):`);
        sampleTopic.citations.slice(0, 3).forEach((citation, citIndex) => {
          console.log(`  ${citIndex + 1}. ${citation.title}`);
          console.log(`     URL: ${citation.url}`);
          console.log(`     Type: ${citation.type}`);
        });
        
        if (sampleTopic.citations.length > 3) {
          console.log(`  ... and ${sampleTopic.citations.length - 3} more`);
        }
      }
    }
  } else {
    console.log('Sonar Digest file not found. The generation process might have failed.');
  }
  
} catch (error) {
  console.error('Error running the script:', error);
}