#!/usr/bin/env node

/**
 * This script generates a Twitter-enhanced version of the Sonar Digest
 * by incorporating Twitter data from the twitter-data.json file.
 */

const fs = require('fs');
const path = require('path');

// Paths to the data files
const rootDir = path.join(__dirname, '..');
const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');
const enhancedDigestPath = path.join(rootDir, 'public/data/sonar-digest-twitter-enhanced.json');

console.log('=== GENERATING TWITTER-ENHANCED SONAR DIGEST ===');

// Check if the required files exist
if (!fs.existsSync(sonarDigestPath)) {
  console.error('Sonar Digest file not found:', sonarDigestPath);
  process.exit(1);
}

if (!fs.existsSync(twitterDataPath)) {
  console.error('Twitter data file not found:', twitterDataPath);
  process.exit(1);
}

try {
  // Read the Sonar Digest
  console.log('Reading Sonar Digest...');
  const sonarDigest = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
  
  // Read the Twitter data
  console.log('Reading Twitter data...');
  const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
  
  // Create a copy of the Sonar Digest for enhancement
  const enhancedDigest = JSON.parse(JSON.stringify(sonarDigest));
  
  // Update the title to indicate Twitter enhancement
  enhancedDigest.title = enhancedDigest.title + ' (Twitter Enhanced)';
  
  // Add a flag to indicate this is a Twitter-enhanced digest
  enhancedDigest.isTwitterEnhanced = true;
  
  // Process each topic in the digest
  console.log('Enhancing topics with Twitter data...');
  enhancedDigest.topics.forEach(topic => {
    // Find relevant tweets for this topic
    const relevantTweets = findRelevantTweets(topic, twitterData.tweets);
    
    // Find relevant hashtags for this topic
    const relevantHashtags = findRelevantHashtags(topic, twitterData.hashtags);
    
    // Add Twitter data to the topic
    topic.relatedTweets = relevantTweets;
    topic.relatedHashtags = relevantHashtags;
    
    // Calculate Twitter impact score based on the related tweets and hashtags
    topic.twitterImpactScore = calculateTwitterImpactScore(relevantTweets, relevantHashtags);
    
    // Update the HTML content to include Twitter data
    if (topic.htmlContent) {
      topic.htmlContent = enhanceHtmlWithTwitterData(topic.htmlContent, relevantTweets, relevantHashtags);
    }
  });
  
  // Sort topics by Twitter impact score
  enhancedDigest.topics.sort((a, b) => (b.twitterImpactScore || 0) - (a.twitterImpactScore || 0));
  
  // Write the enhanced digest to a file
  console.log('Writing Twitter-enhanced Sonar Digest...');
  fs.writeFileSync(enhancedDigestPath, JSON.stringify(enhancedDigest, null, 2));
  
  console.log('✅ Twitter-enhanced Sonar Digest generated successfully!');
  console.log(`File saved to: ${enhancedDigestPath}`);
} catch (error) {
  console.error('Error generating Twitter-enhanced Sonar Digest:', error);
  process.exit(1);
}

/**
 * Find tweets that are relevant to the given topic
 */
function findRelevantTweets(topic, tweets) {
  // Extract keywords from the topic title and summary
  const keywords = extractKeywords(topic.title + ' ' + topic.summary);
  
  // Score each tweet based on keyword matches
  const scoredTweets = tweets.map(tweet => {
    const tweetText = tweet.content || '';
    const score = calculateRelevanceScore(tweetText, keywords);
    return { tweet, score };
  });
  
  // Sort tweets by relevance score
  scoredTweets.sort((a, b) => b.score - a.score);
  
  // Return the top 5 most relevant tweets
  return scoredTweets.slice(0, 5).map(item => item.tweet);
}

/**
 * Find hashtags that are relevant to the given topic
 */
function findRelevantHashtags(topic, hashtags) {
  // Extract keywords from the topic title and summary
  const keywords = extractKeywords(topic.title + ' ' + topic.summary);
  
  // Score each hashtag based on keyword matches
  const scoredHashtags = hashtags.map(hashtag => {
    const score = calculateRelevanceScore(hashtag.hashtag, keywords);
    return { hashtag, score };
  });
  
  // Sort hashtags by relevance score
  scoredHashtags.sort((a, b) => b.score - a.score);
  
  // Return the top 3 most relevant hashtags
  return scoredHashtags.slice(0, 3).map(item => item.hashtag);
}

/**
 * Calculate a Twitter impact score for a topic based on related tweets and hashtags
 */
function calculateTwitterImpactScore(tweets, hashtags) {
  // Calculate score based on tweet engagement
  const tweetScore = tweets.reduce((sum, tweet) => {
    return sum + (tweet.impactScore || 0);
  }, 0);
  
  // Calculate score based on hashtag engagement
  const hashtagScore = hashtags.reduce((sum, hashtag) => {
    if (typeof hashtag === 'string') return sum;
    return sum + (hashtag.impactScore || 0);
  }, 0);
  
  // Combine scores
  return Math.round((tweetScore * 0.7 + hashtagScore * 0.3) * 100) / 100;
}

/**
 * Enhance HTML content with Twitter data
 */
function enhanceHtmlWithTwitterData(html, tweets, hashtags) {
  // This is a simplified implementation
  // In a real implementation, you would parse the HTML and insert Twitter data in appropriate places
  
  // Add a Twitter section to the HTML
  let enhancedHtml = html;
  
  // Add tweets section
  if (tweets && tweets.length > 0) {
    let tweetsHtml = '<div class="twitter-section"><h3>Related Tweets</h3><ul>';
    
    tweets.forEach(tweet => {
      tweetsHtml += `
        <li class="tweet">
          <p><strong>@${tweet.authorUsername}</strong>: ${tweet.content}</p>
          <p class="engagement">
            ${tweet.likesCount || 0} likes, 
            ${tweet.retweetsCount || 0} retweets, 
            ${tweet.repliesCount || 0} replies
          </p>
          <p><a href="${tweet.url}" target="_blank">View on X</a></p>
        </li>
      `;
    });
    
    tweetsHtml += '</ul></div>';
    
    // Insert the tweets section before the closing div of the topic
    enhancedHtml = enhancedHtml.replace('</div>', tweetsHtml + '</div>');
  }
  
  // Add hashtags section
  if (hashtags && hashtags.length > 0) {
    let hashtagsHtml = '<div class="hashtags-section"><h3>Related Hashtags</h3><ul>';
    
    hashtags.forEach(hashtag => {
      const hashtagName = typeof hashtag === 'string' ? hashtag : hashtag.hashtag;
      hashtagsHtml += `<li>#${hashtagName}</li>`;
    });
    
    hashtagsHtml += '</ul></div>';
    
    // Insert the hashtags section before the closing div of the topic
    enhancedHtml = enhancedHtml.replace('</div>', hashtagsHtml + '</div>');
  }
  
  return enhancedHtml;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Convert to lowercase
  const lowercaseText = text.toLowerCase();
  
  // Split into words
  const words = lowercaseText.split(/\W+/);
  
  // Filter out common stop words and short words
  const stopWords = ['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 'is', 'are', 'was', 'were'];
  const keywords = words.filter(word => word.length > 3 && !stopWords.includes(word));
  
  // Return unique keywords
  return [...new Set(keywords)];
}

/**
 * Calculate relevance score based on keyword matches
 */
function calculateRelevanceScore(text, keywords) {
  // Convert to lowercase
  const lowercaseText = text.toLowerCase();
  
  // Count keyword matches
  let score = 0;
  keywords.forEach(keyword => {
    if (lowercaseText.includes(keyword)) {
      score += 1;
    }
  });
  
  return score;
}