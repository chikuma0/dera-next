-- Create news_sources table
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
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

-- Sample news sources
INSERT INTO news_sources (name, url, source_type, logo_url)
VALUES 
  ('AI Insider', 'https://example.com/ai-insider', 'rss', 'https://placehold.co/100x100?text=AI'),
  ('Science Daily', 'https://example.com/science-daily', 'rss', 'https://placehold.co/100x100?text=SD'),
  ('Tech Crunch Japan', 'https://example.com/techcrunch-jp', 'rss', 'https://placehold.co/100x100?text=TC')
ON CONFLICT (name) DO NOTHING; 