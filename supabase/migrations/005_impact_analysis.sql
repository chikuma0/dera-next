-- 005_impact_analysis.sql

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create AI technologies table
CREATE TABLE IF NOT EXISTS public.ai_technologies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  maturity_level INTEGER, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create industries table
CREATE TABLE IF NOT EXISTS public.industries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add technology impact table (connects technologies to industries with impact metrics)
CREATE TABLE IF NOT EXISTS public.technology_industry_impacts (
  id SERIAL PRIMARY KEY,
  technology_id INTEGER REFERENCES public.ai_technologies(id) ON DELETE CASCADE,
  industry_id INTEGER REFERENCES public.industries(id) ON DELETE CASCADE,
  impact_level INTEGER NOT NULL, -- 1-10 scale
  time_horizon TEXT NOT NULL, -- 'immediate', 'short-term', 'medium-term', 'long-term'
  description TEXT,
  potential_outcomes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(technology_id, industry_id)
);

-- Create adoption metrics table
CREATE TABLE IF NOT EXISTS public.adoption_metrics (
  id SERIAL PRIMARY KEY,
  technology_id INTEGER REFERENCES public.ai_technologies(id) ON DELETE CASCADE,
  industry_id INTEGER REFERENCES public.industries(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  adoption_rate FLOAT, -- percentage
  investment_level BIGINT, -- in USD
  implementation_count INTEGER,
  success_rate FLOAT, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(technology_id, industry_id, metric_date)
);

-- Create implementation challenges table
CREATE TABLE IF NOT EXISTS public.implementation_challenges (
  id SERIAL PRIMARY KEY,
  technology_id INTEGER REFERENCES public.ai_technologies(id) ON DELETE CASCADE,
  industry_id INTEGER REFERENCES public.industries(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL, -- 'technical', 'organizational', 'regulatory', 'financial', 'cultural'
  severity_level INTEGER NOT NULL, -- 1-5 scale
  description TEXT NOT NULL,
  potential_solutions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create success stories table
CREATE TABLE IF NOT EXISTS public.success_stories (
  id SERIAL PRIMARY KEY,
  technology_id INTEGER REFERENCES public.ai_technologies(id) ON DELETE CASCADE,
  industry_id INTEGER REFERENCES public.industries(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  implementation_date DATE,
  description TEXT NOT NULL,
  outcomes TEXT[],
  roi_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_tech_impacts_tech_id ON public.technology_industry_impacts(technology_id);
CREATE INDEX IF NOT EXISTS idx_tech_impacts_industry_id ON public.technology_industry_impacts(industry_id);
CREATE INDEX IF NOT EXISTS idx_adoption_tech_id ON public.adoption_metrics(technology_id);
CREATE INDEX IF NOT EXISTS idx_adoption_industry_id ON public.adoption_metrics(industry_id);
CREATE INDEX IF NOT EXISTS idx_adoption_date ON public.adoption_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_challenges_tech_id ON public.implementation_challenges(technology_id);
CREATE INDEX IF NOT EXISTS idx_challenges_industry_id ON public.implementation_challenges(industry_id);
CREATE INDEX IF NOT EXISTS idx_success_tech_id ON public.success_stories(technology_id);
CREATE INDEX IF NOT EXISTS idx_success_industry_id ON public.success_stories(industry_id);

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_technologies
  BEFORE UPDATE ON public.ai_technologies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_industries
  BEFORE UPDATE ON public.industries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_impacts
  BEFORE UPDATE ON public.technology_industry_impacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_adoption
  BEFORE UPDATE ON public.adoption_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_challenges
  BEFORE UPDATE ON public.implementation_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_stories
  BEFORE UPDATE ON public.success_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some initial AI technologies
INSERT INTO public.ai_technologies (name, description, category, maturity_level) VALUES
('Large Language Models', 'Advanced AI models for natural language processing and generation', 'NLP', 4),
('Computer Vision', 'AI systems for visual data analysis and recognition', 'Vision', 5),
('Reinforcement Learning', 'AI systems that learn through interaction with environments', 'Learning', 3),
('Generative AI', 'AI systems that create new content', 'Creative', 4),
('Edge AI', 'AI systems optimized for edge computing', 'Infrastructure', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert some initial industries
INSERT INTO public.industries (name, description, sector) VALUES
('Healthcare', 'Medical and healthcare services', 'Healthcare'),
('Financial Services', 'Banking, insurance, and financial institutions', 'Finance'),
('Manufacturing', 'Production and manufacturing industries', 'Industrial'),
('Retail', 'Retail and e-commerce', 'Consumer'),
('Education', 'Educational institutions and services', 'Education')
ON CONFLICT (name) DO NOTHING;

-- Add sample technology impact data
INSERT INTO public.technology_industry_impacts (technology_id, industry_id, impact_level, time_horizon, description, potential_outcomes)
SELECT
  t.id,
  i.id,
  CASE
    WHEN i.name = 'Healthcare' THEN 8
    WHEN i.name = 'Financial Services' THEN 9
    WHEN i.name = 'Education' THEN 9
    WHEN i.name = 'Manufacturing' THEN 8
    WHEN i.name = 'Retail' THEN 7
    ELSE 7
  END as impact_level,
  CASE
    WHEN i.name IN ('Financial Services', 'Retail') THEN 'immediate'
    WHEN i.name IN ('Healthcare', 'Education') THEN 'short-term'
    ELSE 'medium-term'
  END as time_horizon,
  'Large Language Models are transforming ' || i.name || ' through advanced text processing and generation capabilities.',
  ARRAY[
    'Improved customer service through AI assistants',
    'Automated content creation and summarization',
    'Enhanced data analysis and insights generation',
    'Streamlined documentation and reporting'
  ]
FROM public.ai_technologies t, public.industries i
WHERE t.name = 'Large Language Models'
ON CONFLICT (technology_id, industry_id) DO NOTHING;