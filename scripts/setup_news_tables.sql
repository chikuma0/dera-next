-- Create news_categories table
CREATE TABLE IF NOT EXISTS public.news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_sources table
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

-- Create news_items table
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_item_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.news_item_categories (
  news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  category_id UUID REFERENCES news_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (news_item_id, category_id)
);

-- Create a view for published news with categories
CREATE OR REPLACE VIEW public.published_news_with_categories AS
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
  ni.ai_processed,
  ni.status,
  ns.name as source_name,
  ns.logo_url as source_logo,
  ARRAY(
    SELECT nc.name
    FROM news_item_categories nic
    JOIN news_categories nc ON nic.category_id = nc.id
    WHERE nic.news_item_id = ni.id
  ) as categories
FROM 
  news_items ni
JOIN 
  news_sources ns ON ni.source_id = ns.id
WHERE 
  ni.status = 'published';

-- Add some initial categories matching the mock data
INSERT INTO news_categories (name, description)
VALUES 
  ('AI & ML', 'Artificial Intelligence and Machine Learning news'),
  ('Startups', 'AI startup news and funding'),
  ('Research', 'Academic AI research and papers'),
  ('Industry', 'Industry applications of AI'),
  ('Policy', 'AI regulation and policy news')
ON CONFLICT (name) DO NOTHING;

-- Sample news sources
INSERT INTO news_sources (name, url, source_type, logo_url)
VALUES 
  ('AI Insider', 'https://example.com/ai-insider', 'rss', 'https://placehold.co/100x100?text=AI'),
  ('Science Daily', 'https://example.com/science-daily', 'rss', 'https://placehold.co/100x100?text=SD'),
  ('Tech Crunch Japan', 'https://example.com/techcrunch-jp', 'rss', 'https://placehold.co/100x100?text=TC')
ON CONFLICT DO NOTHING;

-- Note: You can import mock news data into the real tables with additional SQL statements
-- This would convert the mock data into real database entries 