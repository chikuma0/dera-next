-- Add missing columns to news_items table
ALTER TABLE news_items
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')); 