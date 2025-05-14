-- News Sources Table
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 5, -- 1-10 scale for source importance
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'api', 'twitter', 'manual')),
  scraping_config JSONB, -- For custom scraping patterns if needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Items Table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_id UUID REFERENCES news_sources(id),
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  relevance_score FLOAT DEFAULT 0.0,
  ai_processed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Categories Table
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Items to Categories (Many-to-Many)
CREATE TABLE IF NOT EXISTS news_item_categories (
  news_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  category_id UUID REFERENCES news_categories(id) ON DELETE CASCADE,
  confidence FLOAT DEFAULT 1.0,
  PRIMARY KEY (news_id, category_id)
);

-- News Tags Table
CREATE TABLE IF NOT EXISTS news_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Items to Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS news_item_tags (
  news_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES news_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, tag_id)
);

-- Seed some initial categories
INSERT INTO news_categories (name, description) 
VALUES 
  ('AI Research', 'Academic and research breakthroughs in AI'),
  ('Product Releases', 'New AI products and services'),
  ('Industry News', 'Business and industry developments'),
  ('Policy & Regulation', 'Government policies and regulatory developments'),
  ('Japan Market', 'News specific to the Japanese AI market'),
  ('Use Cases', 'Real-world applications of AI technologies')
ON CONFLICT (name) DO NOTHING;

-- Create or replace the view for published news with categories
CREATE OR REPLACE VIEW published_news_with_categories AS
SELECT 
  n.id, 
  n.title, 
  n.summary, 
  n.image_url, 
  n.published_at, 
  n.url,
  n.relevance_score,
  s.name as source_name,
  s.logo_url as source_logo,
  ARRAY_AGG(DISTINCT c.name) as categories
FROM 
  news_items n
JOIN 
  news_sources s ON n.source_id = s.id
LEFT JOIN 
  news_item_categories nic ON n.id = nic.news_id
LEFT JOIN 
  news_categories c ON nic.category_id = c.id
WHERE 
  n.status = 'published'
GROUP BY 
  n.id, s.name, s.logo_url
ORDER BY 
  n.published_at DESC;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_items_status ON news_items(status);
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items(published_at);
CREATE INDEX IF NOT EXISTS idx_news_items_source_id ON news_items(source_id);
CREATE INDEX IF NOT EXISTS idx_news_item_categories_news_id ON news_item_categories(news_id);
CREATE INDEX IF NOT EXISTS idx_news_item_categories_category_id ON news_item_categories(category_id); 