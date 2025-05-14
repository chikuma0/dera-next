6#!/usr/bin/env node

/**
 * This script updates the Twitter-enhanced Sonar digest file with the real news content from the Perplexity API.
 * 
 * Run with: node scripts/update-twitter-enhanced-sonar-digest.js
 */

const fs = require('fs');
const path = require('path');

// Paths to the digest files
const sonarDigestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const twitterEnhancedDigestPath = path.join(__dirname, '..', 'public/data/twitter-enhanced-sonar-digest.json');

console.log('=== UPDATING TWITTER-ENHANCED SONAR DIGEST ===');
console.log('This script will:');
console.log('1. Read the real news content from sonar-digest.json');
console.log('2. Update twitter-enhanced-sonar-digest.json with the real news content');
console.log('=======================================\n');

try {
  // Read the Sonar digest file
  console.log('Reading Sonar digest file:', sonarDigestPath);
  const sonarDigestData = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
  
  // Read the Twitter-enhanced Sonar digest file
  console.log('Reading Twitter-enhanced Sonar digest file:', twitterEnhancedDigestPath);
  const twitterEnhancedDigestData = JSON.parse(fs.readFileSync(twitterEnhancedDigestPath, 'utf8'));
  
  // Create a backup of the Twitter-enhanced Sonar digest file
  const backupPath = path.join(__dirname, '..', 'public/data/twitter-enhanced-sonar-digest.backup.json');
  console.log('Creating backup of Twitter-enhanced Sonar digest file:', backupPath);
  fs.writeFileSync(backupPath, JSON.stringify(twitterEnhancedDigestData, null, 2));
  
  // Update the Twitter-enhanced Sonar digest with the real news content
  console.log('Updating Twitter-enhanced Sonar digest with real news content...');
  
  // Keep the Twitter-related fields from the original Twitter-enhanced digest
  const updatedTopics = sonarDigestData.topics.map((topic, index) => {
    // Find the corresponding topic in the Twitter-enhanced digest (if it exists)
    const twitterTopic = twitterEnhancedDigestData.topics[index] || {};
    
    // Merge the real news content with the Twitter-related fields
    return {
      ...topic,
      relatedTweets: twitterTopic.relatedTweets || [],
      relatedHashtags: twitterTopic.relatedHashtags || [],
      twitterImpactScore: twitterTopic.twitterImpactScore || 0
    };
  });
  
  // Create the updated Twitter-enhanced Sonar digest
  const updatedDigest = {
    ...sonarDigestData,
    topics: updatedTopics
  };
  
  // Write the updated Twitter-enhanced Sonar digest to the file
  console.log('Writing updated Twitter-enhanced Sonar digest to file...');
  fs.writeFileSync(twitterEnhancedDigestPath, JSON.stringify(updatedDigest, null, 2));
  
  console.log('✅ Twitter-enhanced Sonar digest updated successfully!');
  
  // Create a simple HTML page to clear localStorage
  const htmlPath = path.join(__dirname, '..', 'public/clear-sonar-cache.html');
  fs.writeFileSync(
    htmlPath,
    `
<!DOCTYPE html>
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
      localStorage.removeItem('sonarDigest');
      localStorage.removeItem('sonarDigestTimestamp');
      
      // Also clear any twitter-enhanced version
      localStorage.removeItem('sonarDigestTwitterEnhanced');
      localStorage.removeItem('sonarDigestTwitterEnhancedTimestamp');
      
      // Show success message
      document.getElementById('status').innerHTML = '<div class="center"><p class="success">Cache cleared successfully!</p><p>Redirecting to Sonar Digest...</p></div>';
      
      // Redirect to the Sonar digest page with a cache-busting parameter
      setTimeout(function() {
        window.location.href = '/news/sonar-digest?nocache=' + new Date().getTime();
      }, 1500);
    });
  </script>
</body>
</html>
    `
  );
  
  console.log('✅ Cache clearing page created at:', htmlPath);
  
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Open the cache clearing page in your browser:');
  console.log('   http://localhost:3006/clear-sonar-cache.html');
  console.log('2. Click the "Clear Cache & Reload" button');
  console.log('3. The Sonar digest should now show the real news content');
  console.log('=======================================');
} catch (error) {
  console.error('Error updating Twitter-enhanced Sonar digest:', error);
}