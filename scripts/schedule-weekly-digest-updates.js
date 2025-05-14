#!/usr/bin/env node

/**
 * This script schedules weekly updates of both the Sonar Digest and Grok Digest.
 * It calculates the time until next Monday at 9:00 AM and schedules the updates.
 * 
 * Run with: node scripts/schedule-weekly-digest-updates.js
 * Run immediately: node scripts/schedule-weekly-digest-updates.js --run-now
 * Run as cron job: 0 9 * * 1 /usr/bin/node /path/to/schedule-weekly-digest-updates.js --run-once >> /path/to/logs/digest-updates.log 2>&1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const runNow = process.argv.includes('--run-now');
const runOnce = process.argv.includes('--run-once');

// Function to calculate milliseconds until next Monday at 9:00 AM
function getMillisecondsUntilNextMonday() {
  const now = new Date();
  const nextMonday = new Date(now);
  
  // Set to next Monday
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
  
  // Set to 9:00 AM
  nextMonday.setHours(9, 0, 0, 0);
  
  // If it's already past 9:00 AM on Monday, go to next week
  if (now > nextMonday) {
    nextMonday.setDate(nextMonday.getDate() + 7);
  }
  
  return nextMonday.getTime() - now.getTime();
}

// Function to format milliseconds as a human-readable duration
function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${seconds % 60} seconds`;
}

// Function to update the Sonar Digest
function updateSonarDigest() {
  console.log('=== UPDATING SONAR DIGEST ===');
  console.log(`Starting Sonar Digest update at: ${new Date().toLocaleString()}`);
  
  try {
    // Step 1: Generate the regular Sonar digest
    console.log('Step 1: Generating regular Sonar digest...');
    execSync('node scripts/generate-sonar-digest.mjs', { stdio: 'inherit' });
    
    // Step 2: Fetch the latest social media data using Grok API
    console.log('Step 2: Fetching latest social media data using Grok API...');
    execSync('node scripts/fetch-grok-social-data.js', { stdio: 'inherit' });
    
    // Step 3: Generate the Twitter-enhanced Sonar digest
    console.log('Step 3: Generating Twitter-enhanced Sonar digest...');
    execSync('node scripts/generate-twitter-enhanced-sonar-digest.mjs', { stdio: 'inherit' });
    
    // Step 4: Update the timestamp file
    const timestampFile = path.join(__dirname, '..', 'public', 'data', 'sonar-digest-last-update.json');
    fs.writeFileSync(timestampFile, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      status: 'success',
      nextScheduledUpdate: new Date(Date.now() + getMillisecondsUntilNextMonday()).toISOString()
    }, null, 2));
    
    console.log('✅ Sonar Digest update completed successfully');
  } catch (error) {
    console.error('❌ Error during Sonar Digest update:', error);
  }
}
// Function to update the Grok Digest
function updateGrokDigest() {
  console.log('=== UPDATING GROK DIGEST ===');
  console.log(`Starting Grok Digest update at: ${new Date().toLocaleString()}`);
  
  try {
    // Run the Grok digest generation script
    console.log('Generating Grok digest...');
    execSync('node scripts/generate-grok-digest.js', { stdio: 'inherit' });
    
    // Update the timestamp file
    const timestampFile = path.join(__dirname, '..', 'public', 'data', 'grok-digest-last-update.json');
    fs.writeFileSync(timestampFile, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      status: 'success',
      nextScheduledUpdate: new Date(Date.now() + getMillisecondsUntilNextMonday()).toISOString()
    }, null, 2));
    
    console.log('✅ Grok Digest update completed successfully');
  } catch (error) {
    console.error('❌ Error during Grok Digest update:', error);
  }
}

// Function to run all updates
function runUpdates() {
  console.log('=== WEEKLY DIGEST UPDATES ===');
  console.log(`Running updates at: ${new Date().toLocaleString()}`);
  
  // Update Sonar Digest
  updateSonarDigest();
  
  // Update Grok Digest
  updateGrokDigest();
  
  console.log(`All updates completed at: ${new Date().toLocaleString()}`);
  
  // If not running once, schedule the next update
  if (!runOnce) {
    scheduleNextUpdate();
  }
}

// Function to schedule the next update
function scheduleNextUpdate() {
  const milliseconds = getMillisecondsUntilNextMonday();
  const nextUpdateDate = new Date(Date.now() + milliseconds);
  
  console.log(`Next update scheduled for: ${nextUpdateDate.toLocaleString()}`);
  console.log(`Time until next update: ${formatDuration(milliseconds)}`);
  
  // Schedule the next update
  setTimeout(runUpdates, milliseconds);
}

// Main function
function main() {
  console.log('=== DIGEST WEEKLY SCHEDULER ===');
  console.log('This script schedules weekly updates of both the Sonar Digest and Grok Digest.');
  console.log('Updates will run every Monday at 9:00 AM.');
  console.log('==========================================');
  
  // Check if we should run immediately
  if (runNow) {
    console.log('Running updates immediately...');
    runUpdates();
  } else if (runOnce) {
    console.log('Running updates once...');
    runUpdates();
    // Exit after running once (for cron jobs)
    console.log('Update completed. Exiting...');
  } else {
    // Schedule the next update
    scheduleNextUpdate();
    
    // Keep the process running
    console.log('Scheduler is running. Press Ctrl+C to stop.');
    console.log('To run this in the background, use: nohup node scripts/schedule-weekly-digest-updates.js &');
    console.log('To run as a cron job, use: 0 9 * * 1 /usr/bin/node /path/to/schedule-weekly-digest-updates.js --run-once');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Scheduler stopped. Exiting...');
  process.exit(0);
});

// Run the main function
main();