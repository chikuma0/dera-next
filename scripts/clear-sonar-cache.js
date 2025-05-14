#!/usr/bin/env node

/**
 * This script clears the Sonar digest cache and updates the component to use the latest data.
 * 
 * Run with: node scripts/clear-sonar-cache.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the SonarDigest component
const componentPath = path.join(__dirname, '..', 'src/components/news/SonarDigest.tsx');

console.log('=== CLEARING SONAR DIGEST CACHE ===');
console.log('This script will:');
console.log('1. Update the SonarDigest component to bypass cache');
console.log('2. Create a temporary API route to clear the cache');
console.log('=======================================\n');

// Read the current component content
const componentContent = fs.readFileSync(componentPath, 'utf8');

// Check if the component already has the cache bypass
if (componentContent.includes('bypassCache')) {
  console.log('SonarDigest component already has cache bypass. No changes needed.');
} else {
  // Update the component to bypass cache
  const updatedContent = componentContent.replace(
    /const fetchDigest = async \(\) => {/,
    `const fetchDigest = async () => {
    // Add a timestamp to bypass cache
    const bypassCache = new Date().getTime();`
  ).replace(
    /const response = await fetch\('\/api\/news\/sonar-digest'\);/,
    `const response = await fetch(\`/api/news/sonar-digest?t=\${bypassCache}\`);`
  );

  // Write the updated content back to the file
  fs.writeFileSync(componentPath, updatedContent);
  console.log('✅ SonarDigest component updated to bypass cache');
}

// Create a temporary API route to clear the cache
const tempApiPath = path.join(__dirname, '..', 'src/pages/api/clear-sonar-cache.ts');
fs.writeFileSync(
  tempApiPath,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Clear the sonar-digest.json file
    const sonarDigestPath = path.join(process.cwd(), 'public/data/sonar-digest.json');
    
    if (fs.existsSync(sonarDigestPath)) {
      // Rename the file to create a backup
      const backupPath = path.join(process.cwd(), 'public/data/sonar-digest.backup.json');
      fs.renameSync(sonarDigestPath, backupPath);
      console.log('Sonar digest file backed up to:', backupPath);
    }
    
    // Create a simple HTML page to clear localStorage
    const htmlPath = path.join(process.cwd(), 'public/clear-sonar-cache.html');
    fs.writeFileSync(
      htmlPath,
      \`
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
    }
    .success {
      color: green;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      font-size: 16px;
      margin: 10px 0;
      cursor: pointer;
      border: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Clear Sonar Cache</h1>
  <p>This page will clear the Sonar digest cache from your browser's localStorage.</p>
  <button id="clearButton" class="button">Clear Cache</button>
  <p id="status"></p>
  
  <script>
    document.getElementById('clearButton').addEventListener('click', function() {
      // Clear the Sonar digest from localStorage
      localStorage.removeItem('sonarDigest');
      localStorage.removeItem('sonarDigestTimestamp');
      
      // Also clear any twitter-enhanced version
      localStorage.removeItem('sonarDigestTwitterEnhanced');
      localStorage.removeItem('sonarDigestTwitterEnhancedTimestamp');
      
      document.getElementById('status').innerHTML = '<span class="success">Cache cleared successfully!</span> <a href="/news/sonar-digest" class="button">View Sonar Digest</a>';
    });
  </script>
</body>
</html>
      \`
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Sonar digest cache cleared',
      clearCachePage: '/clear-sonar-cache.html'
    });
  } catch (error) {
    console.error('Error clearing Sonar digest cache:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

console.log('✅ Temporary API route created to clear the cache');

// Create a shell script to run the server and open the clear cache page
const shellScriptPath = path.join(__dirname, '..', 'clear-sonar-cache.sh');
fs.writeFileSync(
  shellScriptPath,
  `#!/bin/bash

# This script clears the Sonar digest cache and opens the clear cache page

# Set the terminal title
echo -e "\\033]0;Clear Sonar Cache\\007"

# Print banner
echo "====================================================="
echo "  CLEAR SONAR CACHE"
echo "====================================================="
echo "This script will:"
echo "1. Start the development server"
echo "2. Open the clear cache page"
echo "3. Regenerate the Sonar digest with real news"
echo "====================================================="
echo ""

# Start the development server in the background
echo "Starting development server..."
npm run dev &

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 10

# Open the clear cache page
echo "Opening clear cache page..."
open http://localhost:3004/clear-sonar-cache.html

# Wait for user to clear the cache
echo ""
echo "Please click the 'Clear Cache' button on the page that opened."
echo "Then click 'View Sonar Digest' to see the updated digest."
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo "====================================================="

# Wait for the user to stop the script
wait
`
);

// Make the shell script executable
fs.chmodSync(shellScriptPath, '755');

console.log('✅ Shell script created to clear the cache');

console.log('\n=== SONAR DIGEST CACHE CLEARING SETUP COMPLETE ===');
console.log('You can now run the following command to clear the cache:');
console.log('./clear-sonar-cache.sh');
console.log('=======================================');