w// scripts/setup-twitter-integration.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for Twitter API key
function promptForApiKey() {
  return new Promise((resolve) => {
    rl.question('Enter your Twitter API key: ', (apiKey) => {
      resolve(apiKey.trim());
    });
  });
}

// Function to update .env file with Twitter API key
function updateEnvFile(apiKey) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Check if TWITTER_API_KEY already exists
  if (envContent.includes('TWITTER_API_KEY=')) {
    // Replace existing key
    envContent = envContent.replace(/TWITTER_API_KEY=.*/g, `TWITTER_API_KEY=${apiKey}`);
  } else {
    // Add new key
    envContent += `\nTWITTER_API_KEY=${apiKey}\n`;
  }
  
  // Write updated content back to .env file
  fs.writeFileSync(envPath, envContent);
  console.log('Updated .env file with Twitter API key');
}

// Main function
async function main() {
  console.log('Setting up Twitter integration for DERA Pulse...');
  
  try {
    // Step 1: Apply the migration
    console.log('\n1. Applying database migration...');
    execSync('node scripts/apply-migration.js supabase/migrations/006_twitter_integration.sql', { stdio: 'inherit' });
    console.log('Migration applied successfully!');
    
    // Step 2: Prompt for Twitter API key
    console.log('\n2. Setting up Twitter API access...');
    console.log('To use the Twitter integration, you need a Twitter API key.');
    console.log('You can obtain one by creating a developer account at https://developer.twitter.com/');
    
    const apiKey = await promptForApiKey();
    if (apiKey) {
      updateEnvFile(apiKey);
    } else {
      console.log('No API key provided. You can add it later to the .env file.');
    }
    
    // Step 3: Add sample data
    console.log('\n3. Adding sample Twitter data...');
    execSync('node scripts/add-twitter-integration.js', { stdio: 'inherit' });
    console.log('Sample data added successfully!');
    
    console.log('\nTwitter integration setup complete!');
    console.log('You can now access the AI Trends dashboard at: http://localhost:3000/trends');
    
  } catch (error) {
    console.error('Error setting up Twitter integration:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(console.error);