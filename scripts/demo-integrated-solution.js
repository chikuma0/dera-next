#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * This script demonstrates the integrated social impact scoring and citation fixing solution.
 * It runs each component of the system and displays the results.
 */

// Configuration
const SONAR_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const TWITTER_DATA_PATH = path.join(__dirname, '..', 'public/data/twitter-data.json');
const TWITTER_ENHANCED_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest-twitter-enhanced.json');

// Main function
async function demoIntegratedSolution() {
  try {
    console.log('=== DEMONSTRATING INTEGRATED SOCIAL IMPACT SCORING AND CITATION FIXING ===');
    
    // Step 1: Backup original files
    console.log('\nBacking up original files...');
    backupFiles();
    
    // Step 2: Fetch Twitter data
    console.log('\nFetching Twitter data...');
    console.log('Running enhanced-refresh-sonar-with-grok-data.js...');
    try {
      execSync('node scripts/enhanced-refresh-sonar-with-grok-data.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error fetching Twitter data:', error.message);
      console.log('Using existing Twitter data if available...');
    }
    
    // Step 3: Display Twitter data
    console.log('\nDisplaying Twitter data...');
    displayTwitterData();
    
    // Step 4: Fix Sonar citations
    console.log('\nFixing Sonar citations...');
    console.log('Running fix-sonar-citations.js...');
    try {
      execSync('node scripts/fix-sonar-citations.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error fixing Sonar citations:', error.message);
      console.log('Skipping citation fixing...');
    }
    
    // Step 5: Calculate social impact scores
    console.log('\nCalculating social impact scores...');
    console.log('Running integrated-social-impact-scoring-cjs.js...');
    try {
      execSync('node scripts/integrated-social-impact-scoring-cjs.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error calculating social impact scores:', error.message);
      console.log('Skipping social impact scoring...');
    }
    
    // Step 6: Generate Twitter-enhanced Sonar digest
    console.log('\nGenerating Twitter-enhanced Sonar digest...');
    console.log('Running generate-twitter-enhanced-sonar-digest.js...');
    try {
      execSync('node scripts/generate-twitter-enhanced-sonar-digest.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error generating Twitter-enhanced Sonar digest:', error.message);
      console.log('Skipping Twitter-enhanced Sonar digest generation...');
    }
    
    // Step 7: Test the integrated solution
    console.log('\nTesting the integrated solution...');
    console.log('Running test-social-impact.js...');
    try {
      execSync('node scripts/test-social-impact.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error testing the integrated solution:', error.message);
      console.log('Some tests may have failed...');
    }
    
    // Step 8: Display results
    console.log('\n=== INTEGRATED SOLUTION DEMONSTRATION COMPLETE ===');
    console.log('The integrated social impact scoring and citation fixing solution has been demonstrated.');
    console.log('You can now view the results in the following files:');
    console.log(`- Twitter data: ${TWITTER_DATA_PATH}`);
    console.log(`- Sonar digest with fixed citations: ${SONAR_DIGEST_PATH}`);
    console.log(`- Twitter-enhanced Sonar digest: ${TWITTER_ENHANCED_DIGEST_PATH}`);
    
    console.log('\nTo schedule the solution to run hourly, run:');
    console.log('node scripts/schedule-social-impact-scoring.js');
    
  } catch (error) {
    console.error('Error demonstrating integrated solution:', error);
  }
}

// Helper function to backup files
function backupFiles() {
  const filesToBackup = [
    SONAR_DIGEST_PATH,
    TWITTER_DATA_PATH,
    TWITTER_ENHANCED_DIGEST_PATH
  ];
  
  filesToBackup.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`Backed up ${filePath} to ${backupPath}`);
    }
  });
}

// Helper function to display Twitter data
function displayTwitterData() {
  if (!fs.existsSync(TWITTER_DATA_PATH)) {
    console.log('Twitter data file not found');
    return;
  }
  
  const twitterData = JSON.parse(fs.readFileSync(TWITTER_DATA_PATH, 'utf8'));
  
  console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags`);
  
  // Display all tweets
  console.log('\nAll tweets:');
  twitterData.tweets.forEach((tweet, index) => {
    console.log(`\n${index + 1}. ${tweet.content}`);
    console.log(`   Author: @${tweet.authorUsername} (${tweet.authorName})`);
    console.log(`   Followers: ${tweet.authorFollowersCount}`);
    console.log(`   Engagement: ${tweet.likesCount} likes, ${tweet.retweetsCount} retweets`);
    console.log(`   Impact Score: ${tweet.impactScore}`);
    console.log(`   URL: ${tweet.url}`);
  });
  
  // Display all hashtags
  console.log('\nAll hashtags:');
  twitterData.hashtags.forEach((hashtag, index) => {
    console.log(`\n${index + 1}. #${hashtag.hashtag}`);
    console.log(`   Tweet Count: ${hashtag.tweetCount}`);
    console.log(`   Total Engagement: ${hashtag.totalEngagement}`);
    console.log(`   Growth Rate: ${hashtag.growthRate}`);
    console.log(`   Impact Score: ${hashtag.impactScore}`);
  });
}

// Run the script
demoIntegratedSolution().catch(console.error);