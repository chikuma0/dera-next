#!/usr/bin/env node

/**
 * This script sets up the required API keys for the Grok API and Twitter API.
 * It creates or updates the .env.local file with the necessary environment variables.
 * 
 * Run with: node scripts/setup-api-keys.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const rootDir = path.join(__dirname, '..');
const envFilePath = path.join(rootDir, '.env.local');

console.log('=== SETTING UP API KEYS ===');
console.log('This script will help you set up the required API keys for the Grok API and Twitter API.');
console.log('It will create or update the .env.local file with the necessary environment variables.');
console.log('=======================================\n');

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  try {
    // Read existing .env.local file if it exists
    let envContent = '';
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
      console.log('Found existing .env.local file. Will update with new values.');
    } else {
      console.log('No existing .env.local file found. Will create a new one.');
    }

    // Parse existing environment variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    });

    // Prompt for xAI API key (for Grok)
    const xaiApiKey = await prompt('Enter your xAI API key (for Grok): ');
    envVars['XAI_API_KEY'] = xaiApiKey;

    // Prompt for Perplexity API key
    const perplexityApiKey = await prompt('Enter your Perplexity API key: ');
    envVars['PERPLEXITY_API_KEY'] = perplexityApiKey;

    // Generate .env.local content
    const newEnvContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Write to .env.local file
    fs.writeFileSync(envFilePath, newEnvContent);

    console.log('\n✅ API keys have been set up successfully!');
    console.log(`The following environment variables have been added to ${envFilePath}:`);
    console.log('- XAI_API_KEY (for Grok API)');
    console.log('- PERPLEXITY_API_KEY');

    console.log('\nYou can now run the Grok-powered refresh script to fetch real data:');
    console.log('node scripts/refresh-sonar-with-grok-data.js');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(console.error);