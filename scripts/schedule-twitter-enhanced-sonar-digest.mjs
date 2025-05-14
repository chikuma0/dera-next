#!/usr/bin/env node

/**
 * This script schedules the generation of the Twitter-enhanced Sonar digest
 * on a weekly basis. It first generates the regular Sonar digest, then
 * enhances it with Twitter data.
 * 
 * Run with: node scripts/schedule-twitter-enhanced-sonar-digest.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function main() {
  try {
    console.log('Scheduling Twitter-enhanced Sonar digest generation...');
    
    // Calculate the time until next Monday at 9:00 AM
    const now = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7)); // Next Monday
    nextMonday.setHours(9, 0, 0, 0); // 9:00 AM
    
    if (nextMonday <= now) {
      // If it's already past Monday 9:00 AM, schedule for next week
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    
    const timeUntilNextMonday = nextMonday.getTime() - now.getTime();
    const hoursUntilNextMonday = Math.floor(timeUntilNextMonday / (1000 * 60 * 60));
    const minutesUntilNextMonday = Math.floor((timeUntilNextMonday % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(`Next scheduled run: ${nextMonday.toLocaleString()}`);
    console.log(`Time until next run: ${hoursUntilNextMonday} hours and ${minutesUntilNextMonday} minutes`);
    
    // If the --run-now flag is provided, run immediately
    if (process.argv.includes('--run-now')) {
      console.log('Running immediately due to --run-now flag...');
      await runGeneration();
    }
    
    // Schedule the next run
    setTimeout(async () => {
      await runGeneration();
      
      // After running, schedule the next run for the following week
      setInterval(runGeneration, 7 * 24 * 60 * 60 * 1000); // Every 7 days
    }, timeUntilNextMonday);
    
    console.log('Scheduler is running. Keep this process alive to maintain the schedule.');
    console.log('Press Ctrl+C to exit.');
    
  } catch (error) {
    console.error('Error scheduling Twitter-enhanced Sonar digest generation:', error);
    process.exit(1);
  }
}

async function runGeneration() {
  try {
    const startTime = new Date();
    console.log(`Starting Twitter-enhanced Sonar digest generation at ${startTime.toLocaleString()}...`);
    
    // Step 1: Generate the regular Sonar digest
    console.log('Step 1: Generating regular Sonar digest...');
    await execAsync('node scripts/generate-sonar-digest.mjs');
    
    // Step 2: Fetch the latest Twitter data
    console.log('Step 2: Fetching latest Twitter data...');
    await execAsync('node scripts/fetch-real-twitter-data.js');
    
    // Step 3: Generate the Twitter-enhanced Sonar digest
    console.log('Step 3: Generating Twitter-enhanced Sonar digest...');
    await execAsync('node scripts/generate-twitter-enhanced-sonar-digest.mjs');
    
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`Twitter-enhanced Sonar digest generation completed at ${endTime.toLocaleString()} (duration: ${duration} seconds)`);
    
    // Log the next scheduled run
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 7); // 7 days from now
    console.log(`Next scheduled run: ${nextRun.toLocaleString()}`);
    
  } catch (error) {
    console.error('Error during Twitter-enhanced Sonar digest generation:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Scheduler stopped. Exiting...');
  process.exit(0);
});

main();