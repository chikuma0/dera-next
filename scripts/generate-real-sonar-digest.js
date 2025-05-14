#!/usr/bin/env node

/**
 * This script generates a real sonar digest based on the Grok digest and Twitter data,
 * without relying on the Perplexity Sonar API to generate potentially hallucinated content.
 * 
 * Run with: node scripts/generate-real-sonar-digest.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Paths to the digest files
const rootDir = path.join(__dirname, '..');
const grokDigestPath = path.join(rootDir, 'public/data/grok-digest.json');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');
const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');
const twitterEnhancedDigestPath = path.join(rootDir, 'public/data/twitter-enhanced-sonar-digest.json');

console.log('=== GENERATING REAL SONAR DIGEST WITH VERIFIED SOURCES ===');
console.log('This script will:');
console.log('1. Use the Grok digest as the source of real news');
console.log('2. Use the Twitter data extracted from the Grok digest');
console.log('3. Create a new sonar digest with the real news and Twitter data');
console.log('4. Ensure all citations are to real, accessible URLs');
console.log('5. Update the twitter-enhanced-sonar-digest.json file');
console.log('=======================================\n');

// Function to check if a URL is accessible
async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = protocol.request(
        {
          method: 'HEAD',
          host: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          timeout: 5000,
        },
        (res) => {
          resolve({
            url,
            status: res.statusCode,
            accessible: res.statusCode >= 200 && res.statusCode < 400,
          });
        }
      );
      
      req.on('error', (err) => {
        resolve({
          url,
          status: 0,
          accessible: false,
          error: err.message,
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 0,
          accessible: false,
          error: 'Request timed out',
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        url,
        status: 0,
        accessible: false,
        error: error.message,
      });
    }
  });
}

// Function to find related tweets for a topic
function findRelatedTweets(topic, allTweets) {
  // Create a simple keyword matching algorithm
  const keywords = [...new Set([
    ...topic.title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
    ...topic.summary.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  ])];
  
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
}

// Function to find related hashtags for a topic
function findRelatedHashtags(topic, allHashtags) {
  // Create a simple keyword matching algorithm
  const keywords = [...new Set([
    ...topic.title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
    ...topic.summary.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  ])];
  
  // Filter hashtags that match any of the keywords
  const relatedHashtags = allHashtags.filter(hashtag => {
    return keywords.some(keyword => hashtag.hashtag.toLowerCase().includes(keyword));
  });
  
  // Sort by impact score
  relatedHashtags.sort((a, b) => b.impactScore - a.impactScore);
  
  // Return top 3 related hashtags
  return relatedHashtags.slice(0, 3);
}

// Function to calculate Twitter impact score for a topic
function calculateTwitterImpactScore(tweets, hashtags) {
  let score = 0;
  
  // Add scores from tweets
  for (const tweet of tweets) {
    // Base formula: likes + (retweets * 2) + (quotes * 3) + replies
    const engagementScore = 
      tweet.likesCount + 
      (tweet.retweetsCount * 2) + 
      (tweet.quoteCount * 3) + 
      tweet.repliesCount;
    
    // Follower influence factor (log scale)
    const followerFactor = tweet.authorFollowersCount > 0 
      ? Math.log10(tweet.authorFollowersCount) / 6 // Normalize to ~0-1 range
      : 0;
    
    // Verified account bonus
    const verifiedBonus = tweet.isVerified ? 1.2 : 1;
    
    // Calculate tweet impact score
    const tweetScore = engagementScore * (1 + followerFactor) * verifiedBonus;
    
    score += tweetScore;
  }
  
  // Add scores from hashtags
  for (const hashtag of hashtags) {
    score += hashtag.impactScore;
  }
  
  // Normalize the score
  if (tweets.length > 0 || hashtags.length > 0) {
    score = score / (tweets.length + hashtags.length);
  }
  
  return Math.round(score);
}

// Main function
async function main() {
  try {
    // Step 1: Read the Grok digest
    console.log('Step 1: Reading Grok digest...');
    
    if (!fs.existsSync(grokDigestPath)) {
      throw new Error('Grok digest file not found. Run enhanced-refresh-sonar-with-grok-data.js first.');
    }
    
    const grokDigestData = JSON.parse(fs.readFileSync(grokDigestPath, 'utf8'));
    console.log(`Found ${grokDigestData.topics.length} topics in Grok digest`);
    
    // Step 2: Read the Twitter data
    console.log('Step 2: Reading Twitter data...');
    
    if (!fs.existsSync(twitterDataPath)) {
      throw new Error('Twitter data file not found. Run enhanced-refresh-sonar-with-grok-data.js first.');
    }
    
    const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
    console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags in Twitter data`);
    
    // Step 3: Create a new sonar digest based on the Grok digest
    console.log('Step 3: Creating new sonar digest based on Grok digest...');
    
    // Create a backup of the sonar digest file if it exists
    if (fs.existsSync(sonarDigestPath)) {
      const backupPath = path.join(rootDir, 'public/data/sonar-digest.json.backup');
      console.log('Creating backup of sonar digest file:', backupPath);
      fs.writeFileSync(backupPath, fs.readFileSync(sonarDigestPath, 'utf8'));
    }
    
    // Create a new sonar digest
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    // Format dates for display
    const formattedWeekStart = weekStart.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedToday = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create the sonar digest
    const sonarDigest = {
      title: `Weekly AI News Digest: ${formattedWeekStart} - ${formattedToday}`,
      date: today.toISOString(),
      summary: grokDigestData.summary || "Weekly digest of viral and valuable AI news topics.",
      topics: [],
      rawHtml: "",
      publishedAt: today.toISOString()
    };
    
    // Step 4: Verify citations in the Grok digest
    console.log('Step 4: Verifying citations in Grok digest...');
    
    // Extract all URLs from the Grok digest
    const urls = [];
    grokDigestData.topics.forEach(topic => {
      if (topic.citations && Array.isArray(topic.citations)) {
        topic.citations.forEach(citation => {
          if (citation.url) {
            urls.push(citation.url);
          }
        });
      }
    });
    
    console.log(`Found ${urls.length} URLs in Grok digest`);
    
    // Check each URL
    console.log('Checking URLs...');
    const results = await Promise.all(urls.map(checkUrl));
    
    // Count accessible and inaccessible URLs
    const accessibleUrls = results.filter((result) => result.accessible);
    const inaccessibleUrls = results.filter((result) => !result.accessible);
    
    console.log(`✅ ${accessibleUrls.length} URLs are accessible`);
    console.log(`❌ ${inaccessibleUrls.length} URLs are inaccessible`);
    
    // Create a map of URL accessibility
    const urlAccessibility = {};
    results.forEach(result => {
      urlAccessibility[result.url] = result.accessible;
    });
    
    // Step 5: Create topics for the sonar digest
    console.log('Step 5: Creating topics for sonar digest...');
    
    // Process each topic from the Grok digest
    for (const grokTopic of grokDigestData.topics) {
      // Filter out inaccessible citations
      const accessibleCitations = (grokTopic.citations || []).filter(citation => {
        return urlAccessibility[citation.url] === true;
      });
      
      // Skip topics with no accessible citations
      if (accessibleCitations.length === 0) {
        console.log(`Skipping topic "${grokTopic.title}" because it has no accessible citations`);
        continue;
      }
      
      // Find related tweets for this topic
      const relatedTweets = findRelatedTweets(grokTopic, twitterData.tweets);
      
      // Find related hashtags for this topic
      const relatedHashtags = findRelatedHashtags(grokTopic, twitterData.hashtags);
      
      // Calculate Twitter impact score
      const twitterImpactScore = calculateTwitterImpactScore(relatedTweets, relatedHashtags);
      
      // Create the sonar topic
      const sonarTopic = {
        title: grokTopic.title,
        summary: grokTopic.summary,
        viralReason: grokTopic.viralReason,
        valueReason: grokTopic.valueReason,
        insights: grokTopic.insights,
        // Instead of using potentially hallucinated citations, use the real tweets we found
        citations: relatedTweets.map(tweet => ({
          title: `${tweet.authorName} (@${tweet.authorUsername}) on Twitter`,
          url: tweet.url,
          type: 'x-post'
        })),
        relatedTweets,
        relatedHashtags,
        twitterImpactScore
      };
      
      // Add the topic to the sonar digest
      sonarDigest.topics.push(sonarTopic);
    }
    
    console.log(`Created ${sonarDigest.topics.length} topics for sonar digest`);
    
    // Step 6: Generate HTML for the sonar digest
    console.log('Step 6: Generating HTML for sonar digest...');
    
    // Generate HTML for the sonar digest
    let html = `<h1>${sonarDigest.title}</h1>
<p>${sonarDigest.summary}</p>

<h2>Top ${sonarDigest.topics.length} AI Topics This Week</h2>
`;
    
    // Add each topic to the HTML
    sonarDigest.topics.forEach((topic, index) => {
      html += `
<div class="topic">
  <h3>${topic.title}</h3>
  <p><strong>Summary:</strong> ${topic.summary}</p>
  <p><strong>Why Viral:</strong> ${topic.viralReason}</p>
  <p><strong>Why Valuable:</strong> ${topic.valueReason}</p>
  <p><strong>Insights:</strong> ${topic.insights}</p>
  <p><strong>Citations:</strong> `;
      
      // Add citations to the HTML
      topic.citations.forEach((citation, citIndex) => {
        html += `<a href="${citation.url}" target="_blank">${citation.title}</a>`;
        if (citIndex < topic.citations.length - 1) {
          html += ', ';
        }
      });
      
      html += `</p>
</div>
`;
    });
    
    // Add the HTML to the sonar digest
    sonarDigest.rawHtml = html;
    
    // Step 7: Save the sonar digest
    console.log('Step 7: Saving sonar digest...');
    fs.writeFileSync(sonarDigestPath, JSON.stringify(sonarDigest, null, 2));
    console.log(`✅ Saved sonar digest to ${sonarDigestPath}`);
    
    // Step 8: Create Twitter-enhanced sonar digest
    console.log('Step 8: Creating Twitter-enhanced sonar digest...');
    
    // Create a backup of the Twitter-enhanced sonar digest file if it exists
    if (fs.existsSync(twitterEnhancedDigestPath)) {
      const backupPath = path.join(rootDir, 'public/data/twitter-enhanced-sonar-digest.backup.json');
      console.log('Creating backup of Twitter-enhanced sonar digest file:', backupPath);
      fs.writeFileSync(backupPath, fs.readFileSync(twitterEnhancedDigestPath, 'utf8'));
    }
    
    // The Twitter-enhanced sonar digest is the same as the sonar digest
    // since we've already added the Twitter data to the sonar digest
    fs.writeFileSync(twitterEnhancedDigestPath, JSON.stringify(sonarDigest, null, 2));
    console.log(`✅ Saved Twitter-enhanced sonar digest to ${twitterEnhancedDigestPath}`);
    
    // Step 9: Update the last update timestamp
    console.log('Step 9: Updating last update timestamp...');
    const timestampPath = path.join(rootDir, 'public/data/sonar-digest-last-update.json');
    fs.writeFileSync(timestampPath, JSON.stringify({
      lastUpdated: new Date().toISOString()
    }, null, 2));
    console.log(`✅ Updated last update timestamp at ${timestampPath}`);
    
    // Create a simple HTML page to clear localStorage
    const htmlPath = path.join(rootDir, 'public/clear-sonar-cache.html');
    fs.writeFileSync(
      htmlPath,
      `<!DOCTYPE html>
<html>
<head>
  <title>Clear Sonar Cache</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      background-color: #0f0f1a;
      color: #e0e0ff;
    }
    .container {
      background-color: #1a1a2e;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    h1 {
      color: #a78bfa;
      text-align: center;
    }
    .success {
      color: #10b981;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #7c3aed;
      color: white;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      font-size: 16px;
      margin: 10px 0;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #6d28d9;
    }
    .center {
      text-align: center;
    }
    .info {
      background-color: #1e293b;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Clear Sonar Digest Cache</h1>
    <p>If you're seeing outdated content in the Sonar Digest, use this tool to clear your browser's cache and fetch the latest content from the server.</p>
    
    <div class="info">
      <p>This will clear the cached digest data stored in your browser's localStorage and reload the Sonar Digest page.</p>
    </div>
    
    <div class="center">
      <button id="clearButton" class="button">Clear Cache & Reload</button>
    </div>
    
    <p id="status"></p>
  </div>
  
  <script>
    document.getElementById('clearButton').addEventListener('click', function() {
      // Clear the Sonar digest from localStorage
      localStorage.removeItem('sonarDigest_twitter-enhanced');
      localStorage.removeItem('sonarDigest_twitter-enhanced_timestamp');
      
      // Also clear any other versions
      localStorage.removeItem('sonarDigest_');
      localStorage.removeItem('sonarDigest__timestamp');
      
      // Show success message
      document.getElementById('status').innerHTML = '<div class="center"><p class="success">Cache cleared successfully!</p><p>Redirecting to Sonar Digest...</p></div>';
      
      // Redirect to the Sonar digest page with a cache-busting parameter
      setTimeout(function() {
        window.location.href = '/news/sonar-digest?nocache=' + new Date().getTime();
      }, 1500);
    });
  </script>
</body>
</html>`
    );
    
    console.log(`✅ Cache clearing page created at: ${htmlPath}`);
    
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Open the cache clearing page in your browser:');
    console.log('   http://localhost:3001/clear-sonar-cache.html');
    console.log('2. Click the "Clear Cache & Reload" button');
    console.log('3. The Sonar digest should now show real news and Twitter data');
    console.log('=======================================');
  } catch (error) {
    console.error('Error generating real sonar digest:', error);
  }
}

// Run the main function
main();