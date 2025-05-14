-- Drop and recreate the view with a simpler definition
DROP VIEW IF EXISTS published_news_with_categories;

CREATE VIEW published_news_with_categories AS
SELECT 
  ni.*,
  array_agg(nc.name) as categories,
  ns.name as source_name,
  ns.logo_url as source_logo
FROM news_items ni
LEFT JOIN news_sources ns ON ni.source_id = ns.id
LEFT JOIN news_item_categories nic ON ni.id = nic.news_item_id
LEFT JOIN news_categories nc ON nic.category_id = nc.id
GROUP BY 
  ni.id,
  ns.name,
  ns.logo_url; 