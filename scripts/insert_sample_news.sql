-- First, make sure we have at least one news source
INSERT INTO news_sources (name, url, source_type, logo_url)
VALUES 
  ('TechCrunch', 'https://techcrunch.com', 'rss', 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png'),
  ('VentureBeat', 'https://venturebeat.com', 'rss', 'https://venturebeat.com/wp-content/themes/vb-news/img/favicon.ico')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample news items
WITH inserted_news AS (
  INSERT INTO news_items (
    title,
    summary,
    source_id,
    url,
    published_date,
    language,
    sentiment
  )
  SELECT 
    'OpenAI Announces GPT-5 Development',
    'OpenAI has officially announced the development of GPT-5, promising significant improvements in reasoning and multimodal capabilities.',
    s.id,
    'https://example.com/openai-gpt5',
    NOW() - INTERVAL '1 day',
    'en',
    0.8
  FROM news_sources s
  WHERE s.name = 'TechCrunch'
  UNION ALL
  SELECT 
    'Japanese AI Startup Raises $100M',
    'A promising Japanese AI startup has secured $100M in Series B funding led by SoftBank Vision Fund.',
    s.id,
    'https://example.com/japanese-startup',
    NOW() - INTERVAL '2 days',
    'en',
    0.9
  FROM news_sources s
  WHERE s.name = 'VentureBeat'
  UNION ALL
  SELECT 
    'AI Regulation Framework Proposed in Japan',
    'The Japanese government has proposed a new regulatory framework for AI development and deployment.',
    s.id,
    'https://example.com/ai-regulation',
    NOW() - INTERVAL '3 days',
    'en',
    0.7
  FROM news_sources s
  WHERE s.name = 'TechCrunch'
  ON CONFLICT (url) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    published_date = EXCLUDED.published_date,
    language = EXCLUDED.language,
    sentiment = EXCLUDED.sentiment
  RETURNING id
)
SELECT * FROM inserted_news;

-- Make sure we have some categories
INSERT INTO news_categories (name, description)
VALUES 
  ('AI & ML', 'Artificial Intelligence and Machine Learning news'),
  ('Startups', 'AI startup news and funding'),
  ('Policy', 'AI regulation and policy news'),
  ('Japan Market', 'News specific to the Japanese AI market')
ON CONFLICT (name) DO NOTHING;

-- Link news items to categories
INSERT INTO news_item_categories (news_item_id, category_id)
SELECT ni.id, nc.id
FROM news_items ni
CROSS JOIN news_categories nc
WHERE 
  (ni.title LIKE '%GPT%' AND nc.name = 'AI & ML') OR
  (ni.title LIKE '%Startup%' AND nc.name IN ('Startups', 'Japan Market')) OR
  (ni.title LIKE '%Regulation%' AND nc.name = 'Policy')
ON CONFLICT (news_item_id, category_id) DO NOTHING; 