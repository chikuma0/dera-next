-- Add translation columns to news_items table
ALTER TABLE news_items
ADD COLUMN IF NOT EXISTS translated_title TEXT,
ADD COLUMN IF NOT EXISTS translated_summary TEXT,
ADD COLUMN IF NOT EXISTS translation_status TEXT CHECK (translation_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS translated_at TIMESTAMP WITH TIME ZONE;

-- Create index for translation status to improve query performance
CREATE INDEX IF NOT EXISTS idx_news_items_translation_status ON news_items(translation_status);

-- Add comment to explain the translation status
COMMENT ON COLUMN news_items.translation_status IS 'Status of the translation: pending, completed, or failed'; 