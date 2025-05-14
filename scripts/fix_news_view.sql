-- First, make sure all required tables exist
CREATE TABLE IF NOT EXISTS public.news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  source_type TEXT NOT NULL,
  scraping_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_id UUID NOT NULL REFERENCES news_sources(id),
  url TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  image_url TEXT,
  relevance_score INTEGER DEFAULT 0,
  ai_processed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language TEXT
);

CREATE TABLE IF NOT EXISTS public.news_item_categories (
  news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  category_id UUID REFERENCES news_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (news_item_id, category_id)
);

-- Drop the existing view first
DROP VIEW IF EXISTS public.published_news_with_categories;

-- Create the view with the actual columns that exist in the database
CREATE VIEW public.published_news_with_categories AS
SELECT 
  ni.id,
  ni.title,
  ni.summary,
  ni.url,
  ni.source_id,
  ni.published_at,
  ni.created_at,
  ni.updated_at,
  ni.relevance_score,
  ni.sentiment,
  ni.ai_summary,
  ni.language,
  array_agg(nc.name) as categories,
  ns.name as source,
  ns.name as source_name,
  ns.logo_url as source_logo
FROM news_items ni
JOIN news_sources ns ON ni.source_id = ns.id
LEFT JOIN news_item_categories nic ON ni.id = nic.news_item_id
LEFT JOIN news_categories nc ON nic.category_id = nc.id
GROUP BY 
  ni.id,
  ni.title,
  ni.summary,
  ni.url,
  ni.source_id,
  ni.published_at,
  ni.created_at,
  ni.updated_at,
  ni.relevance_score,
  ni.sentiment,
  ni.ai_summary,
  ni.language,
  ns.name,
  ns.logo_url; 