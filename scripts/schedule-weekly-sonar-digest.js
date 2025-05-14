// scripts/schedule-weekly-sonar-digest.js
const { exec } = require('child_process');
const path = require('path');

/**
 * This script is designed to be run as a cron job to generate the weekly Sonar digest
 * Example cron entry (runs every Monday at 1:00 AM):
 * 0 1 * * 1 /usr/bin/node /path/to/schedule-weekly-sonar-digest.js >> /path/to/logs/sonar-digest.log 2>&1
 */

console.log('=== Weekly Sonar Digest Generation ===');
console.log(`Started at: ${new Date().toISOString()}`);

// Get the path to the generate-weekly-sonar-digest.js script
const scriptPath = path.join(__dirname, 'generate-weekly-sonar-digest.js');

// Execute the script
exec(`node ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing script: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`Script stderr: ${stderr}`);
  }
  
  console.log(`Script output: ${stdout}`);
  console.log(`Completed at: ${new Date().toISOString()}`);
  console.log('=== Weekly Sonar Digest Generation Complete ===');
});