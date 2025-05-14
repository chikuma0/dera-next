#!/usr/bin/env node

/**
 * This script helps set up the environment variables for the application.
 * It reads the .env.local file and prompts the user to fill in any missing values.
 * 
 * Run with: node scripts/setup-env-keys.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env.local file
const envPath = path.join(__dirname, '..', '.env.local');

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to read .env.local file
function readEnvFile() {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading .env.local file:', error);
    process.exit(1);
  }
}

// Function to write .env.local file
function writeEnvFile(content) {
  try {
    fs.writeFileSync(envPath, content);
    console.log('✅ .env.local file updated successfully');
  } catch (error) {
    console.error('Error writing .env.local file:', error);
    process.exit(1);
  }
}

// Function to check if a key is empty
function isKeyEmpty(content, key) {
  const regex = new RegExp(`^${key}=(.*)$`, 'm');
  const match = content.match(regex);
  return !match || match[1].trim() === '';
}

// Function to update a key in the .env.local file
function updateKey(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return `${content}\n${key}=${value}`;
  }
}

// Main function
async function main() {
  console.log('=== ENVIRONMENT SETUP ===');
  console.log('This script will help you set up the environment variables for the application.');
  console.log('It will prompt you to fill in any missing values in the .env.local file.');
  console.log('==========================================');
  
  // Read .env.local file
  let content = readEnvFile();
  
  // Check for missing Supabase keys
  if (isKeyEmpty(content, 'NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('\n=== Supabase Configuration ===');
    console.log('Supabase URL is missing. You can find this in your Supabase project settings.');
    const supabaseUrl = await prompt('Enter your Supabase URL: ');
    content = updateKey(content, 'NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
  }
  
  if (isKeyEmpty(content, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('\nSupabase Anon Key is missing. You can find this in your Supabase project settings.');
    const supabaseAnonKey = await prompt('Enter your Supabase Anon Key: ');
    content = updateKey(content, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);
  }
  
  if (isKeyEmpty(content, 'SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('\nSupabase Service Role Key is missing. You can find this in your Supabase project settings.');
    const supabaseServiceRoleKey = await prompt('Enter your Supabase Service Role Key: ');
    content = updateKey(content, 'SUPABASE_SERVICE_ROLE_KEY', supabaseServiceRoleKey);
  }
  
  // Check for other missing keys
  if (isKeyEmpty(content, 'NEXT_PUBLIC_BASE_URL')) {
    console.log('\n=== Next.js Configuration ===');
    console.log('Base URL is missing. This is the URL where your application is running.');
    const baseUrl = await prompt('Enter your Base URL (default: http://localhost:3003): ') || 'http://localhost:3003';
    content = updateKey(content, 'NEXT_PUBLIC_BASE_URL', baseUrl);
  }
  
  // Write updated content to .env.local file
  writeEnvFile(content);
  
  console.log('\n✅ Environment setup completed successfully');
  console.log('You can now run the application with:');
  console.log('npm run dev');
  console.log('\nOr run the weekly digest scheduler with:');
  console.log('node scripts/schedule-weekly-digest-updates.js --run-now');
  
  // Close readline interface
  rl.close();
}

// Run the main function
main();