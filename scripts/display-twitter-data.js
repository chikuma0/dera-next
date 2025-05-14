#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * This script displays detailed information about the data pulled by the social impact scoring system.
 * It shows the Twitter data, Sonar digest, and Twitter-enhanced Sonar digest.
 */

// Configuration
const TWITTER_DATA_PATH = path.join(__dirname, '..', 'public/data/twitter-data.json');
const SONAR_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const TWITTER_ENHANCED_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest-twitter-enhanced.json');

// Main function
function displayTwitterData() {
  console.log('=== DETAILED REPORT OF PULLED DATA ===\n');
  
  // Display Twitter data
  console.log('=== TWITTER DATA ===');
  if (fs.existsSync(TWITTER_DATA_PATH)) {
    const twitterData = JSON.parse(fs.readFileSync(TWITTER_DATA_PATH, 'utf8'));
    
    console.log(`\nTotal tweets: ${twitterData.tweets.length}`);
    console.log(`Total hashtags: ${twitterData.hashtags.length}`);
    
    // Display all tweets
    console.log('\n--- ALL TWEETS ---');
    twitterData.tweets.forEach((tweet, index) => {
      console.log(`\n${index + 1}. ${tweet.content}`);
      console.log(`   ID: ${tweet.id}`);
      console.log(`   Author: @${tweet.authorUsername} (${tweet.authorName})`);
      console.log(`   Followers: ${tweet.authorFollowersCount.toLocaleString()}`);
      console.log(`   Engagement: ${tweet.likesCount} likes, ${tweet.retweetsCount} retweets, ${tweet.repliesCount} replies, ${tweet.quoteCount} quotes`);
      console.log(`   Impact Score: ${tweet.impactScore}`);
      console.log(`   URL: ${tweet.url}`);
      console.log(`   Created At: ${new Date(tweet.createdAt).toLocaleString()}`);
      console.log(`   Verified: ${tweet.isVerified ? 'Yes' : 'No'}`);
      
      if (tweet.hashtags && tweet.hashtags.length > 0) {
        console.log(`   Hashtags: ${tweet.hashtags.join(', ')}`);
      }
    });
    
    // Display all hashtags
    console.log('\n--- ALL HASHTAGS ---');
    twitterData.hashtags.forEach((hashtag, index) => {
      console.log(`\n${index + 1}. #${hashtag.hashtag}`);
      console.log(`   Tweet Count: ${hashtag.tweetCount}`);
      console.log(`   Total Likes: ${hashtag.totalLikes}`);
      console.log(`   Total Retweets: ${hashtag.totalRetweets}`);
      console.log(`   Total Replies: ${hashtag.totalReplies}`);
      console.log(`   Total Quotes: ${hashtag.totalQuotes}`);
      console.log(`   Total Engagement: ${hashtag.totalEngagement}`);
      console.log(`   Average Engagement Per Tweet: ${hashtag.avgEngagementPerTweet}`);
      console.log(`   Growth Rate: ${hashtag.growthRate}`);
      console.log(`   Impact Score: ${hashtag.impactScore}`);
    });
  } else {
    console.log('Twitter data file not found');
  }
  
  // Display Sonar digest
  console.log('\n=== SONAR DIGEST ===');
  if (fs.existsSync(SONAR_DIGEST_PATH)) {
    const sonarDigest = JSON.parse(fs.readFileSync(SONAR_DIGEST_PATH, 'utf8'));
    
    console.log(`\nTitle: ${sonarDigest.title}`);
    console.log(`Date: ${new Date(sonarDigest.date).toLocaleString()}`);
    console.log(`Summary: ${sonarDigest.summary}`);
    console.log(`Topics: ${sonarDigest.topics.length}`);
    
    // Display all topics
    console.log('\n--- ALL TOPICS ---');
    sonarDigest.topics.forEach((topic, index) => {
      console.log(`\n${index + 1}. ${topic.title}`);
      console.log(`   Summary: ${topic.summary}`);
      console.log(`   Viral Reason: ${topic.viralReason}`);
      console.log(`   Value Reason: ${topic.valueReason}`);
      console.log(`   Insights: ${topic.insights}`);
      
      // Display citations
      if (topic.citations && topic.citations.length > 0) {
        console.log(`\n   Citations (${topic.citations.length}):`);
        topic.citations.forEach((citation, citIndex) => {
          console.log(`     ${citIndex + 1}. ${citation.title}`);
          console.log(`        URL: ${citation.url}`);
          console.log(`        Type: ${citation.type}`);
        });
      }
    });
  } else {
    console.log('Sonar digest file not found');
  }
  
  // Display Twitter-enhanced Sonar digest
  console.log('\n=== TWITTER-ENHANCED SONAR DIGEST ===');
  if (fs.existsSync(TWITTER_ENHANCED_DIGEST_PATH)) {
    const enhancedDigest = JSON.parse(fs.readFileSync(TWITTER_ENHANCED_DIGEST_PATH, 'utf8'));
    
    console.log(`\nTitle: ${enhancedDigest.title}`);
    console.log(`Date: ${new Date(enhancedDigest.date).toLocaleString()}`);
    console.log(`Summary: ${enhancedDigest.summary}`);
    console.log(`Topics: ${enhancedDigest.topics.length}`);
    console.log(`Is Twitter Enhanced: ${enhancedDigest.isTwitterEnhanced ? 'Yes' : 'No'}`);
    
    // Display all topics
    console.log('\n--- ALL TOPICS ---');
    enhancedDigest.topics.forEach((topic, index) => {
      console.log(`\n${index + 1}. ${topic.title}`);
      console.log(`   Summary: ${topic.summary}`);
      console.log(`   Twitter Impact Score: ${topic.twitterImpactScore}`);
      
      // Display citations
      if (topic.citations && topic.citations.length > 0) {
        console.log(`\n   Citations (${topic.citations.length}):`);
        topic.citations.forEach((citation, citIndex) => {
          console.log(`     ${citIndex + 1}. ${citation.title}`);
          console.log(`        URL: ${citation.url}`);
          console.log(`        Type: ${citation.type}`);
        });
      }
      
      // Display related tweets
      if (topic.relatedTweets && topic.relatedTweets.length > 0) {
        console.log(`\n   Related Tweets (${topic.relatedTweets.length}):`);
        topic.relatedTweets.forEach((tweet, tweetIndex) => {
          console.log(`     ${tweetIndex + 1}. ${tweet.content}`);
          console.log(`        Author: @${tweet.authorUsername}`);
          console.log(`        Engagement: ${tweet.likesCount} likes, ${tweet.retweetsCount} retweets`);
          console.log(`        Impact Score: ${tweet.impactScore}`);
          console.log(`        URL: ${tweet.url}`);
        });
      }
      
      // Display related hashtags
      if (topic.relatedHashtags && topic.relatedHashtags.length > 0) {
        console.log(`\n   Related Hashtags (${topic.relatedHashtags.length}):`);
        topic.relatedHashtags.forEach((hashtag, hashIndex) => {
          if (typeof hashtag === 'string') {
            console.log(`     ${hashIndex + 1}. #${hashtag}`);
          } else {
            console.log(`     ${hashIndex + 1}. #${hashtag.hashtag}`);
            console.log(`        Tweet Count: ${hashtag.tweetCount}`);
            console.log(`        Total Engagement: ${hashtag.totalEngagement}`);
            console.log(`        Growth Rate: ${hashtag.growthRate}`);
            console.log(`        Impact Score: ${hashtag.impactScore}`);
          }
        });
      }
    });
  } else {
    console.log('Twitter-enhanced Sonar digest file not found');
  }
  
  console.log('\n=== END OF DETAILED REPORT ===');
}

// Run the script
displayTwitterData();