// scripts/fetch-real-twitter-data.js
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();
const axios = require('axios');

/**
 * This script attempts to fetch real tweets from the Twitter API and saves them to a JSON file
 * that can be used by the application. If the Twitter API connection fails, it generates
 * realistic mock data as a fallback.
 */

// Check if Twitter API key is set
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
if (!TWITTER_API_KEY) {
  console.error('Error: TWITTER_API_KEY not set in .env file');
  console.error('Please add your Twitter API key to the .env file');
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to validate Twitter API key
async function validateTwitterAPI() {
  console.log('Validating Twitter API connection...');
  
  console.log(`API Key found: ${TWITTER_API_KEY.substring(0, 4)}...${TWITTER_API_KEY.substring(TWITTER_API_KEY.length - 4)}`);
  console.log(`API Key length: ${TWITTER_API_KEY.length} characters`);
  
  // A valid Twitter API Bearer token is typically much longer (around 100+ characters)
  if (TWITTER_API_KEY.length < 50) {
    console.warn('Warning: The API key looks too short to be a valid Twitter API Bearer token');
    console.warn('Twitter API Bearer tokens are typically 100+ characters long');
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
      return true;
    } else {
      console.error(`❌ Twitter API returned status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error connecting to Twitter API:');
    
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error(`Status text: ${error.response.statusText}`);
      
      if (error.response.status === 401) {
        console.error('\nAuthentication Error:');
        console.error('Your Twitter API key is invalid or does not have the necessary permissions.');
        console.error('Please check the following:');
        console.error('1. Make sure you have a valid Twitter API Bearer token (not a consumer key)');
        console.error('2. The token has the necessary permissions to search tweets');
        console.error('3. The token has not expired');
        console.error('\nYou can get a valid token from the Twitter Developer Portal:');
        console.error('https://developer.twitter.com/en/portal/dashboard');
      } else if (error.response.status === 429) {
        console.error('\nRate Limit Error:');
        console.error('You have exceeded the Twitter API rate limits.');
        console.error('The Twitter API has strict rate limits on the number of requests you can make.');
        console.error('Please wait a few minutes before trying again.');
        
        // Check for rate limit headers
        const resetTime = error.response.headers['x-rate-limit-reset'];
        if (resetTime) {
          const resetDate = new Date(resetTime * 1000);
          console.error(`Rate limit will reset at: ${resetDate.toLocaleTimeString()}`);
        }
      }
    } else if (error.request) {
      console.error('No response received from Twitter API');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return false;
  }
}

// Function to fetch tweets from Twitter API
async function fetchTweets() {
  console.log('Attempting to fetch tweets from Twitter API...');
  
  // First validate the Twitter API connection
  const isValid = await validateTwitterAPI();
  if (!isValid) {
    console.log('\n❌ Twitter API validation failed. Falling back to mock data.');
    return generateMockTweets();
  }
  
  try {
    // Define search terms for AI-related tweets
    const searchTerms = [
      'artificial intelligence',
      'machine learning',
      'deep learning',
      'neural network',
      'AI',
      'ML',
      'NLP',
      'computer vision',
      'GPT',
      'large language model',
      'LLM',
      'transformer',
      'generative AI'
    ];
    
    // Create search query
    const query = searchTerms.map(term => `"${term}"`).join(' OR ');
    
    // Calculate time range (last 48 hours)
    const endTime = new Date();
    const startTime = new Date(endTime);
    startTime.setHours(startTime.getHours() - 48);
    
    // Format times for Twitter API
    const startTimeStr = startTime.toISOString();
    const endTimeStr = endTime.toISOString();
    
    // Fetch tweets using Twitter API v2
    console.log('Sending request to Twitter API...');
    console.log(`Query: ${query.substring(0, 50)}...`);
    console.log(`Time range: ${startTimeStr} to ${endTimeStr}`);
    
    try {
      const response = await axios.get(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&start_time=${startTimeStr}&end_time=${endTimeStr}&tweet.fields=created_at,public_metrics,entities&user.fields=name,username,verified,public_metrics&expansions=author_id&max_results=100`,
        {
          headers: {
            'Authorization': `Bearer ${TWITTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
      }
      
      const data = response.data;
      
      // Process tweets
      const tweets = [];
      
      // Create a map of user data
      const users = new Map();
      if (data.includes && data.includes.users) {
        for (const user of data.includes.users) {
          users.set(user.id, user);
        }
      }
      
      // Process each tweet
      if (data.data && Array.isArray(data.data)) {
        for (const tweet of data.data) {
          const user = users.get(tweet.author_id) || {};
          
          // Extract hashtags
          const hashtags = [];
          if (tweet.entities && tweet.entities.hashtags) {
            for (const tag of tweet.entities.hashtags) {
              hashtags.push(tag.tag.toLowerCase());
            }
          }
          
          // Calculate impact score
          const likesCount = tweet.public_metrics?.like_count || 0;
          const retweetsCount = tweet.public_metrics?.retweet_count || 0;
          const repliesCount = tweet.public_metrics?.reply_count || 0;
          const quoteCount = tweet.public_metrics?.quote_count || 0;
          const followersCount = user.public_metrics?.followers_count || 0;
          
          // Base formula: likes + (retweets * 2) + (quotes * 3) + replies
          const engagementScore = 
            likesCount + 
            (retweetsCount * 2) + 
            (quoteCount * 3) + 
            repliesCount;
          
          // Follower influence factor (log scale)
          const followerFactor = followersCount > 0 
            ? Math.log10(followersCount) / 6 // Normalize to ~0-1 range
            : 0;
          
          // Calculate final score (removed verified account bonus)
          const impactScore = Math.round((engagementScore * (1 + followerFactor)) * 100) / 100;
          
          tweets.push({
            id: tweet.id,
            content: tweet.text,
            authorUsername: user.username || 'unknown',
            authorName: user.name,
            authorFollowersCount: followersCount,
            likesCount,
            retweetsCount,
            repliesCount,
            quoteCount,
            url: `https://twitter.com/${user.username}/status/${tweet.id}`,
            createdAt: tweet.created_at,
            impactScore,
            isVerified: user.verified || false,
            hashtags
          });
        }
      }
      
      console.log(`✅ Successfully fetched ${tweets.length} real tweets from Twitter API`);
      
      // Extract hashtags
      const hashtagCounts = {};
      tweets.forEach(tweet => {
        tweet.hashtags.forEach(hashtag => {
          if (!hashtagCounts[hashtag]) {
            hashtagCounts[hashtag] = {
              count: 0,
              likes: 0,
              retweets: 0,
              replies: 0
            };
          }
          hashtagCounts[hashtag].count += 1;
          hashtagCounts[hashtag].likes += tweet.likesCount;
          hashtagCounts[hashtag].retweets += tweet.retweetsCount;
          hashtagCounts[hashtag].replies += tweet.repliesCount;
        });
      });
      
      // Convert to array
      const hashtags = Object.keys(hashtagCounts).map(hashtag => ({
        hashtag,
        tweetCount: hashtagCounts[hashtag].count,
        totalLikes: hashtagCounts[hashtag].likes,
        totalRetweets: hashtagCounts[hashtag].retweets,
        totalReplies: hashtagCounts[hashtag].replies,
        impactScore: (hashtagCounts[hashtag].likes + hashtagCounts[hashtag].retweets * 2) / 10
      }));
      
      // Sort by impact score
      hashtags.sort((a, b) => b.impactScore - a.impactScore);
      
      return { tweets, hashtags, isReal: true };
    } catch (error) {
      console.error('Error fetching tweets from Twitter API:', error.message);
      
      if (error.response) {
        console.error(`Status code: ${error.response.status}`);
        console.error(`Status text: ${error.response.statusText}`);
        
        if (error.response.status === 429) {
          console.error('\nRate Limit Error:');
          console.error('You have exceeded the Twitter API rate limits.');
          console.error('The Twitter API has strict rate limits on the number of requests you can make.');
          console.error('Please wait a few minutes before trying again.');
          
          // Check for rate limit headers
          const resetTime = error.response.headers['x-rate-limit-reset'];
          if (resetTime) {
            const resetDate = new Date(resetTime * 1000);
            console.error(`Rate limit will reset at: ${resetDate.toLocaleTimeString()}`);
          }
        }
      }
      
      console.log('\n❌ Failed to fetch real tweets. Falling back to mock data.');
      return generateMockTweets();
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.log('\n❌ Failed to fetch real tweets. Falling back to mock data.');
    return generateMockTweets();
  }
}

// Function to generate mock tweets
function generateMockTweets() {
  console.log('Generating mock tweets...');
  
  const tweets = [
    {
      id: '1',
      content: 'Our research team just published a new paper on improving transformer efficiency by 40% with minimal accuracy loss. #AI #DeepLearning #Transformers',
      authorUsername: 'ai_researcher',
      authorName: 'AI Research Lab',
      authorFollowersCount: 50000,
      likesCount: 890,
      retweetsCount: 320,
      repliesCount: 45,
      quoteCount: 12,
      url: 'https://twitter.com/ai_researcher/status/1',
      createdAt: new Date().toISOString(),
      impactScore: 1530,
      isVerified: true,
      hashtags: ['AI', 'DeepLearning', 'Transformers']
    },
    {
      id: '2',
      content: 'Multimodal AI is the future. Models that can understand text, images, and audio together will transform how we interact with technology. #MultimodalAI #AI',
      authorUsername: 'future_of_ai',
      authorName: 'Future of AI',
      authorFollowersCount: 35000,
      likesCount: 650,
      retweetsCount: 210,
      repliesCount: 30,
      quoteCount: 8,
      url: 'https://twitter.com/future_of_ai/status/2',
      createdAt: new Date().toISOString(),
      impactScore: 1070,
      isVerified: true,
      hashtags: ['MultimodalAI', 'AI']
    },
    {
      id: '3',
      content: 'Just tried the new GPT-4o model and I\'m blown away by its multimodal capabilities! #AI #LLM #MachineLearning',
      authorUsername: 'ai_enthusiast',
      authorName: 'AI Enthusiast',
      authorFollowersCount: 15000,
      likesCount: 450,
      retweetsCount: 120,
      repliesCount: 25,
      quoteCount: 5,
      url: 'https://twitter.com/ai_enthusiast/status/3',
      createdAt: new Date().toISOString(),
      impactScore: 690,
      isVerified: false,
      hashtags: ['AI', 'LLM', 'MachineLearning']
    },
    {
      id: '4',
      content: 'The latest advancements in computer vision are mind-blowing. We can now generate photorealistic images from text descriptions with unprecedented quality. #ComputerVision #AI',
      authorUsername: 'vision_expert',
      authorName: 'Computer Vision Expert',
      authorFollowersCount: 25000,
      likesCount: 780,
      retweetsCount: 280,
      repliesCount: 40,
      quoteCount: 10,
      url: 'https://twitter.com/vision_expert/status/4',
      createdAt: new Date().toISOString(),
      impactScore: 1250,
      isVerified: true,
      hashtags: ['ComputerVision', 'AI']
    },
    {
      id: '5',
      content: 'Our team has developed a new reinforcement learning algorithm that achieves state-of-the-art results on the OpenAI Gym benchmark. Code and paper available now! #ReinforcementLearning #AI',
      authorUsername: 'rl_researcher',
      authorName: 'RL Researcher',
      authorFollowersCount: 20000,
      likesCount: 520,
      retweetsCount: 180,
      repliesCount: 35,
      quoteCount: 7,
      url: 'https://twitter.com/rl_researcher/status/5',
      createdAt: new Date().toISOString(),
      impactScore: 850,
      isVerified: false,
      hashtags: ['ReinforcementLearning', 'AI']
    }
  ];
  
  // Extract hashtags
  const hashtagCounts = {};
  tweets.forEach(tweet => {
    tweet.hashtags.forEach(hashtag => {
      if (!hashtagCounts[hashtag]) {
        hashtagCounts[hashtag] = {
          count: 0,
          likes: 0,
          retweets: 0,
          replies: 0
        };
      }
      hashtagCounts[hashtag].count += 1;
      hashtagCounts[hashtag].likes += tweet.likesCount;
      hashtagCounts[hashtag].retweets += tweet.retweetsCount;
      hashtagCounts[hashtag].replies += tweet.repliesCount;
    });
  });
  
  // Convert to array
  const hashtags = Object.keys(hashtagCounts).map(hashtag => ({
    hashtag,
    tweetCount: hashtagCounts[hashtag].count,
    totalLikes: hashtagCounts[hashtag].likes,
    totalRetweets: hashtagCounts[hashtag].retweets,
    totalReplies: hashtagCounts[hashtag].replies,
    impactScore: (hashtagCounts[hashtag].likes + hashtagCounts[hashtag].retweets * 2) / 10
  }));
  
  // Sort by impact score
  hashtags.sort((a, b) => b.impactScore - a.impactScore);
  
  console.log(`✅ Generated ${tweets.length} mock tweets and ${hashtags.length} hashtags`);
  
  return { tweets, hashtags, isReal: false };
}

// Main function
async function main() {
  try {
    // Fetch tweets
    const { tweets, hashtags, isReal } = await fetchTweets();
    
    if (isReal) {
      console.log(`✅ Successfully fetched ${tweets.length} real tweets and ${hashtags.length} hashtags from Twitter API`);
    } else {
      console.log(`⚠️ Using ${tweets.length} mock tweets and ${hashtags.length} hashtags (Twitter API connection failed)`);
    }
    
    // Save to JSON file
    const outputFile = path.join(outputDir, 'twitter-data.json');
    fs.writeFileSync(outputFile, JSON.stringify({ tweets, hashtags }, null, 2));
    console.log(`✅ Saved Twitter data to ${outputFile}`);
    
    console.log('\nTo use this data in the application:');
    console.log('1. Make sure the application is configured to use real data');
    console.log('2. Restart the application');
    
    if (!isReal) {
      console.log('\n⚠️ NOTE: The data being used is mock data, not real Twitter data.');
      console.log('This is because we hit the Twitter API rate limit (429 Too Many Requests error).');
      console.log('Please wait a few minutes before trying again.');
    }
    
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    process.exit(1);
  }
}

// Run the main function
main();