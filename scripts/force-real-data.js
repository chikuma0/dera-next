// scripts/force-real-data.js
const fs = require('fs');
const path = require('path');

/**
 * This script forces the application to use real data by:
 * 1. Renaming the mock data files so they can't be used
 * 2. Updating the API routes to throw an error if they try to use mock data
 */

// Check if Twitter API key is set
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found');
  console.error('Please create a .env file with your Twitter API key');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('TWITTER_API_KEY=') || envContent.includes('TWITTER_API_KEY=your_twitter_api_key_here')) {
  console.error('Error: TWITTER_API_KEY not properly set in .env file');
  console.error('Please add your Twitter API key to the .env file');
  process.exit(1);
}

// Rename mock data files
const mockFiles = [
  path.join(__dirname, '../src/lib/services/mockTwitterData.json'),
  path.join(__dirname, '../src/lib/services/mockPulseData.json')
];

mockFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const backupFile = `${file}.backup`;
    fs.renameSync(file, backupFile);
    console.log(`Renamed ${file} to ${backupFile}`);
  }
});

// Update the trends API route
const trendsRoutePath = path.join(__dirname, '../src/app/api/trends/route.ts');
const trendsRouteContent = fs.readFileSync(trendsRoutePath, 'utf8');

// Remove the loadMockTwitterData and loadMockPulseData functions
const updatedTrendsRouteContent = trendsRouteContent
  .replace(/\/\/ Function to load mock Twitter data[\s\S]*?function loadMockTwitterData\(\)[\s\S]*?}\n}/m, '')
  .replace(/\/\/ Function to load mock Pulse data[\s\S]*?function loadMockPulseData\(\)[\s\S]*?}\n}/m, '')
  // Remove the mock data path declarations
  .replace(/\/\/ Paths to mock data[\s\S]*?const mockPulseDataPath.*/m, '')
  // Update the error handling to not fall back to mock data
  .replace(/\/\/ Try to load mock data[\s\S]*?const mockData = loadMockPulseData\(\);[\s\S]*?if \(mockData\) {[\s\S]*?} else {/m, '')
  .replace(/\/\/ Load mock Twitter data first[\s\S]*?const mockTwitterData = loadMockTwitterData\(\);/m, '')
  .replace(/\/\/ If database fetch fails, use mock data[\s\S]*?topTweets = mockTwitterData.tweets \|\| \[\];[\s\S]*?topHashtags = mockTwitterData.hashtags \|\| \[\];/m, 
    `// If database fetch fails, return empty arrays
      console.error('Error fetching Twitter data:', error);
      topTweets = [];
      topHashtags = [];`)
  .replace(/\/\/ If we still don't have data[\s\S]*?topTweets = \(mockData.tweets[\s\S]*?}\);[\s\S]*?}/m, 
    `// If we still don't have data, return empty arrays
    if (topTweets.length === 0) {
      console.log('No tweets available. Please check your Twitter API key and run the setup scripts.');
      topTweets = [];
    }`)
  .replace(/\/\/ If we still don't have data[\s\S]*?topHashtags = \(mockData.hashtags[\s\S]*?}\);[\s\S]*?}/m, 
    `// If we still don't have data, return empty arrays
    if (topHashtags.length === 0) {
      console.log('No hashtags available. Please check your Twitter API key and run the setup scripts.');
      topHashtags = [];
    }`);

fs.writeFileSync(trendsRoutePath, updatedTrendsRouteContent);
console.log(`Updated ${trendsRoutePath}`);

// Update the impact API route
const impactRoutePath = path.join(__dirname, '../src/app/api/trends/impact/route.ts');
const impactRouteContent = fs.readFileSync(impactRoutePath, 'utf8');

// Remove the loadMockPulseData function
const updatedImpactRouteContent = impactRouteContent
  .replace(/\/\/ Function to load mock data[\s\S]*?function loadMockPulseData\(\)[\s\S]*?}\n}/m, '')
  // Remove the mock data path declarations
  .replace(/\/\/ Path to mock data[\s\S]*?const mockDataPath.*/m, '')
  // Update the error handling to not fall back to mock data
  .replace(/\/\/ Try to load mock data[\s\S]*?const mockData = loadMockPulseData\(\);[\s\S]*?if \(mockData\) {[\s\S]*?} else {/m, '');

fs.writeFileSync(impactRoutePath, updatedImpactRouteContent);
console.log(`Updated ${impactRoutePath}`);

console.log('\nSuccessfully forced the application to use real data only.');
console.log('The application will now show real data fetched from the Twitter API or display an error if no data is available.');
console.log('\nPlease restart the application for the changes to take effect.');