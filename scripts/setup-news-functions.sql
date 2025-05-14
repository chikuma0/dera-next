-- Function to check if a news item exists
CREATE OR REPLACE FUNCTION check_news_item_exists(item_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM news_items WHERE url = item_url
  );
END;
$$;

-- Function to insert a news item
CREATE OR REPLACE FUNCTION insert_news_item(
  item_title text,
  item_summary text,
  item_content text,
  item_source_id uuid,
  item_url text,
  item_published_date timestamp with time zone,
  item_image_url text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_item_id uuid;
BEGIN
  INSERT INTO news_items (
    title,
    summary,
    content,
    source_id,
    url,
    published_date,
    collected_at,
    image_url,
    status,
    relevance_score
  )
  VALUES (
    item_title,
    item_summary,
    item_content,
    item_source_id,
    item_url,
    item_published_date,
    NOW(),
    item_image_url,
    'pending',
    0.0
  )
  RETURNING id INTO new_item_id;
  
  RETURN new_item_id;
END;
$$;

-- Function to find or create a category
CREATE OR REPLACE FUNCTION find_or_create_category(
  cat_name text,
  cat_description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_category_id uuid;
BEGIN
  -- Try to find existing category
  SELECT id INTO existing_category_id
  FROM news_categories
  WHERE name = cat_name;
  
  -- If not found, create new category
  IF existing_category_id IS NULL THEN
    INSERT INTO news_categories (name, description)
    VALUES (cat_name, cat_description)
    RETURNING id INTO existing_category_id;
  END IF;
  
  RETURN existing_category_id;
END;
$$;

-- Function to link news item to category
CREATE OR REPLACE FUNCTION link_news_item_category(
  item_id uuid,
  cat_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO news_item_categories (news_item_id, category_id)
  VALUES (item_id, cat_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Function to get active RSS sources
CREATE OR REPLACE FUNCTION get_active_sources()
RETURNS SETOF record
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id::uuid,
    s.feed_url::text
  FROM public.news_sources s
  WHERE 
    s.is_active = true 
    AND s.source_type = 'rss'
    AND s.feed_url IS NOT NULL;
$$;

-- Create a view for active sources to make it easier to query
CREATE OR REPLACE VIEW active_rss_sources AS
SELECT 
  id as source_id,
  feed_url as source_feed_url
FROM public.news_sources
WHERE 
  is_active = true 
  AND source_type = 'rss'
  AND feed_url IS NOT NULL; 