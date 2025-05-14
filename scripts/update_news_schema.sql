-- Rename published_at to published_date in news_items table
ALTER TABLE public.news_items RENAME COLUMN published_at TO published_date;

-- Update the published_news_with_categories view
CREATE OR REPLACE VIEW public.published_news_with_categories AS
SELECT 
  ni.id,
  ni.title,
  ni.summary,
  ni.content,
  ni.source_id,
  ni.url,
  ni.published_at as published_date,
  ni.collected_at,
  ni.image_url,
  ni.relevance_score,
  ni.ai_processed,
  ni.status,
  ns.name as source_name,
  ns.logo_url as source_logo,
  array_agg(nc.name) as categories
FROM news_items ni
JOIN news_sources ns ON ni.source_id = ns.id
LEFT JOIN news_item_categories nic ON ni.id = nic.news_item_id
LEFT JOIN news_categories nc ON nic.category_id = nc.id
WHERE ni.status = 'published'
GROUP BY 
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
  ns.name,
  ns.logo_url; 