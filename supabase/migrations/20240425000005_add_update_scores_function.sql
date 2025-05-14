-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_importance_scores;

-- Create function to update importance scores
CREATE OR REPLACE FUNCTION update_importance_scores(score_data JSONB)
RETURNS void AS $$
BEGIN
  -- Update scores using a single query
  UPDATE news_items
  SET importance_score = (value->>'score')::double precision
  FROM jsonb_array_elements(score_data) AS value
  WHERE news_items.title = value->>'title';
END;
$$ LANGUAGE plpgsql; 