-- Seed initial AI news sources for RSS aggregation

-- Tech news sources with AI sections
INSERT INTO news_sources (name, url, feed_url, source_type, priority, logo_url, description, is_active)
VALUES 
  ('VentureBeat AI', 'https://venturebeat.com/category/ai/', 'https://venturebeat.com/category/ai/feed/', 'rss', 8, 'https://venturebeat.com/wp-content/themes/vb-news/img/favicon.ico', 'AI news and analysis from VentureBeat', true),
  
  ('TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'rss', 8, 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', 'AI startup and technology news from TechCrunch', true),
  
  ('MIT Technology Review', 'https://www.technologyreview.com/topic/artificial-intelligence/', 'https://www.technologyreview.com/feed/', 'rss', 9, 'https://wp-cdn.technologyreview.com/uploads/2020/10/Screen-Shot-2020-10-29-at-3.29.28-PM-16.png', 'AI research and impact analysis from MIT Technology Review', true),
  
  ('Wired AI', 'https://www.wired.com/tag/artificial-intelligence/', 'https://www.wired.com/feed/tag/artificial-intelligence/rss', 'rss', 7, 'https://www.wired.com/assets/favicon-32x32-4622892323e95e229bfb4b6f9a36cbbe71f9ee7267a65c5a1be888970bcad2d5.png', 'AI stories from Wired', true);

-- AI research blogs
INSERT INTO news_sources (name, url, feed_url, source_type, priority, logo_url, description, is_active)
VALUES
  ('Google AI Blog', 'https://ai.googleblog.com/', 'https://ai.googleblog.com/feeds/posts/default', 'rss', 9, 'https://ai.googleblog.com/favicon.ico', 'Research and perspectives from Google AI team', true),
  
  ('OpenAI Blog', 'https://openai.com/blog/', 'https://openai.com/blog/rss.xml', 'rss', 10, 'https://openai.com/favicon.ico', 'Research and announcements from OpenAI', true),
  
  ('Microsoft Research AI', 'https://www.microsoft.com/en-us/research/blog/category/artificial-intelligence/', 'https://www.microsoft.com/en-us/research/feed/', 'rss', 8, 'https://www.microsoft.com/favicon.ico', 'AI research from Microsoft Research', true);

-- Japanese AI news sources
INSERT INTO news_sources (name, url, feed_url, source_type, priority, logo_url, description, is_active)
VALUES
  ('AIトレンド', 'https://ainow.ai/', 'https://ainow.ai/feed/', 'rss', 9, 'https://ainow.ai/wp-content/uploads/2019/03/cropped-favicon-512-32x32.png', '日本のAI動向ニュースサイト', true),
  
  ('Ledge.ai', 'https://ledge.ai/', 'https://ledge.ai/feed/', 'rss', 8, 'https://ledge.ai/wp-content/uploads/2018/04/cropped-ledge_favicon-32x32.png', '国内最大級のAI専門メディア', true),
  
  ('AIポータル', 'https://www.atmarkit.co.jp/ait/subtop/ai.html', 'https://rss.itmedia.co.jp/rss/2.0/ait_subtop_ai.xml', 'rss', 7, 'https://www.atmarkit.co.jp/favicon.ico', '@ITのAI/機械学習の記事', true);

-- AI research journals
INSERT INTO news_sources (name, url, feed_url, source_type, priority, logo_url, description, is_active)
VALUES
  ('arXiv AI', 'https://arxiv.org/list/cs.AI/recent', 'http://export.arxiv.org/rss/cs.AI', 'rss', 6, 'https://static.arxiv.org/static/browse/0.3.4/images/icons/favicon.ico', 'Recent AI research papers from arXiv', true),
  
  ('Nature Machine Intelligence', 'https://www.nature.com/natmachintell/', 'https://www.nature.com/natmachintell.rss', 'rss', 8, 'https://www.nature.com/favicon.ico', 'Research from Nature Machine Intelligence journal', true);

-- Run the collection job to start populating the database
-- This would typically be done via a scheduled job, but for demo purposes we can trigger it here
-- This is just a comment as SQL can't directly trigger API calls 