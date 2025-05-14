-- Create subscription tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,  -- Price in cents/sen
  price_yearly INTEGER NOT NULL,   -- Price in cents/sen
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (id, name, description, price_monthly, price_yearly, features)
VALUES
  ('free', 'Free', 'Basic access to AI news and trends', 0, 0, '["Limited articles", "Basic AI news"]'),
  ('professional', 'Professional', 'Enhanced access for individual professionals', 250000, 2500000, '["Full access to trends", "Implementation guides", "Personalized alerts"]'),
  ('team', 'Team', 'Collaborative features for teams', 1000000, 10000000, '["Team workspace", "Shared insights", "5 user accounts"]'),
  ('enterprise', 'Enterprise', 'Custom solutions for organizations', 5000000, 50000000, '["Custom adaptation roadmaps", "Private briefings", "API access"]');

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id TEXT NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user profiles table with Japanese-specific fields
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  industry TEXT,
  job_role TEXT,
  company_size TEXT,
  ai_experience TEXT,
  preferred_language TEXT DEFAULT 'ja',
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for secure access
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own subscription
CREATE POLICY "Users can view their own subscription" 
ON user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION create_default_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_profile();

-- Grant free subscription to new users
CREATE OR REPLACE FUNCTION grant_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, tier_id)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription on user creation
CREATE TRIGGER on_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION grant_free_subscription(); 