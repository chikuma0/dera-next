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

-- Add social impact data to technology trend points
ALTER TABLE public.technology_trend_points 
ADD COLUMN IF NOT EXISTS tweet_mention_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_impact_score FLOAT DEFAULT 0.0;

-- Add social metrics to trend reports
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