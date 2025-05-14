#!/usr/bin/env node
// scripts/run-news-hub.js
const { exec } = require('child_process');
const path = require('path');

// Get the project root directory
const projectRoot = process.cwd();

// Function to execute a command and log output
function executeCommand(command, description) {
  console.log(`\n🚀 ${description}...\n`);
  
  return new Promise((resolve, reject) => {
    const process = exec(command, { cwd: projectRoot });
    
    process.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    process.on('exit', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${description} completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${description} failed with code ${code}\n`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Main function to run the news hub
async function runNewsHub() {
  try {
    // Check if the development server is already running
    const isServerRunning = await new Promise((resolve) => {
      const testConnection = exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000');
      
      testConnection.on('exit', (code, signal) => {
        const isRunning = code === 0;
        resolve(isRunning);
      });
    });
    
    if (!isServerRunning) {
      console.log('Starting development server in the background...');
      // Start the Next.js development server in the background
      exec('npm run dev &', { cwd: projectRoot });
      
      // Wait for the server to start
      console.log('Waiting for the server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('Development server is already running.');
    }
    
    // Update news scores
    await executeCommand('node scripts/update-news-scores.js', 'Updating news scores');
    
    // Refresh news with alternative sources
    await executeCommand('node scripts/refresh-news-with-alternatives.js', 'Refreshing news with alternative sources');
    
    // Open the media hub in the default browser
    console.log('\n🌐 Opening Media Hub in your browser...\n');
    
    if (process.platform === 'darwin') {
      // macOS
      exec('open http://localhost:3000/media-hub');
    } else if (process.platform === 'win32') {
      // Windows
      exec('start http://localhost:3000/media-hub');
    } else {
      // Linux and others
      exec('xdg-open http://localhost:3000/media-hub');
    }
    
    console.log('\n✨ Done! The Media Hub should now be open in your browser with fresh news content.\n');
    console.log('Press Ctrl+C to exit this script when you\'re done.');
    
  } catch (error) {
    console.error('Error running news hub:', error);
    process.exit(1);
  }
}

// Run the news hub
runNewsHub();