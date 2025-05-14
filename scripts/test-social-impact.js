#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

/**
 * This script tests the social impact scoring and citation fixing systems.
 * It validates the structure of the data and ensures proper connections between
 * topics, articles, and social media.
 */

// Configuration
const SONAR_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const TWITTER_DATA_PATH = path.join(__dirname, '..', 'public/data/twitter-data.json');
const TWITTER_ENHANCED_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest-twitter-enhanced.json');

// Main function
async function testSocialImpact() {
  try {
    console.log('=== TESTING SOCIAL IMPACT SCORING AND CITATION FIXING ===');
    
    // Step 1: Validate Twitter data
    console.log('\nValidating Twitter data...');
    validateTwitterData();
    
    // Step 2: Validate Sonar digest
    console.log('\nValidating Sonar digest...');
    validateSonarDigest();
    
    // Step 3: Validate Twitter-enhanced Sonar digest
    console.log('\nValidating Twitter-enhanced Sonar digest...');
    validateTwitterEnhancedDigest();
    
    // Step 4: Validate connections between data
    console.log('\nValidating connections between data...');
    validateConnections();
    
    console.log('\n=== ALL TESTS PASSED ===');
    console.log('The social impact scoring and citation fixing systems are working correctly.');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Helper function to validate Twitter data
function validateTwitterData() {
  // Check if the file exists
  if (!fs.existsSync(TWITTER_DATA_PATH)) {
    throw new Error(`Twitter data file not found: ${TWITTER_DATA_PATH}`);
  }
  
  // Read the file
  const twitterData = JSON.parse(fs.readFileSync(TWITTER_DATA_PATH, 'utf8'));
  
  // Check if the data has the expected structure
  assert(Array.isArray(twitterData.tweets), 'Twitter data should have a tweets array');
  assert(Array.isArray(twitterData.hashtags), 'Twitter data should have a hashtags array');
  
  // Check if tweets have the expected properties
  twitterData.tweets.forEach((tweet, index) => {
    assert(tweet.id, `Tweet ${index} should have an id`);
    assert(tweet.content, `Tweet ${index} should have content`);
    assert(tweet.authorUsername, `Tweet ${index} should have an authorUsername`);
    assert(typeof tweet.likesCount === 'number', `Tweet ${index} should have a numeric likesCount`);
    assert(typeof tweet.retweetsCount === 'number', `Tweet ${index} should have a numeric retweetsCount`);
    assert(typeof tweet.impactScore === 'number', `Tweet ${index} should have a numeric impactScore`);
    assert(tweet.url, `Tweet ${index} should have a URL`);
    assert(tweet.url.startsWith('http'), `Tweet ${index} should have a valid URL`);
  });
  
  // Check if hashtags have the expected properties
  twitterData.hashtags.forEach((hashtag, index) => {
    assert(hashtag.hashtag, `Hashtag ${index} should have a hashtag property`);
    assert(typeof hashtag.tweetCount === 'number', `Hashtag ${index} should have a numeric tweetCount`);
  });
  
  console.log(`✅ Twitter data validated: ${twitterData.tweets.length} tweets, ${twitterData.hashtags.length} hashtags`);
}

// Helper function to validate Sonar digest
function validateSonarDigest() {
  // Check if the file exists
  if (!fs.existsSync(SONAR_DIGEST_PATH)) {
    throw new Error(`Sonar digest file not found: ${SONAR_DIGEST_PATH}`);
  }
  
  // Read the file
  const sonarDigest = JSON.parse(fs.readFileSync(SONAR_DIGEST_PATH, 'utf8'));
  
  // Check if the data has the expected structure
  assert(sonarDigest.title, 'Sonar digest should have a title');
  assert(sonarDigest.date, 'Sonar digest should have a date');
  assert(sonarDigest.summary, 'Sonar digest should have a summary');
  assert(Array.isArray(sonarDigest.topics), 'Sonar digest should have a topics array');
  
  // Check if topics have the expected properties
  sonarDigest.topics.forEach((topic, index) => {
    assert(topic.title, `Topic ${index} should have a title`);
    assert(topic.summary, `Topic ${index} should have a summary`);
    assert(Array.isArray(topic.citations), `Topic ${index} should have a citations array`);
    
    // Check if citations have the expected properties
    topic.citations.forEach((citation, citIndex) => {
      assert(citation.title, `Citation ${citIndex} in topic ${index} should have a title`);
      assert(citation.url, `Citation ${citIndex} in topic ${index} should have a URL`);
      assert(citation.type, `Citation ${citIndex} in topic ${index} should have a type`);
      assert(citation.url.startsWith('http'), `Citation ${citIndex} in topic ${index} should have a valid URL`);
    });
  });
  
  console.log(`✅ Sonar digest validated: ${sonarDigest.topics.length} topics`);
}

// Helper function to validate Twitter-enhanced Sonar digest
function validateTwitterEnhancedDigest() {
  // Check if the file exists
  if (!fs.existsSync(TWITTER_ENHANCED_DIGEST_PATH)) {
    throw new Error(`Twitter-enhanced Sonar digest file not found: ${TWITTER_ENHANCED_DIGEST_PATH}`);
  }
  
  // Read the file
  const enhancedDigest = JSON.parse(fs.readFileSync(TWITTER_ENHANCED_DIGEST_PATH, 'utf8'));
  
  // Check if the data has the expected structure
  assert(enhancedDigest.title, 'Enhanced digest should have a title');
  assert(enhancedDigest.date, 'Enhanced digest should have a date');
  assert(enhancedDigest.summary, 'Enhanced digest should have a summary');
  assert(Array.isArray(enhancedDigest.topics), 'Enhanced digest should have a topics array');
  assert(enhancedDigest.isTwitterEnhanced, 'Enhanced digest should have isTwitterEnhanced set to true');
  
  // Check if topics have the expected properties
  enhancedDigest.topics.forEach((topic, index) => {
    assert(topic.title, `Topic ${index} should have a title`);
    assert(topic.summary, `Topic ${index} should have a summary`);
    assert(Array.isArray(topic.citations), `Topic ${index} should have a citations array`);
    assert(Array.isArray(topic.relatedTweets), `Topic ${index} should have a relatedTweets array`);
    assert(Array.isArray(topic.relatedHashtags), `Topic ${index} should have a relatedHashtags array`);
    assert(typeof topic.twitterImpactScore === 'number', `Topic ${index} should have a numeric twitterImpactScore`);
    
    // Check if related tweets have the expected properties
    topic.relatedTweets.forEach((tweet, tweetIndex) => {
      assert(tweet.id, `Tweet ${tweetIndex} in topic ${index} should have an id`);
      assert(tweet.content, `Tweet ${tweetIndex} in topic ${index} should have content`);
      assert(tweet.url, `Tweet ${tweetIndex} in topic ${index} should have a URL`);
      assert(tweet.url.startsWith('http'), `Tweet ${tweetIndex} in topic ${index} should have a valid URL`);
    });
  });
  
  console.log(`✅ Twitter-enhanced Sonar digest validated: ${enhancedDigest.topics.length} topics`);
}

// Helper function to validate connections between data
function validateConnections() {
  // Read the files
  const twitterData = JSON.parse(fs.readFileSync(TWITTER_DATA_PATH, 'utf8'));
  const sonarDigest = JSON.parse(fs.readFileSync(SONAR_DIGEST_PATH, 'utf8'));
  const enhancedDigest = JSON.parse(fs.readFileSync(TWITTER_ENHANCED_DIGEST_PATH, 'utf8'));
  
  // Check if the enhanced digest has the same number of topics as the original digest
  assert.equal(
    enhancedDigest.topics.length,
    sonarDigest.topics.length,
    'Enhanced digest should have the same number of topics as the original digest'
  );
  
  // Check if the enhanced digest topics have the same titles as the original digest
  enhancedDigest.topics.forEach((topic, index) => {
    const originalTopic = sonarDigest.topics.find(t => t.title === topic.title);
    assert(originalTopic, `Topic "${topic.title}" in enhanced digest should exist in the original digest`);
  });
  
  // Check if the related tweets in the enhanced digest exist in the Twitter data
  enhancedDigest.topics.forEach((topic, index) => {
    topic.relatedTweets.forEach((tweet, tweetIndex) => {
      const originalTweet = twitterData.tweets.find(t => t.id === tweet.id);
      assert(originalTweet, `Tweet ${tweet.id} in topic ${index} should exist in the Twitter data`);
    });
  });
  
  console.log('✅ Connections between data validated');
}

// Run the script
testSocialImpact().catch(console.error);