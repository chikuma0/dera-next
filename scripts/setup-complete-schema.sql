-- Create a function to execute SQL queries
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Drop existing tables and views with CASCADE
DROP VIEW IF EXISTS published_news_with_categories CASCADE;
DROP TABLE IF EXISTS news_item_categories CASCADE;
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS news_categories CASCADE;
DROP TABLE IF EXISTS news_sources CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create news sources table
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  feed_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 5,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create news categories table
CREATE TABLE news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create news items table
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_id UUID NOT NULL REFERENCES news_sources(id),
  url TEXT NOT NULL UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT,
  relevance_score FLOAT,
  importance_score FLOAT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for news items and categories
CREATE TABLE news_item_categories (
  news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  category_id UUID REFERENCES news_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (news_item_id, category_id)
);

-- Create view for published news with categories
CREATE VIEW published_news_with_categories AS
SELECT 
  ni.id,
  ni.title,
  ni.summary,
  ni.content,
  ni.source_id,
  ns.name as source_name,
  ni.url,
  ni.published_date,
  ni.collected_at,
  ni.image_url,
  ni.relevance_score,
  ni.importance_score,
  ni.status,
  array_agg(nc.name) as categories
FROM news_items ni
JOIN news_sources ns ON ni.source_id = ns.id
LEFT JOIN news_item_categories nic ON ni.id = nic.news_item_id
LEFT JOIN news_categories nc ON nic.category_id = nc.id
WHERE ni.status = 'published'
GROUP BY 
  ni.id, ni.title, ni.summary, ni.content, ni.source_id, ns.name,
  ni.url, ni.published_date, ni.collected_at, ni.image_url,
  ni.relevance_score, ni.importance_score, ni.status;

-- Create function to check if a news item exists
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

-- Create function to find or create a category
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

-- Create function to link news item to category
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

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema'; 