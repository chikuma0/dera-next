-- Create pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some initial categories matching the mock data
INSERT INTO news_categories (name, description)
VALUES 
  ('AI & ML', 'Artificial Intelligence and Machine Learning news'),
  ('Startups', 'AI startup news and funding'),
  ('Research', 'Academic AI research and papers'),
  ('Industry', 'Industry applications of AI'),
  ('Policy', 'AI regulation and policy news')
ON CONFLICT (name) DO NOTHING; 