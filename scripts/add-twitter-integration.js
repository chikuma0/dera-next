// scripts/add-twitter-integration.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample tweets data
const sampleTweets = [
  {
    id: '1760123456789012345',
    content: 'Just tried the new GPT-4o model and I\'m blown away by its multimodal capabilities! #AI #LLM #MachineLearning',
    author_username: 'ai_enthusiast',
    author_name: 'AI Enthusiast',
    author_followers_count: 15000,
    likes_count: 450,
    retweets_count: 120,
    replies_count: 35,
    quote_count: 15,
    url: 'https://twitter.com/ai_enthusiast/status/1760123456789012345',
    created_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    impact_score: 780.5,
    is_verified: true
  },
  {
    id: '1760223456789012345',
    content: 'Our research team just published a new paper on improving transformer efficiency by 40% with minimal accuracy loss. #AI #DeepLearning #Transformers',
    author_username: 'ai_researcher',
    author_name: 'AI Research Lab',
    author_followers_count: 50000,
    likes_count: 890,
    retweets_count: 320,
    replies_count: 75,
    quote_count: 45,
    url: 'https://twitter.com/ai_researcher/status/1760223456789012345',
    created_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    impact_score: 1450.8,
    is_verified: true
  },
  {
    id: '1760323456789012345',
    content: 'Ethical considerations in AI development are more important than ever. We need to prioritize responsible AI. #AIEthics #ResponsibleAI',
    author_username: 'ethics_in_tech',
    author_name: 'Ethics in Technology',
    author_followers_count: 8500,
    likes_count: 320,
    retweets_count: 95,
    replies_count: 42,
    quote_count: 12,
    url: 'https://twitter.com/ethics_in_tech/status/1760323456789012345',
    created_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    impact_score: 520.3,
    is_verified: false
  },
  {
    id: '1760423456789012345',
    content: 'Computer vision models are getting incredibly good at understanding complex scenes. The latest research is mind-blowing! #ComputerVision #AI',
    author_username: 'vision_expert',
    author_name: 'Computer Vision Expert',
    author_followers_count: 12000,
    likes_count: 410,
    retweets_count: 130,
    replies_count: 28,
    quote_count: 18,
    url: 'https://twitter.com/vision_expert/status/1760423456789012345',
    created_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    impact_score: 680.2,
    is_verified: true
  },
  {
    id: '1760523456789012345',
    content: 'Multimodal AI is the future. Models that can understand text, images, and audio together will transform how we interact with technology. #MultimodalAI #AI',
    author_username: 'future_of_ai',
    author_name: 'Future of AI',
    author_followers_count: 25000,
    likes_count: 650,
    retweets_count: 210,
    replies_count: 45,
    quote_count: 30,
    url: 'https://twitter.com/future_of_ai/status/1760523456789012345',
    created_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    impact_score: 1050.6,
    is_verified: true
  }
];

// Sample hashtags
const sampleHashtags = [
  {
    hashtag: 'ai',
    tweet_count: 120,
    total_likes: 15000,
    total_retweets: 4500,
    total_replies: 2200,
    impact_score: 950.5,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    hashtag: 'machinelearning',
    tweet_count: 85,
    total_likes: 10500,
    total_retweets: 3200,
    total_replies: 1800,
    impact_score: 850.2,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    hashtag: 'llm',
    tweet_count: 65,
    total_likes: 8200,
    total_retweets: 2500,
    total_replies: 1400,
    impact_score: 780.8,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    hashtag: 'aiethics',
    tweet_count: 45,
    total_likes: 5800,
    total_retweets: 1900,
    total_replies: 1100,
    impact_score: 620.4,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    hashtag: 'computervision',
    tweet_count: 55,
    total_likes: 7200,
    total_retweets: 2200,
    total_replies: 1300,
    impact_score: 710.6,
    first_seen: new Date().toISOString(),
    last_seen: new Date().toISOString()
  }
];

// Function to link tweets to technologies
async function linkTweetsToTechnologies() {
  // Get all technologies
  const { data: technologies, error: techError } = await supabase
    .from('ai_technologies')
    .select('id, name, slug');
  
  if (techError) {
    console.error('Error fetching technologies:', techError);
    return;
  }
  
  // Create links between tweets and technologies
  const tweetTechLinks = [];
  
  for (const tweet of sampleTweets) {
    // Find matching technologies in tweet content
    for (const tech of technologies) {
      if (tweet.content.toLowerCase().includes(tech.name.toLowerCase()) || 
          tweet.content.toLowerCase().includes(tech.slug.toLowerCase())) {
        tweetTechLinks.push({
          tweet_id: tweet.id,
          technology_id: tech.id,
          relevance_score: Math.random() * 5 + 1 // Random score between 1 and 6
        });
      }
    }
  }
  
  // Insert links
  if (tweetTechLinks.length > 0) {
    const { error: linkError } = await supabase
      .from('tweet_technologies')
      .upsert(tweetTechLinks);
    
    if (linkError) {
      console.error('Error linking tweets to technologies:', linkError);
    } else {
      console.log(`Linked ${tweetTechLinks.length} tweets to technologies`);
    }
  }
}

// Function to link tweets to hashtags
async function linkTweetsToHashtags() {
  const links = [];
  
  // Get all hashtags
  const { data: hashtags, error: hashtagError } = await supabase
    .from('tweet_hashtags')
    .select('id, hashtag');
  
  if (hashtagError) {
    console.error('Error fetching hashtags:', hashtagError);
    return;
  }
  
  // Create random links between tweets and hashtags
  for (const tweet of sampleTweets) {
    // Randomly select 1-3 hashtags for each tweet
    const numHashtags = Math.floor(Math.random() * 3) + 1;
    const selectedHashtags = [...hashtags].sort(() => 0.5 - Math.random()).slice(0, numHashtags);
    
    for (const hashtag of selectedHashtags) {
      links.push({
        tweet_id: tweet.id,
        hashtag_id: hashtag.id
      });
    }
  }
  
  // Insert links
  if (links.length > 0) {
    const { error: linkError } = await supabase
      .from('tweet_hashtag_links')
      .upsert(links);
    
    if (linkError) {
      console.error('Error linking tweets to hashtags:', linkError);
    } else {
      console.log(`Linked tweets to ${links.length} hashtags`);
    }
  }
}

// Main function to run the script
async function main() {
  try {
    console.log('Adding sample Twitter data...');
    
    // Insert sample tweets
    const { error: tweetError } = await supabase
      .from('tweets')
      .upsert(sampleTweets);
    
    if (tweetError) {
      console.error('Error inserting sample tweets:', tweetError);
    } else {
      console.log(`Added ${sampleTweets.length} sample tweets`);
    }
    
    // Insert sample hashtags
    const { error: hashtagError } = await supabase
      .from('tweet_hashtags')
      .upsert(sampleHashtags);
    
    if (hashtagError) {
      console.error('Error inserting sample hashtags:', hashtagError);
    } else {
      console.log(`Added ${sampleHashtags.length} sample hashtags`);
    }
    
    // Link tweets to technologies
    await linkTweetsToTechnologies();
    
    // Link tweets to hashtags
    await linkTweetsToHashtags();
    
    // Update trend points with tweet data
    const { data: trendPoints, error: trendError } = await supabase
      .from('technology_trend_points')
      .select('id, technology_id')
      .order('id', { ascending: false })
      .limit(10);
    
    if (trendError) {
      console.error('Error fetching trend points:', trendError);
    } else {
      // Update trend points with random tweet data
      for (const point of trendPoints) {
        const { error: updateError } = await supabase
          .from('technology_trend_points')
          .update({
            tweet_mention_count: Math.floor(Math.random() * 50) + 5,
            social_impact_score: Math.random() * 1000 + 100
          })
          .eq('id', point.id);
        
        if (updateError) {
          console.error(`Error updating trend point ${point.id}:`, updateError);
        }
      }
      console.log(`Updated ${trendPoints.length} trend points with tweet data`);
    }
    
    console.log('Sample Twitter data added successfully!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main().catch(console.error);