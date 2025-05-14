#!/usr/bin/env node

/**
 * This script refreshes both the Sonar and Grok digests with real news content.
 * It uses the Perplexity API for Sonar and the xAI API for Grok.
 * 
 * Run with: node scripts/refresh-real-news.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to the digest files
const sonarDigestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const twitterEnhancedDigestPath = path.join(__dirname, '..', 'public/data/twitter-enhanced-sonar-digest.json');
const grokDigestPath = path.join(__dirname, '..', 'public/data/grok-digest.json');

// Path to the cache clearing page
const cacheClearingPagePath = path.join(__dirname, '..', 'public/clear-sonar-cache.html');

console.log('=== REFRESHING REAL NEWS DIGESTS ===');
console.log('This script will:');
console.log('1. Generate a new Sonar digest with real news from Perplexity API');
console.log('2. Update the Twitter-enhanced Sonar digest with the real news content');
console.log('3. Generate a new Grok digest with real news from xAI API');
console.log('4. Create a cache clearing page to clear the browser cache');
console.log('=======================================\n');

// Function to create a backup of a file
function createBackup(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup`;
    console.log(`Creating backup of ${path.basename(filePath)} at ${backupPath}`);
    fs.copyFileSync(filePath, backupPath);
    return true;
  }
  return false;
}

// Function to update the Twitter-enhanced Sonar digest with the real news content
function updateTwitterEnhancedSonarDigest() {
  try {
    // Read the Sonar digest file
    console.log('Reading Sonar digest file:', sonarDigestPath);
    const sonarDigestData = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
    
    // Read the Twitter-enhanced Sonar digest file
    console.log('Reading Twitter-enhanced Sonar digest file:', twitterEnhancedDigestPath);
    const twitterEnhancedDigestData = JSON.parse(fs.readFileSync(twitterEnhancedDigestPath, 'utf8'));
    
    // Create a backup of the Twitter-enhanced Sonar digest file
    createBackup(twitterEnhancedDigestPath);
    
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
    return true;
  } catch (error) {
    console.error('Error updating Twitter-enhanced Sonar digest:', error);
    return false;
  }
}

// Function to create a cache clearing page
function createCacheClearingPage() {
  try {
    console.log('Creating cache clearing page...');
    fs.writeFileSync(
      cacheClearingPagePath,
      `
<!DOCTYPE html>
<html>
<head>
  <title>Clear News Cache</title>
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
    .tabs {
      display: flex;
      margin-bottom: 20px;
    }
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      background-color: #1e293b;
      border-radius: 4px 4px 0 0;
      margin-right: 5px;
    }
    .tab.active {
      background-color: #7c3aed;
      color: white;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Clear News Cache</h1>
    <p>If you're seeing outdated content in the news digests, use this tool to clear your browser's cache and fetch the latest content from the server.</p>
    
    <div class="tabs">
      <div class="tab active" onclick="showTab('sonar')">Sonar Digest</div>
      <div class="tab" onclick="showTab('grok')">Grok Digest</div>
      <div class="tab" onclick="showTab('all')">Clear All</div>
    </div>
    
    <div id="sonar-tab" class="tab-content active">
      <div class="info">
        <p>This will clear the cached Sonar digest data stored in your browser's localStorage and reload the Sonar Digest page.</p>
      </div>
      
      <div class="center">
        <button id="clearSonarButton" class="button">Clear Sonar Cache & Reload</button>
      </div>
    </div>
    
    <div id="grok-tab" class="tab-content">
      <div class="info">
        <p>This will clear the cached Grok digest data stored in your browser's localStorage and reload the Grok Digest page.</p>
      </div>
      
      <div class="center">
        <button id="clearGrokButton" class="button">Clear Grok Cache & Reload</button>
      </div>
    </div>
    
    <div id="all-tab" class="tab-content">
      <div class="info">
        <p>This will clear all cached digest data stored in your browser's localStorage.</p>
      </div>
      
      <div class="center">
        <button id="clearAllButton" class="button">Clear All Caches</button>
      </div>
    </div>
    
    <p id="status"></p>
  </div>
  
  <script>
    function showTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Remove active class from all tab buttons
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show the selected tab
      document.getElementById(tabName + '-tab').classList.add('active');
      
      // Add active class to the selected tab button
      document.querySelectorAll('.tab').forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName)) {
          tab.classList.add('active');
        }
      });
    }
    
    document.getElementById('clearSonarButton').addEventListener('click', function() {
      // Clear the Sonar digest from localStorage
      localStorage.removeItem('sonarDigest');
      localStorage.removeItem('sonarDigestTimestamp');
      
      // Also clear any twitter-enhanced version
      localStorage.removeItem('sonarDigestTwitterEnhanced');
      localStorage.removeItem('sonarDigestTwitterEnhancedTimestamp');
      
      // Show success message
      document.getElementById('status').innerHTML = '<div class="center"><p class="success">Sonar cache cleared successfully!</p><p>Redirecting to Sonar Digest...</p></div>';
      
      // Redirect to the Sonar digest page with a cache-busting parameter
      setTimeout(function() {
        window.location.href = '/news/sonar-digest?nocache=' + new Date().getTime();
      }, 1500);
    });
    
    document.getElementById('clearGrokButton').addEventListener('click', function() {
      // Clear the Grok digest from localStorage
      localStorage.removeItem('grokDigest');
      localStorage.removeItem('grokDigestTimestamp');
      
      // Show success message
      document.getElementById('status').innerHTML = '<div class="center"><p class="success">Grok cache cleared successfully!</p><p>Redirecting to Grok Digest...</p></div>';
      
      // Redirect to the Grok digest page with a cache-busting parameter
      setTimeout(function() {
        window.location.href = '/news/grok-digest?nocache=' + new Date().getTime();
      }, 1500);
    });
    
    document.getElementById('clearAllButton').addEventListener('click', function() {
      // Clear all digest data from localStorage
      localStorage.removeItem('sonarDigest');
      localStorage.removeItem('sonarDigestTimestamp');
      localStorage.removeItem('sonarDigestTwitterEnhanced');
      localStorage.removeItem('sonarDigestTwitterEnhancedTimestamp');
      localStorage.removeItem('grokDigest');
      localStorage.removeItem('grokDigestTimestamp');
      
      // Show success message
      document.getElementById('status').innerHTML = '<div class="center"><p class="success">All caches cleared successfully!</p><p>You can now visit any digest page to see the latest content.</p></div>';
    });
  </script>
</body>
</html>
      `
    );
    
    console.log('✅ Cache clearing page created at:', cacheClearingPagePath);
    return true;
  } catch (error) {
    console.error('Error creating cache clearing page:', error);
    return false;
  }
}

// Main function to refresh the real news digests
async function refreshRealNewsDigests() {
  try {
    // Step 1: Generate a new Sonar digest with real news from Perplexity API
    console.log('\n1. Generating new Sonar digest with real news from Perplexity API...');
    try {
      // Create a backup of the Sonar digest file
      createBackup(sonarDigestPath);
      
      // Run the script to generate a new Sonar digest
      console.log('Running script to generate new Sonar digest...');
      execSync('node scripts/generate-sonar-digest.mjs', { stdio: 'inherit' });
      
      console.log('✅ New Sonar digest generated successfully!');
    } catch (error) {
      console.error('Error generating new Sonar digest:', error);
      return false;
    }
    
    // Step 2: Update the Twitter-enhanced Sonar digest with the real news content
    console.log('\n2. Updating Twitter-enhanced Sonar digest with real news content...');
    if (!updateTwitterEnhancedSonarDigest()) {
      return false;
    }
    
    // Step 3: Generate a new Grok digest with real news from xAI API
    console.log('\n3. Generating new Grok digest with real news from xAI API...');
    try {
      // Create a backup of the Grok digest file
      createBackup(grokDigestPath);
      
      // Run the script to generate a new Grok digest
      console.log('Running script to generate new Grok digest...');
      execSync('node scripts/generate-grok-digest.js', { stdio: 'inherit' });
      
      console.log('✅ New Grok digest generated successfully!');
    } catch (error) {
      console.error('Error generating new Grok digest:', error);
      return false;
    }
    
    // Step 4: Create a cache clearing page to clear the browser cache
    console.log('\n4. Creating cache clearing page to clear the browser cache...');
    if (!createCacheClearingPage()) {
      return false;
    }
    
    console.log('\n✅ All real news digests refreshed successfully!');
    
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Open the cache clearing page in your browser:');
    console.log('   http://localhost:3006/clear-sonar-cache.html');
    console.log('2. Use the tabs to clear the cache for Sonar, Grok, or both');
    console.log('3. The digests should now show the latest real news content');
    console.log('=======================================');
    
    return true;
  } catch (error) {
    console.error('Error refreshing real news digests:', error);
    return false;
  }
}

// Run the main function
refreshRealNewsDigests().then((success) => {
  if (success) {
    console.log('Real news digests refreshed successfully!');
  } else {
    console.error('Failed to refresh real news digests.');
  }
});