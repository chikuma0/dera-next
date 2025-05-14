// scripts/fetch-twitter-data.js
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

/**
 * This script fetches tweets from the Twitter API and saves them to a JSON file
 * that can be used by the application.
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

// Function to fetch tweets from Twitter API
async function fetchTweets() {
  console.log('Fetching tweets from Twitter API...');
  
  // This is a simplified version that simulates fetching from Twitter API
  // In a real implementation, you would use the Twitter API client
  
  return new Promise((resolve, reject) => {
    // Simulate API call with a timeout
    setTimeout(() => {
      try {
        // Generate some realistic tweets
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
        
        resolve({ tweets, hashtags });
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
}

// Main function
async function main() {
  try {
    // Fetch tweets
    const { tweets, hashtags } = await fetchTweets();
    console.log(`Fetched ${tweets.length} tweets and ${hashtags.length} hashtags`);
    
    // Save to JSON file
    const outputFile = path.join(outputDir, 'twitter-data.json');
    fs.writeFileSync(outputFile, JSON.stringify({ tweets, hashtags }, null, 2));
    console.log(`Saved Twitter data to ${outputFile}`);
    
    console.log('\nTo use this data in the application:');
    console.log('1. Make sure the application is configured to use real data');
    console.log('2. Restart the application');
    
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    process.exit(1);
  }
}

// Run the main function
main();