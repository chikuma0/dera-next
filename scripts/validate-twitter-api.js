// scripts/validate-twitter-api.js
const axios = require('axios');
require('dotenv').config();

/**
 * This script validates the Twitter API key by making a test request
 * to the Twitter API.
 */

async function validateTwitterAPI() {
  console.log('Validating Twitter API connection...');
  
  // Check if Twitter API key is set
  const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
  if (!TWITTER_API_KEY) {
    console.error('Error: TWITTER_API_KEY not set in .env file');
    console.error('Please add your Twitter API key to the .env file');
    return false;
  }
  
  console.log(`API Key found: ${TWITTER_API_KEY.substring(0, 4)}...${TWITTER_API_KEY.substring(TWITTER_API_KEY.length - 4)}`);
  console.log(`API Key length: ${TWITTER_API_KEY.length} characters`);
  
  // A valid Twitter API Bearer token is typically much longer (around 100+ characters)
  if (TWITTER_API_KEY.length < 50) {
    console.error('Warning: The API key looks too short to be a valid Twitter API Bearer token');
    console.error('Twitter API Bearer tokens are typically 100+ characters long');
  }
  
  try {
    // Make a simple request to the Twitter API
    console.log('Making test request to Twitter API...');
    const response = await axios.get(
      'https://api.twitter.com/2/tweets/search/recent?query=test&max_results=10',
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      console.log('✅ Twitter API connection successful!');
      console.log(`Received ${response.data.meta?.result_count || 0} tweets in response`);
      return true;
    } else {
      console.error(`❌ Twitter API returned status code: ${response.status}`);
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error connecting to Twitter API:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status code: ${error.response.status}`);
      console.error(`Status text: ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\nAuthentication Error:');
        console.error('Your Twitter API key is invalid or does not have the necessary permissions.');
        console.error('Please check the following:');
        console.error('1. Make sure you have a valid Twitter API Bearer token (not a consumer key)');
        console.error('2. The token has the necessary permissions to search tweets');
        console.error('3. The token has not expired');
        console.error('\nYou can get a valid token from the Twitter Developer Portal:');
        console.error('https://developer.twitter.com/en/portal/dashboard');
      } else if (error.response.status === 403) {
        console.error('\nAuthorization Error:');
        console.error('Your Twitter API key does not have permission to perform this action.');
      } else if (error.response.status === 429) {
        console.error('\nRate Limit Error:');
        console.error('You have exceeded the Twitter API rate limits.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Twitter API');
      console.error('This could be due to network issues or the Twitter API being down');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    return false;
  }
}

// Run the validation
validateTwitterAPI()
  .then(isValid => {
    if (!isValid) {
      console.log('\nSince the Twitter API connection failed, the application will use mock data.');
      console.log('To use real Twitter data, please update your .env file with a valid Twitter API key.');
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
  });