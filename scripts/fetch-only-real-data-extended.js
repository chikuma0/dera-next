#!/usr/bin/env node

/**
 * This script fetches only real data from the Grok API and throws an error
 * if it can't fetch real data or if it detects any synthetic data.
 * 
 * Run with: node scripts/fetch-only-real-data-extended.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const rootDir = path.join(__dirname, '..');
const tempFile = path.join(rootDir, 'src/pages/api/fetch-only-real-data.ts');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');
const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');

console.log('=== FETCHING ONLY REAL DATA FROM GROK API ===');
console.log('This script will:');
console.log('1. Attempt to fetch real data from the Grok API');
console.log('2. Throw an error if it can\'t fetch real data');
console.log('3. Throw an error if it detects any synthetic data');
console.log('=======================================\n');

// Step 1: Create a temporary API route file
console.log('Step 1: Creating temporary API route file...');

fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import { GrokDigestService } from '@/lib/services/grokDigestService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Fetching real data from Grok API...');
  
  try {
    // Create a new instance of the GrokDigestService
    const grokDigestService = new GrokDigestService();
    
    // Generate a new weekly digest with real news
    console.log('Calling Grok API to fetch real news and Twitter data...');
    const digest = await grokDigestService.generateWeeklyDigest();
    
    if (!digest) {
      console.error('Failed to fetch data from Grok API');
      res.status(500).json({ error: 'Failed to fetch data from Grok API' });
      return;
    }
    
    // Validate that we have real data
    if (!digest.topics || digest.topics.length === 0) {
      console.error('No topics found in Grok API response');
      res.status(500).json({ error: 'No topics found in Grok API response' });
      return;
    }
    
    // Check for real citations
    let realCitationsCount = 0;
    let realTweetsCount = 0;
    
    digest.topics.forEach(topic => {
      if (topic.citations && topic.citations.length > 0) {
        realCitationsCount += topic.citations.length;
        
        // Count real tweets
        const xPosts = topic.citations.filter(citation => 
          citation.type === 'x-post' && 
          citation.url && 
          (citation.url.includes('twitter.com') || citation.url.includes('x.com'))
        );
        
        realTweetsCount += xPosts.length;
      }
    });
    
    if (realCitationsCount === 0) {
      console.error('No real citations found in Grok API response');
      res.status(500).json({ error: 'No real citations found in Grok API response' });
      return;
    }
    
    if (realTweetsCount === 0) {
      console.error('No real tweets found in Grok API response');
      res.status(500).json({ error: 'No real tweets found in Grok API response' });
      return;
    }
    
    console.log(\`Successfully fetched real data from Grok API with \${digest.topics.length} topics:\`);
    digest.topics.forEach((topic, index) => {
      console.log(\`  \${index + 1}. \${topic.title}\`);
      
      if (topic.citations && topic.citations.length > 0) {
        console.log(\`     Citations: \${topic.citations.length}\`);
      }
      
      if (topic.relatedHashtags && topic.relatedHashtags.length > 0) {
        console.log(\`     Related hashtags: \${topic.relatedHashtags.length}\`);
      }
    });
    
    console.log(\`Real citations: \${realCitationsCount}\`);
    console.log(\`Real tweets: \${realTweetsCount}\`);
    
    res.status(200).json({ 
      success: true, 
      topicsCount: digest.topics.length,
      citationsCount: realCitationsCount,
      tweetsCount: realTweetsCount
    });
  } catch (error) {
    console.error('Error fetching data from Grok API:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

console.log('✅ Temporary API route file created');

// Step 2: Attempt to fetch real data from the Grok API
console.log('\nStep 2: Attempting to fetch real data from the Grok API...');

try {
  // Check if Next.js is running
  console.log('Checking if Next.js is running on port 3001...');
  
  try {
    execSync('curl -s http://localhost:3001', { timeout: 5000 });
    console.log('✅ Next.js is running on port 3001');
  } catch (error) {
    console.error('❌ Next.js is not running on port 3001');
    console.error('Please start the Next.js server with:');
    console.error('npm run dev -- -p 3001');
    throw new Error('Next.js server is not running');
  }
  
  // Execute the API route with an increased timeout
  console.log('Executing API route to fetch real data (with increased timeout)...');
  
  const response = execSync('curl -s http://localhost:3001/api/fetch-only-real-data', { 
    encoding: 'utf8',
    timeout: 60000  // Increased timeout to 60 seconds
  });
  
  // Parse the response
  const responseData = JSON.parse(response);
  
  if (!responseData.success) {
    throw new Error('Failed to fetch real data from Grok API');
  }
  
  console.log('✅ Successfully fetched real data from Grok API');
  console.log(`Topics: ${responseData.topicsCount}`);
  console.log(`Citations: ${responseData.citationsCount}`);
  console.log(`Tweets: ${responseData.tweetsCount}`);
  
  // Step 3: Extract Twitter data from Grok Digest
  console.log('\nStep 3: Extracting Twitter data from Grok Digest...');
  
  // Read the Grok Digest file
  const grokDigestPath = path.join(rootDir, 'public/data/grok-digest.json');
  
  if (!fs.existsSync(grokDigestPath)) {
    throw new Error('Grok Digest file not found. Make sure the Grok Digest was generated successfully.');
  }
  
  const grokDigestData = JSON.parse(fs.readFileSync(grokDigestPath, 'utf8'));
  
  // Extract Twitter data from citations
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
        throw new Error('No real tweets found in Grok Digest');
      }
      
      xPosts.forEach(post => {
        // Extract tweet ID from URL
        const urlParts = post.url.split('/');
        const tweetId = urlParts[urlParts.length - 1];
        
        // Extract username from URL
        const username = urlParts[urlParts.length - 2];
        
        // Create tweet object with only the data we have
        const tweet = {
          id: tweetId,
          content: post.title,
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
  
  // Extract hashtags from tweets
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
  
  // Save the Twitter data to a file
  fs.writeFileSync(twitterDataPath, JSON.stringify({ tweets, hashtags: hashtagsArray }, null, 2));
  
  console.log(`✅ Extracted ${tweets.length} real tweets and ${hashtagsArray.length} hashtags from Grok Digest`);
  
  // Step 4: Validate the data
  console.log('\nStep 4: Validating the data...');
  
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
  
  console.log('\n=== REAL DATA FETCHING COMPLETE ===');
  console.log('Successfully fetched real data from the Grok API.');
  console.log('No synthetic or placeholder data was used in this process.');
  console.log('You can now use this data for social impact scoring and citation fixing.');
  console.log('=======================================');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  console.error('Cannot proceed without real data. Exiting...');
  process.exit(1);
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}