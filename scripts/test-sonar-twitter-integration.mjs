#!/usr/bin/env node

/**
 * This script tests the Twitter integration with Sonar digest
 * by directly using the Twitter data from the file.
 * 
 * Run with: node scripts/test-sonar-twitter-integration.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function main() {
  try {
    console.log('Testing Twitter integration with Sonar digest...');
    
    // Read the existing Sonar digest from file
    const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');
    const sonarDigestData = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
    
    // Read the Twitter data from file
    const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');
    const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
    
    console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags in Twitter data file`);
    
    // Enhance each topic with Twitter data
    const enhancedTopics = sonarDigestData.topics.map(topic => {
      // Find related tweets for this topic
      const relatedTweets = findRelatedTweets(topic.title, topic.summary, twitterData.tweets);
      
      // Find related hashtags for this topic
      const relatedHashtags = findRelatedHashtags(topic.title, topic.summary, twitterData.hashtags);
      
      // Calculate Twitter impact score
      const twitterImpactScore = calculateTwitterImpactScore(relatedTweets, relatedHashtags);
      
      console.log(`Topic: ${topic.title}`);
      console.log(`  Related tweets: ${relatedTweets.length}`);
      console.log(`  Related hashtags: ${relatedHashtags.length}`);
      console.log(`  Twitter impact score: ${twitterImpactScore}`);
      
      // Return the enhanced topic
      return {
        ...topic,
        relatedTweets,
        relatedHashtags,
        twitterImpactScore
      };
    });
    
    // Create the enhanced digest
    const enhancedDigest = {
      ...sonarDigestData,
      topics: enhancedTopics
    };
    
    // Save the enhanced digest to a new file
    const enhancedDigestPath = path.join(rootDir, 'public/data/twitter-enhanced-sonar-digest.json');
    fs.writeFileSync(enhancedDigestPath, JSON.stringify(enhancedDigest, null, 2));
    
    console.log('Twitter-enhanced Sonar digest saved to:', enhancedDigestPath);
    console.log('To view the enhanced digest, visit: http://localhost:3004/news/sonar-digest?source=twitter-enhanced');
    
  } catch (error) {
    console.error('Error testing Twitter integration:', error);
  }
}

/**
 * Find tweets related to a specific topic
 */
function findRelatedTweets(title, summary, allTweets) {
  try {
    // Create a simple keyword matching algorithm
    const keywords = [...new Set([
      ...title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
      ...summary.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    ])];
    
    console.log(`Keywords for "${title}":`, keywords);
    
    // Filter tweets that contain any of the keywords
    const relatedTweets = allTweets.filter(tweet => {
      const tweetContent = tweet.content.toLowerCase();
      return keywords.some(keyword => tweetContent.includes(keyword));
    });
    
    // Sort by relevance (number of matching keywords)
    relatedTweets.sort((a, b) => {
      const aMatches = keywords.filter(keyword => a.content.toLowerCase().includes(keyword)).length;
      const bMatches = keywords.filter(keyword => b.content.toLowerCase().includes(keyword)).length;
      return bMatches - aMatches;
    });
    
    // Return top 3 related tweets
    return relatedTweets.slice(0, 3);
  } catch (error) {
    console.error('Error finding related tweets:', error);
    return [];
  }
}

/**
 * Find hashtags related to a specific topic
 */
function findRelatedHashtags(title, summary, allHashtags) {
  try {
    // Create a simple keyword matching algorithm
    const keywords = [...new Set([
      ...title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
      ...summary.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    ])];
    
    // Filter hashtags that match any of the keywords
    const relatedHashtags = allHashtags.filter(hashtag => {
      return keywords.some(keyword => hashtag.hashtag.toLowerCase().includes(keyword));
    });
    
    // Sort by impact score
    relatedHashtags.sort((a, b) => b.impactScore - a.impactScore);
    
    // Return top 3 related hashtags
    return relatedHashtags.slice(0, 3);
  } catch (error) {
    console.error('Error finding related hashtags:', error);
    return [];
  }
}

/**
 * Calculate Twitter impact score for a topic based on related tweets and hashtags
 */
function calculateTwitterImpactScore(tweets, hashtags) {
  let score = 0;
  
  // Add scores from tweets
  for (const tweet of tweets) {
    score += calculateTweetImpactScore(tweet);
  }
  
  // Add scores from hashtags
  for (const hashtag of hashtags) {
    score += hashtag.impactScore;
  }
  
  // Normalize the score
  if (tweets.length > 0 || hashtags.length > 0) {
    score = score / (tweets.length + hashtags.length);
  }
  
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate impact score for a tweet
 */
function calculateTweetImpactScore(tweet) {
  // Simple formula: likes + (retweets * 2) + (author followers / 1000)
  const likesScore = tweet.likesCount || 0;
  const retweetsScore = (tweet.retweetsCount || 0) * 2;
  const followersScore = (tweet.authorFollowersCount || 0) / 1000;
  
  return likesScore + retweetsScore + followersScore;
}

main();