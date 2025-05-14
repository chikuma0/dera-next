-- Create function to update article scores
CREATE OR REPLACE FUNCTION public.update_article_score(
  article_id UUID,
  score FLOAT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE news_items
  SET importance_score = score,
      updated_at = NOW()
  WHERE id = article_id;
END;
$$; 