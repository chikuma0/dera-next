-- Create a function to update a single article's score
CREATE OR REPLACE FUNCTION update_article_score(article_id uuid, score integer)
RETURNS void AS $$
BEGIN
  UPDATE news_items
  SET importance_score = score
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql; 