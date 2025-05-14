// scripts/fixed-twitter-migration.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This script applies the Twitter integration migration for DERA Pulse.
 * It creates the necessary tables directly using the Supabase client.
 */

async function main() {
  console.log('Applying Twitter integration database migration...');
  
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL available:', !!SUPABASE_URL);
    console.log('Supabase Service Role Key available:', !!SUPABASE_SERVICE_ROLE_KEY);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    console.log('Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Create tweets table
    console.log('Creating tweets table...');
    const { error: tweetsError } = await supabase.rpc('create_tweets_table');
    
    if (tweetsError) {
      console.error('Error creating tweets table:', tweetsError);
    } else {
      console.log('Tweets table created successfully');
    }
    
    // Create tweet_technologies table
    console.log('Creating tweet_technologies table...');
    const { error: techError } = await supabase.rpc('create_tweet_technologies_table');
    
    if (techError) {
      console.error('Error creating tweet_technologies table:', techError);
    } else {
      console.log('Tweet technologies table created successfully');
    }
    
    // Create tweet_hashtags table
    console.log('Creating tweet_hashtags table...');
    const { error: hashtagsError } = await supabase.rpc('create_tweet_hashtags_table');
    
    if (hashtagsError) {
      console.error('Error creating tweet_hashtags table:', hashtagsError);
    } else {
      console.log('Tweet hashtags table created successfully');
    }
    
    // Create tweet_hashtag_links table
    console.log('Creating tweet_hashtag_links table...');
    const { error: linksError } = await supabase.rpc('create_tweet_hashtag_links_table');
    
    if (linksError) {
      console.error('Error creating tweet_hashtag_links table:', linksError);
    } else {
      console.log('Tweet hashtag links table created successfully');
    }
    
    // Add columns to technology_trend_points
    console.log('Adding columns to technology_trend_points table...');
    const { error: trendPointsError } = await supabase.rpc('add_social_columns_to_trend_points');
    
    if (trendPointsError) {
      console.error('Error adding columns to technology_trend_points:', trendPointsError);
    } else {
      console.log('Columns added to technology_trend_points successfully');
    }
    
    // Add columns to trend_reports
    console.log('Adding columns to trend_reports table...');
    const { error: trendReportsError } = await supabase.rpc('add_social_columns_to_trend_reports');
    
    if (trendReportsError) {
      console.error('Error adding columns to trend_reports:', trendReportsError);
    } else {
      console.log('Columns added to trend_reports successfully');
    }
    
    console.log('Migration completed with some errors. Check the logs for details.');
    console.log('You may need to create the tables manually using the Supabase dashboard.');
    
    // Instructions for manual migration
    console.log('\nTo apply this migration manually:');
    console.log('1. Go to the Supabase dashboard: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to the SQL Editor');
    console.log('4. Copy and paste the following SQL statements:');
    console.log(`
-- Create tweets table
CREATE TABLE IF NOT EXISTS public.tweets (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_name TEXT,
  author_followers_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  retweets_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  quote_count INTEGER DEFAULT 0,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  impact_score FLOAT DEFAULT 0.0,
  is_verified BOOLEAN DEFAULT FALSE
);

-- Create tweet_technologies table
CREATE TABLE IF NOT EXISTS public.tweet_technologies (
  tweet_id TEXT REFERENCES public.tweets(id) ON DELETE CASCADE,
  technology_id INTEGER REFERENCES public.ai_technologies(id) ON DELETE CASCADE,
  relevance_score FLOAT DEFAULT 0.0,
  PRIMARY KEY (tweet_id, technology_id)
);

-- Create tweet_hashtags table
CREATE TABLE IF NOT EXISTS public.tweet_hashtags (
  id SERIAL PRIMARY KEY,
  hashtag TEXT NOT NULL,
  tweet_count INTEGER DEFAULT 1,
  total_likes INTEGER DEFAULT 0,
  total_retweets INTEGER DEFAULT 0,
  total_replies INTEGER DEFAULT 0,
  impact_score FLOAT DEFAULT 0.0,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hashtag)
);

-- Create tweet_hashtag_links table
CREATE TABLE IF NOT EXISTS public.tweet_hashtag_links (
  tweet_id TEXT REFERENCES public.tweets(id) ON DELETE CASCADE,
  hashtag_id INTEGER REFERENCES public.tweet_hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (tweet_id, hashtag_id)
);

-- Add columns to technology_trend_points
ALTER TABLE public.technology_trend_points 
ADD COLUMN IF NOT EXISTS tweet_mention_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_impact_score FLOAT DEFAULT 0.0;

-- Add columns to trend_reports
ALTER TABLE public.trend_reports
ADD COLUMN IF NOT EXISTS viral_hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS top_tweets JSONB DEFAULT '[]';

-- Enable RLS on new tables
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_hashtag_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on tweets"
  ON public.tweets FOR SELECT USING (true);

CREATE POLICY "Allow public read access on tweet_technologies"
  ON public.tweet_technologies FOR SELECT USING (true);

CREATE POLICY "Allow public read access on tweet_hashtags"
  ON public.tweet_hashtags FOR SELECT USING (true);

CREATE POLICY "Allow public read access on tweet_hashtag_links"
  ON public.tweet_hashtag_links FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON public.tweets(created_at);
CREATE INDEX IF NOT EXISTS idx_tweets_impact_score ON public.tweets(impact_score);
CREATE INDEX IF NOT EXISTS idx_tweet_hashtags_impact_score ON public.tweet_hashtags(impact_score);
    `);
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

main();