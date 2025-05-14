-- Check news_sources
SELECT COUNT(*) as source_count FROM news_sources;
SELECT * FROM news_sources LIMIT 5;

-- Check news_items
SELECT COUNT(*) as items_count FROM news_items;
SELECT * FROM news_items LIMIT 5;

-- Check news_categories
SELECT COUNT(*) as categories_count FROM news_categories;
SELECT * FROM news_categories LIMIT 5;

-- Check news_item_categories
SELECT COUNT(*) as item_categories_count FROM news_item_categories;
SELECT * FROM news_item_categories LIMIT 5;

-- Check the view
SELECT COUNT(*) as view_count FROM published_news_with_categories;
SELECT * FROM published_news_with_categories LIMIT 5;

-- Check if our view definition is correct
SELECT pg_get_viewdef('published_news_with_categories', true); 