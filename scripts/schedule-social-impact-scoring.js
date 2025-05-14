#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * This script schedules the social impact scoring to run hourly.
 * It uses cron to schedule the job and logs all activities.
 */

// Configuration
const CRON_SCHEDULE = '0 * * * *'; // Run hourly at minute 0
const LOG_FILE = path.join(__dirname, '..', 'logs', 'social-impact-scoring.log');
const LAST_UPDATE_FILE = path.join(__dirname, '..', 'public/data', 'social-impact-last-update.json');

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Function to log messages
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Function to update the last update timestamp
function updateLastUpdateTimestamp() {
  const timestamp = new Date().toISOString();
  const data = {
    last_update: timestamp,
    status: 'success'
  };
  
  fs.writeFileSync(LAST_UPDATE_FILE, JSON.stringify(data, null, 2));
  log(`Updated last update timestamp: ${timestamp}`);
}

// Function to run the social impact scoring
function runSocialImpactScoring() {
  log('Starting social impact scoring...');
  
  // First, refresh the Twitter data
  log('Refreshing Twitter data...');
  exec('node scripts/enhanced-refresh-sonar-with-grok-data.js', (error, stdout, stderr) => {
    if (error) {
      log(`Error refreshing Twitter data: ${error.message}`);
      log(stderr);
      return;
    }
    
    log('Twitter data refreshed successfully');
    log(stdout);
    
    // Then, update the article scores
    log('Updating article scores...');
    exec('node scripts/integrated-social-impact-scoring-cjs.js', (error, stdout, stderr) => {
      if (error) {
        log(`Error updating article scores: ${error.message}`);
        log(stderr);
        return;
      }
      
      log('Article scores updated successfully');
      log(stdout);
      
      // Update the last update timestamp
      updateLastUpdateTimestamp();
      
      log('Social impact scoring completed successfully');
    });
  });
}

// Function to schedule the job
function scheduleJob() {
  log(`Scheduling social impact scoring to run hourly (${CRON_SCHEDULE})`);
  
  // Check if cron is available
  exec('which crontab', (error, stdout, stderr) => {
    if (error) {
      log('Error: crontab not found. Please install cron.');
      log('You can manually run the script with:');
      log('node scripts/integrated-social-impact-scoring-cjs.js');
      return;
    }
    
    // Get the current working directory
    const cwd = process.cwd();
    
    // Create the cron job command
    const cronCommand = `${CRON_SCHEDULE} cd ${cwd} && node scripts/integrated-social-impact-scoring-cjs.js >> ${LOG_FILE} 2>&1`;
    
    // Add the cron job
    exec(`(crontab -l 2>/dev/null || echo "") | grep -v "integrated-social-impact-scoring-cjs.js" | { cat; echo "${cronCommand}"; } | crontab -`, (error, stdout, stderr) => {
      if (error) {
        log(`Error scheduling cron job: ${error.message}`);
        log(stderr);
        return;
      }
      
      log('Cron job scheduled successfully');
      log('You can check the cron jobs with: crontab -l');
      
      // Run the job immediately
      log('Running the job immediately for the first time...');
      runSocialImpactScoring();
    });
  });
}

// Main function
function main() {
  log('=== SOCIAL IMPACT SCORING SCHEDULER ===');
  
  // Check if the script is being run with the --run flag
  if (process.argv.includes('--run')) {
    log('Running social impact scoring immediately...');
    runSocialImpactScoring();
    return;
  }
  
  // Schedule the job
  scheduleJob();
}

// Run the main function
main();