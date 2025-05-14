#!/usr/bin/env node

/**
 * This script schedules weekly updates of the Sonar Digest with Grok data.
 * It calculates the time until next Monday at 9:00 AM and schedules the update.
 * 
 * Run with: node scripts/schedule-weekly-sonar-grok-update.js
 * Run immediately: node scripts/schedule-weekly-sonar-grok-update.js --run-now
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we should run immediately
const runNow = process.argv.includes('--run-now');

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

// Function to run the update
function runUpdate() {
  console.log('=== WEEKLY SONAR DIGEST UPDATE ===');
  console.log(`Running update at: ${new Date().toLocaleString()}`);
  
  try {
    // Run the refresh script
    console.log('Running Grok-powered Sonar Digest refresh...');
    execSync('node scripts/refresh-sonar-with-grok-data.js', { stdio: 'inherit' });
    console.log('✅ Sonar Digest refresh completed successfully');
    
    // Create a timestamp file to record the last update
    const timestampFile = path.join(__dirname, '..', 'public', 'data', 'sonar-digest-last-update.json');
    fs.writeFileSync(timestampFile, JSON.stringify({
      lastUpdate: new Date().toISOString(),
      nextScheduledUpdate: new Date(Date.now() + getMillisecondsUntilNextMonday()).toISOString()
    }, null, 2));
    
    console.log('✅ Update timestamp recorded');
  } catch (error) {
    console.error('❌ Error during update:', error);
  }
  
  // Schedule the next update
  scheduleNextUpdate();
}

// Function to schedule the next update
function scheduleNextUpdate() {
  const milliseconds = getMillisecondsUntilNextMonday();
  const nextUpdateDate = new Date(Date.now() + milliseconds);
  
  console.log(`Next update scheduled for: ${nextUpdateDate.toLocaleString()}`);
  console.log(`Time until next update: ${formatDuration(milliseconds)}`);
  
  // Schedule the next update
  setTimeout(runUpdate, milliseconds);
}

// Main function
function main() {
  console.log('=== SONAR DIGEST WEEKLY SCHEDULER ===');
  console.log('This script schedules weekly updates of the Sonar Digest with Grok data.');
  console.log('Updates will run every Monday at 9:00 AM.');
  console.log('==========================================');
  
  // Check if we should run immediately
  if (runNow) {
    console.log('Running update immediately...');
    runUpdate();
  } else {
    // Schedule the next update
    scheduleNextUpdate();
  }
  
  // Keep the process running
  console.log('Scheduler is running. Press Ctrl+C to stop.');
  console.log('To run this in the background, use: nohup node scripts/schedule-weekly-sonar-grok-update.js &');
}

// Run the main function
main();