// scripts/fetch-grok-social-data.js
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();
const axios = require('axios');

/**
 * This script fetches social media data using the Grok API instead of the Twitter API
 * to avoid rate limits. It generates a compatible data structure that can be used
 * by the Twitter-enhanced Sonar digest.
 */

// Check if Grok API key is set
const GROK_API_KEY = process.env.GROK_API_KEY;
if (!GROK_API_KEY) {
  console.error('Error: GROK_API_KEY not set in .env file');
  console.error('Please add your Grok API key to the .env file');
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to validate Grok API key
async function validateGrokAPI() {
  console.log('Validating Grok API connection...');
  
  console.log(`API Key found: ${GROK_API_KEY.substring(0, 4)}...${GROK_API_KEY.substring(GROK_API_KEY.length - 4)}`);
  
  try {
    // Make a simple request to the Grok API
    console.log('Making test request to Grok API...');
    const response = await axios.get(
      'https://api.grok.ai/v1/status',
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      console.log('✅ Grok API connection successful!');
      return true;
    } else {
      console.error(`❌ Grok API returned status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error connecting to Grok API:');
    
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error(`Status text: ${error.response.statusText}`);
    } else if (error.request) {
      console.error('No response received from Grok API');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return false;
  }
}

// Function to fetch social media data from Grok API
async function fetchSocialData() {
  console.log('Attempting to fetch social media data from Grok API...');
  
  // First validate the Grok API connection
  const isValid = await validateGrokAPI();
  if (!isValid) {
    console.log('\n❌ Grok API validation failed. Falling back to mock data.');
    return generateMockData();
  }
  
  try {
    // Define AI-related topics to search for
    const topics = [
      'artificial intelligence',
      'machine learning',
      'deep learning',
      'neural networks',
      'GPT-4',
      'large language models',
      'computer vision',
      'generative AI'
    ];
    
    console.log('Sending request to Grok API...');
    console.log(`Topics: ${topics.join(', ')}`);
    
    // Fetch social media data for each topic
    const allPosts = [];
    const allHashtags = {};
    
    for (const topic of topics) {
      console.log(`Fetching data for topic: ${topic}`);
      
      try {
        const response = await axios.post(
          'https://api.grok.ai/v1/social/trends',
          {
            query: topic,
            platforms: ['twitter', 'reddit', 'hackernews'],
            timeframe: '48h',
            limit: 20
          },
          {
            headers: {
              'Authorization': `Bearer ${GROK_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status !== 200) {
          throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
        }
        
        const data = response.data;
        
        // Process posts
        if (data.posts && Array.isArray(data.posts)) {
          for (const post of data.posts) {
            // Extract hashtags
            const hashtags = [];
            const hashtagRegex = /#(\w+)/g;
            let match;
            
            while ((match = hashtagRegex.exec(post.content)) !== null) {
              const hashtag = match[1].toLowerCase();
              hashtags.push(hashtag);
              
              // Add to global hashtags
              if (!allHashtags[hashtag]) {
                allHashtags[hashtag] = {
                  count: 0,
                  likes: 0,
                  shares: 0,
                  comments: 0
                };
              }
              
              allHashtags[hashtag].count += 1;
              allHashtags[hashtag].likes += post.metrics.likes || 0;
              allHashtags[hashtag].shares += post.metrics.shares || 0;
              allHashtags[hashtag].comments += post.metrics.comments || 0;
            }
            
            // Calculate impact score
            const likesCount = post.metrics.likes || 0;
            const sharesCount = post.metrics.shares || 0;
            const commentsCount = post.metrics.comments || 0;
            const followersCount = post.author.followers || 0;
            
            // Base formula: likes + (shares * 2) + comments
            const engagementScore = 
              likesCount + 
              (sharesCount * 2) + 
              commentsCount;
            
            // Follower influence factor (log scale)
            const followerFactor = followersCount > 0 
              ? Math.log10(followersCount) / 6 // Normalize to ~0-1 range
              : 0;
            
            // Verified account bonus
            const verifiedBonus = post.author.verified ? 1.2 : 1;
            
            // Calculate final score
            const impactScore = Math.round((engagementScore * (1 + followerFactor) * verifiedBonus) * 100) / 100;
            
            // Add to all posts
            allPosts.push({
              id: post.id,
              content: post.content,
              authorUsername: post.author.username,
              authorName: post.author.name,
              authorFollowersCount: followersCount,
              likesCount,
              retweetsCount: sharesCount, // Map shares to retweets for compatibility
              repliesCount: commentsCount, // Map comments to replies for compatibility
              quoteCount: 0, // Not available in Grok API
              url: post.url,
              createdAt: post.created_at,
              impactScore,
              isVerified: post.author.verified || false,
              hashtags,
              platform: post.platform
            });
          }
        }
        
      } catch (error) {
        console.error(`Error fetching data for topic "${topic}":`, error.message);
      }
    }
    
    console.log(`✅ Successfully fetched ${allPosts.length} posts from Grok API`);
    
    // Convert hashtags to array
    const hashtags = Object.keys(allHashtags).map(hashtag => ({
      hashtag,
      tweetCount: allHashtags[hashtag].count,
      totalLikes: allHashtags[hashtag].likes,
      totalRetweets: allHashtags[hashtag].shares,
      totalReplies: allHashtags[hashtag].comments,
      impactScore: (allHashtags[hashtag].likes + allHashtags[hashtag].shares * 2) / 10
    }));
    
    // Sort by impact score
    hashtags.sort((a, b) => b.impactScore - a.impactScore);
    
    // For compatibility with the Twitter-enhanced Sonar digest, we need to rename the posts to tweets
    const tweets = allPosts;
    
    return { tweets, hashtags, isReal: true };
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.log('\n❌ Failed to fetch social data from Grok API. Falling back to mock data.');
    return generateMockData();
  }
}

// Function to generate mock data
function generateMockData() {
  console.log('Generating mock social media data...');
  
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
      hashtags: ['ai', 'deeplearning', 'transformers'],
      platform: 'twitter'
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
      hashtags: ['multimodalai', 'ai'],
      platform: 'twitter'
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
      hashtags: ['ai', 'llm', 'machinelearning'],
      platform: 'twitter'
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
      hashtags: ['computervision', 'ai'],
      platform: 'twitter'
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
      hashtags: ['reinforcementlearning', 'ai'],
      platform: 'twitter'
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
  
  console.log(`✅ Generated ${tweets.length} mock posts and ${hashtags.length} hashtags`);
  
  return { tweets, hashtags, isReal: false };
}

// Main function
async function main() {
  try {
    // Fetch social media data
    const { tweets, hashtags, isReal } = await fetchSocialData();
    
    if (isReal) {
      console.log(`✅ Successfully fetched ${tweets.length} real posts and ${hashtags.length} hashtags from Grok API`);
    } else {
      console.log(`⚠️ Using ${tweets.length} mock posts and ${hashtags.length} hashtags (Grok API connection failed)`);
    }
    
    // Save to JSON file
    const outputFile = path.join(outputDir, 'twitter-data.json');
    fs.writeFileSync(outputFile, JSON.stringify({ tweets, hashtags }, null, 2));
    console.log(`✅ Saved social media data to ${outputFile}`);
    
    console.log('\nTo use this data in the application:');
    console.log('1. Make sure the application is configured to use real data');
    console.log('2. Restart the application');
    
    if (!isReal) {
      console.log('\n⚠️ NOTE: The data being used is mock data, not real social media data.');
      console.log('This is because we could not connect to the Grok API.');
      console.log('Please check your API key and try again.');
    }
    
  } catch (error) {
    console.error('Error fetching social media data:', error);
    process.exit(1);
  }
}

// Run the main function
main();