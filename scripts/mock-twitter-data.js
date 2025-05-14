// scripts/mock-twitter-data.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This script adds mock Twitter data to the existing trend data
 * to simulate the Twitter integration without requiring the actual tables.
 */

async function main() {
  console.log('Adding mock Twitter data to trend system...');
  
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Sample tweets data
    const sampleTweets = [
      {
        id: '1760123456789012345',
        content: 'Just tried the new GPT-4o model and I\'m blown away by its multimodal capabilities! #AI #LLM #MachineLearning',
        authorUsername: 'ai_enthusiast',
        authorName: 'AI Enthusiast',
        authorFollowersCount: 15000,
        likesCount: 450,
        retweetsCount: 120,
        repliesCount: 35,
        quoteCount: 15,
        url: 'https://twitter.com/ai_enthusiast/status/1760123456789012345',
        createdAt: new Date().toISOString(),
        impactScore: 780.5,
        isVerified: true,
        hashtags: ['AI', 'LLM', 'MachineLearning']
      },
      {
        id: '1760223456789012345',
        content: 'Our research team just published a new paper on improving transformer efficiency by 40% with minimal accuracy loss. #AI #DeepLearning #Transformers',
        authorUsername: 'ai_researcher',
        authorName: 'AI Research Lab',
        authorFollowersCount: 50000,
        likesCount: 890,
        retweetsCount: 320,
        repliesCount: 75,
        quoteCount: 45,
        url: 'https://twitter.com/ai_researcher/status/1760223456789012345',
        createdAt: new Date().toISOString(),
        impactScore: 1450.8,
        isVerified: true,
        hashtags: ['AI', 'DeepLearning', 'Transformers']
      },
      {
        id: '1760323456789012345',
        content: 'Ethical considerations in AI development are more important than ever. We need to prioritize responsible AI. #AIEthics #ResponsibleAI',
        authorUsername: 'ethics_in_tech',
        authorName: 'Ethics in Technology',
        authorFollowersCount: 8500,
        likesCount: 320,
        retweetsCount: 95,
        repliesCount: 42,
        quoteCount: 12,
        url: 'https://twitter.com/ethics_in_tech/status/1760323456789012345',
        createdAt: new Date().toISOString(),
        impactScore: 520.3,
        isVerified: false,
        hashtags: ['AIEthics', 'ResponsibleAI']
      },
      {
        id: '1760423456789012345',
        content: 'Computer vision models are getting incredibly good at understanding complex scenes. The latest research is mind-blowing! #ComputerVision #AI',
        authorUsername: 'vision_expert',
        authorName: 'Computer Vision Expert',
        authorFollowersCount: 12000,
        likesCount: 410,
        retweetsCount: 130,
        repliesCount: 28,
        quoteCount: 18,
        url: 'https://twitter.com/vision_expert/status/1760423456789012345',
        createdAt: new Date().toISOString(),
        impactScore: 680.2,
        isVerified: true,
        hashtags: ['ComputerVision', 'AI']
      },
      {
        id: '1760523456789012345',
        content: 'Multimodal AI is the future. Models that can understand text, images, and audio together will transform how we interact with technology. #MultimodalAI #AI',
        authorUsername: 'future_of_ai',
        authorName: 'Future of AI',
        authorFollowersCount: 25000,
        likesCount: 650,
        retweetsCount: 210,
        repliesCount: 45,
        quoteCount: 30,
        url: 'https://twitter.com/future_of_ai/status/1760523456789012345',
        createdAt: new Date().toISOString(),
        impactScore: 1050.6,
        isVerified: true,
        hashtags: ['MultimodalAI', 'AI']
      }
    ];
    
    // Sample hashtags
    const sampleHashtags = [
      {
        hashtag: 'ai',
        tweetCount: 120,
        totalLikes: 15000,
        totalRetweets: 4500,
        totalReplies: 2200,
        impactScore: 950.5
      },
      {
        hashtag: 'machinelearning',
        tweetCount: 85,
        totalLikes: 10500,
        totalRetweets: 3200,
        totalReplies: 1800,
        impactScore: 850.2
      },
      {
        hashtag: 'llm',
        tweetCount: 65,
        totalLikes: 8200,
        totalRetweets: 2500,
        totalReplies: 1400,
        impactScore: 780.8
      },
      {
        hashtag: 'aiethics',
        tweetCount: 45,
        totalLikes: 5800,
        totalRetweets: 1900,
        totalReplies: 1100,
        impactScore: 620.4
      },
      {
        hashtag: 'computervision',
        tweetCount: 55,
        totalLikes: 7200,
        totalRetweets: 2200,
        totalReplies: 1300,
        impactScore: 710.6
      }
    ];
    
    // Update the trends API endpoint to use this mock data
    console.log('Creating mock data file...');
    
    // Create a mock data file that can be imported by the API
    const mockData = {
      tweets: sampleTweets,
      hashtags: sampleHashtags
    };
    
    // Write the mock data to a file
    const fs = await import('fs/promises');
    await fs.writeFile('./src/lib/services/mockTwitterData.json', JSON.stringify(mockData, null, 2));
    
    console.log('Mock Twitter data file created successfully!');
    console.log('Now update the trends API to use this mock data.');
    
  } catch (error) {
    console.error('Error creating mock data:', error);
    process.exit(1);
  }
}

main();