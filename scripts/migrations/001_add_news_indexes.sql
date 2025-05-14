-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_items_published_date ON news_items(published_date);
CREATE INDEX IF NOT EXISTS idx_news_items_status ON news_items(status);
CREATE INDEX IF NOT EXISTS idx_news_items_source_id ON news_items(source_id);
CREATE INDEX IF NOT EXISTS idx_news_items_language ON news_items(language);

-- Add full-text search index
ALTER TABLE news_items 
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(summary, '')), 'B')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_news_items_search ON news_items USING GIN(search_vector);
