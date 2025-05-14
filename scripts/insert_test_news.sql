-- First ensure we have a news source
INSERT INTO news_sources (name, url, source_type)
VALUES ('Test Source', 'https://test.com', 'manual')
ON CONFLICT (name) DO NOTHING;

-- Insert a test news item
WITH source_id AS (
  SELECT id FROM news_sources WHERE name = 'Test Source' LIMIT 1
)
INSERT INTO news_items (
  title,
  summary,
  source_id,
  url,
  published_date,
  language
)
SELECT
  'Test News Article',
  'This is a test news article to verify the view is working.',
  id,
  'https://test.com/article1',
  NOW(),
  'en'
FROM source_id
ON CONFLICT (url) DO NOTHING
RETURNING id;

-- Add a test category if needed
INSERT INTO news_categories (name, description)
VALUES ('Test Category', 'Test category for verification')
ON CONFLICT (name) DO NOTHING;

-- Link the news item to the category
WITH news_id AS (
  SELECT id FROM news_items WHERE url = 'https://test.com/article1'
),
category_id AS (
  SELECT id FROM news_categories WHERE name = 'Test Category'
)
INSERT INTO news_item_categories (news_item_id, category_id)
SELECT news_id.id, category_id.id
FROM news_id, category_id
ON CONFLICT (news_item_id, category_id) DO NOTHING; 