#!/usr/bin/env node

/**
 * This script updates the sonar-digest-last-update.json file with the current timestamp.
 * This helps the SonarDigest component determine when to refresh its cache.
 * 
 * Run with: node scripts/update-sonar-digest-timestamp.js
 */

const fs = require('fs');
const path = require('path');

// Get the current timestamp
const now = new Date();

// Create the timestamp data
const timestampData = {
  lastUpdated: now.toISOString(),
  status: 'success'
};

// Path to the timestamp file
const timestampFilePath = path.join(__dirname, '..', 'public/data/sonar-digest-last-update.json');

// Create the directory if it doesn't exist
const dir = path.dirname(timestampFilePath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write the timestamp data to the file
fs.writeFileSync(timestampFilePath, JSON.stringify(timestampData, null, 2));

console.log(`Updated sonar-digest-last-update.json with timestamp: ${now.toISOString()}`);