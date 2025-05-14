-- Drop existing constraints if they exist
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE IF EXISTS news_items 
        DROP CONSTRAINT IF EXISTS news_items_url_key;
        
    ALTER TABLE IF EXISTS news_sources 
        DROP CONSTRAINT IF EXISTS news_sources_name_key;
        
    ALTER TABLE IF EXISTS news_categories 
        DROP CONSTRAINT IF EXISTS news_categories_name_key;
        
    ALTER TABLE IF EXISTS news_item_categories 
        DROP CONSTRAINT IF EXISTS news_item_categories_pkey;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Add constraints
ALTER TABLE news_items 
    ADD CONSTRAINT news_items_url_key UNIQUE (url);

ALTER TABLE news_sources 
    ADD CONSTRAINT news_sources_name_key UNIQUE (name);

ALTER TABLE news_categories 
    ADD CONSTRAINT news_categories_name_key UNIQUE (name);

ALTER TABLE news_item_categories 
    ADD CONSTRAINT news_item_categories_pkey PRIMARY KEY (news_item_id, category_id); 