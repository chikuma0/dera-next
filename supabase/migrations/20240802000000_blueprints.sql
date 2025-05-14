-- Create blueprint categories table (for reference)
CREATE TABLE IF NOT EXISTS blueprint_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO blueprint_categories (id, name, description)
VALUES
  ('natural_language_processing', '自然言語処理', 'テキストデータの処理、分析、翻訳などの技術'),
  ('computer_vision', 'コンピュータビジョン', '画像や動画を理解し処理する技術'),
  ('generative_ai', '生成型AI', 'テキスト、画像、音楽などのコンテンツを生成する技術'),
  ('recommendation_systems', 'レコメンデーションシステム', 'ユーザーの好みに合わせた提案を行うシステム'),
  ('chatbots', 'チャットボット', '自然な会話を通じてユーザーとやり取りするAI'),
  ('data_analysis', 'データ分析', 'データからパターンや洞察を抽出する技術'),
  ('workflow_automation', 'ワークフロー自動化', 'ビジネスプロセスを自動化する技術'),
  ('document_processing', '文書処理', '文書の解析、分類、情報抽出を行う技術'),
  ('speech_recognition', '音声認識', '音声をテキストに変換し理解する技術'),
  ('customer_service', 'カスタマーサービス', '顧客サポートを強化するAI技術'),
  ('manufacturing', '製造業', '製造プロセスを最適化するAI技術'),
  ('healthcare', 'ヘルスケア', '医療や健康管理に活用されるAI技術'),
  ('finance', '金融', '金融サービスにおけるAI活用'),
  ('retail', '小売', '小売業におけるAI活用'),
  ('education', '教育', '教育分野におけるAI活用');

-- Create blueprint difficulty levels table (for reference)
CREATE TABLE IF NOT EXISTS blueprint_difficulty_levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default difficulty levels
INSERT INTO blueprint_difficulty_levels (id, name, description)
VALUES
  ('beginner', '初級', 'プログラミングの基本知識があれば実装可能'),
  ('intermediate', '中級', '関連するAI技術の基本的な理解が必要'),
  ('advanced', '上級', '深い技術知識と実装経験が必要');

-- Create programming languages table (for reference)
CREATE TABLE IF NOT EXISTS programming_languages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default programming languages
INSERT INTO programming_languages (id, name, display_name)
VALUES
  ('python', 'Python', 'Python'),
  ('javascript', 'JavaScript', 'JavaScript'),
  ('typescript', 'TypeScript', 'TypeScript'),
  ('java', 'Java', 'Java'),
  ('csharp', 'C#', 'C#'),
  ('go', 'Go', 'Go'),
  ('ruby', 'Ruby', 'Ruby'),
  ('other', 'Other', 'その他');

-- Create implementation blueprints table
CREATE TABLE IF NOT EXISTS implementation_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES blueprint_categories(id),
  difficulty_id TEXT NOT NULL REFERENCES blueprint_difficulty_levels(id),
  estimated_time TEXT NOT NULL,
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  japanese_cultural_considerations TEXT NOT NULL,
  japanese_regulatory_notes TEXT NOT NULL,
  japanese_market_adaptation TEXT NOT NULL,
  japanese_success_examples TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2),
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blueprint programming languages junction table
CREATE TABLE IF NOT EXISTS blueprint_programming_languages (
  blueprint_id UUID NOT NULL REFERENCES implementation_blueprints(id) ON DELETE CASCADE,
  language_id TEXT NOT NULL REFERENCES programming_languages(id),
  PRIMARY KEY (blueprint_id, language_id)
);

-- Create blueprint steps table
CREATE TABLE IF NOT EXISTS blueprint_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES implementation_blueprints(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT,
  code_language TEXT REFERENCES programming_languages(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blueprint_id, step_number)
);

-- Create blueprint resources table
CREATE TABLE IF NOT EXISTS blueprint_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES implementation_blueprints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('template', 'documentation', 'example', 'tool', 'library')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blueprint ratings table
CREATE TABLE IF NOT EXISTS blueprint_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES implementation_blueprints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blueprint_id, user_id)
);

-- Create blueprint views table for analytics
CREATE TABLE IF NOT EXISTS blueprint_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES implementation_blueprints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update implementation blueprint rating when a new rating is added
CREATE OR REPLACE FUNCTION update_blueprint_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE implementation_blueprints 
  SET 
    rating = (
      SELECT AVG(rating)::numeric(3,2) 
      FROM blueprint_ratings 
      WHERE blueprint_id = NEW.blueprint_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM blueprint_ratings 
      WHERE blueprint_id = NEW.blueprint_id
    ),
    updated_at = NOW()
  WHERE id = NEW.blueprint_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update ratings
CREATE TRIGGER after_blueprint_rating_insert_or_update
AFTER INSERT OR UPDATE ON blueprint_ratings
FOR EACH ROW EXECUTE FUNCTION update_blueprint_rating();

-- Function to increment view count when a view is recorded
CREATE OR REPLACE FUNCTION increment_blueprint_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE implementation_blueprints 
  SET 
    view_count = view_count + 1,
    updated_at = NOW()
  WHERE id = NEW.blueprint_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to increment view count
CREATE TRIGGER after_blueprint_view_insert
AFTER INSERT ON blueprint_views
FOR EACH ROW EXECUTE FUNCTION increment_blueprint_view_count();

-- RLS Policies
ALTER TABLE implementation_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_programming_languages ENABLE ROW LEVEL SECURITY;

-- Everyone can view published blueprints
CREATE POLICY "Anyone can view published blueprints" 
ON implementation_blueprints FOR SELECT 
USING (is_published = true);

-- Only authenticated users can rate
CREATE POLICY "Authenticated users can rate blueprints" 
ON blueprint_ratings FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Users can only update or delete their own ratings
CREATE POLICY "Users can update their own ratings" 
ON blueprint_ratings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON blueprint_ratings FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Anyone can view blueprint steps and resources of published blueprints
CREATE POLICY "Anyone can view blueprint steps of published blueprints" 
ON blueprint_steps FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM implementation_blueprints 
    WHERE id = blueprint_steps.blueprint_id AND is_published = true
  )
);

CREATE POLICY "Anyone can view blueprint resources of published blueprints" 
ON blueprint_resources FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM implementation_blueprints 
    WHERE id = blueprint_resources.blueprint_id AND is_published = true
  )
);

-- Anyone can view blueprint programming languages of published blueprints
CREATE POLICY "Anyone can view blueprint programming languages of published blueprints" 
ON blueprint_programming_languages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM implementation_blueprints 
    WHERE id = blueprint_programming_languages.blueprint_id AND is_published = true
  )
);

-- Views can be recorded for any user
CREATE POLICY "Views can be recorded for any blueprint" 
ON blueprint_views FOR INSERT 
WITH CHECK (true);