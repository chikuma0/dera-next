-- Create news sources table
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  feed_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 5,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create news categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create news items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_id UUID NOT NULL REFERENCES news_sources(id),
  url TEXT NOT NULL UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT,
  relevance_score FLOAT,
  importance_score FLOAT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for news items and categories
CREATE TABLE IF NOT EXISTS news_item_categories (
  news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  category_id UUID REFERENCES news_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (news_item_id, category_id)
);

-- Create view for published news with categories
CREATE OR REPLACE VIEW published_news_with_categories AS
SELECT 
  ni.id,
  ni.title,
  ni.summary,
  ni.content,
  ni.source_id,
  ns.name as source_name,
  ni.url,
  ni.published_date,
  ni.collected_at,
  ni.image_url,
  ni.relevance_score,
  ni.importance_score,
  ni.status,
  array_agg(nc.name) as categories
FROM news_items ni
JOIN news_sources ns ON ni.source_id = ns.id
LEFT JOIN news_item_categories nic ON ni.id = nic.news_item_id
LEFT JOIN news_categories nc ON nic.category_id = nc.id
WHERE ni.status = 'published'
GROUP BY 
  ni.id, ni.title, ni.summary, ni.content, ni.source_id, ns.name,
  ni.url, ni.published_date, ni.collected_at, ni.image_url,
  ni.relevance_score, ni.importance_score, ni.status;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 