-- Drop the view first
DROP VIEW IF EXISTS published_news_with_categories;

-- Remove the categories column from news_items table
ALTER TABLE news_items DROP COLUMN IF EXISTS categories;

-- Recreate the published_news_with_categories view
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
  ni.ai_processed,
  ni.status,
  ns.name as source_name,
  ns.logo_url as source_logo,
  ARRAY_AGG(nc.name) as categories
FROM 
  news_items ni
JOIN 
  news_sources ns ON ni.source_id = ns.id
LEFT JOIN 
  news_item_categories nic ON ni.id = nic.news_item_id
LEFT JOIN 
  news_categories nc ON nic.category_id = nc.id
WHERE 
  ni.status = 'published'
GROUP BY 
  ni.id, ns.id; 