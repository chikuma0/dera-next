-- Create news_item_categories junction table
CREATE TABLE IF NOT EXISTS news_item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_item_id UUID NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (news_item_id, category_id)
); 