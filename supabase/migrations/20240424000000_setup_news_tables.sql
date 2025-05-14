-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing objects if they exist
DROP VIEW IF EXISTS published_news_with_categories;
DROP TABLE IF EXISTS news_item_categories CASCADE;
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS news_sources CASCADE;
DROP TABLE IF EXISTS news_categories CASCADE;
DROP TABLE IF EXISTS sonar_digests CASCADE;
DROP TABLE IF EXISTS grok_digests CASCADE;
DROP TABLE IF EXISTS tweets CASCADE;
DROP TABLE IF EXISTS tweet_technologies CASCADE;
DROP TABLE IF EXISTS tweet_hashtags CASCADE;
DROP TABLE IF EXISTS tweet_hashtag_links CASCADE;

-- Create news_categories table
CREATE TABLE news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_sources table
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  feed_url TEXT,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'api', 'twitter', 'manual')),
  scraping_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_items table
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_id UUID NOT NULL REFERENCES news_sources(id),
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  image_url TEXT,
  relevance_score FLOAT DEFAULT 0.0,
  importance_score FLOAT DEFAULT 0.0,
  trend_score FLOAT DEFAULT 0.0,
  professional_relevance_score FLOAT DEFAULT 0.0,
  is_breaking BOOLEAN DEFAULT false,
  ai_processed BOOLEAN DEFAULT false,
  categories JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_item_categories junction table
CREATE TABLE news_item_categories (
  news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  category_id UUID REFERENCES news_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (news_item_id, category_id)
);

-- Create sonar_digests table
CREATE TABLE sonar_digests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  topics JSONB NOT NULL,
  raw_html TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grok_digests table
CREATE TABLE grok_digests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  topics JSONB NOT NULL,
  raw_html TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tweets table
CREATE TABLE tweets (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  retweet_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  quote_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tweet_technologies table
CREATE TABLE tweet_technologies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tweet_hashtags table
CREATE TABLE tweet_hashtags (
  id SERIAL PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tweet_hashtag_links table
CREATE TABLE tweet_hashtag_links (
  tweet_id TEXT REFERENCES tweets(id) ON DELETE CASCADE,
  hashtag_id INTEGER REFERENCES tweet_hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (tweet_id, hashtag_id)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_news_items_published_date ON news_items(published_at);
CREATE INDEX IF NOT EXISTS idx_news_items_source_id ON news_items(source_id);
CREATE INDEX IF NOT EXISTS idx_news_items_status ON news_items(status);
CREATE INDEX IF NOT EXISTS idx_news_items_categories ON news_items USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_sonar_digests_date ON sonar_digests(date);
CREATE INDEX IF NOT EXISTS idx_grok_digests_date ON grok_digests(date);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);

-- Create view for published news with categories
CREATE VIEW published_news_with_categories AS
SELECT 
  ni.id,
  ni.title,
  ni.summary,
  ni.content,
  ni.source_id,
  ni.url,
  ni.published_at,
  ni.collected_at,
  ni.image_url,
  ni.relevance_score,
  ni.importance_score,
  ni.trend_score,
  ni.professional_relevance_score,
  ni.is_breaking,
  ni.ai_processed,
  ni.categories as raw_categories,
  ni.status,
  ni.created_at,
  ni.updated_at,
  ns.name as source_name,
  ns.logo_url as source_logo_url,
  array_agg(nc.name) as categories
FROM news_items ni
JOIN news_sources ns ON ni.source_id = ns.id
LEFT JOIN news_item_categories nic ON ni.id = nic.news_item_id
LEFT JOIN news_categories nc ON nic.category_id = nc.id
WHERE ni.status = 'published'
GROUP BY ni.id, ns.id;

-- Add initial categories
INSERT INTO news_categories (name, description)
VALUES 
  ('AI & ML', 'Artificial Intelligence and Machine Learning news'),
  ('Startups', 'AI startup news and funding'),
  ('Research', 'Academic AI research and papers'),
  ('Industry', 'Industry applications of AI'),
  ('Policy', 'AI regulation and policy news'),
  ('Japan Market', 'News specific to the Japanese AI market')
ON CONFLICT (name) DO NOTHING;

-- Add initial news sources
INSERT INTO news_sources (name, url, feed_url, source_type, priority, logo_url, description, is_active)
VALUES 
  ('VentureBeat AI', 'https://venturebeat.com/category/ai/', 'https://venturebeat.com/category/ai/feed/', 'rss', 8, 'https://venturebeat.com/wp-content/themes/vb-news/img/favicon.ico', 'AI news and analysis from VentureBeat', true),
  ('TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'rss', 8, 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', 'AI startup and technology news from TechCrunch', true),
  ('MIT Technology Review', 'https://www.technologyreview.com/topic/artificial-intelligence/', 'https://www.technologyreview.com/feed/', 'rss', 9, 'https://wp-cdn.technologyreview.com/uploads/2020/10/Screen-Shot-2020-10-29-at-3.29.28-PM-16.png', 'AI research and impact analysis from MIT Technology Review', true),
  ('AIトレンド', 'https://ainow.ai/', 'https://ainow.ai/feed/', 'rss', 9, 'https://ainow.ai/wp-content/uploads/2019/03/cropped-favicon-512-32x32.png', '日本のAI動向ニュースサイト', true),
  ('Ledge.ai', 'https://ledge.ai/', 'https://ledge.ai/feed/', 'rss', 8, 'https://ledge.ai/wp-content/uploads/2018/04/cropped-ledge_favicon-32x32.png', '国内最大級のAI専門メディア', true)
ON CONFLICT (name) DO NOTHING; 