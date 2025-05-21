-- Add importance_score column
alter table public.news_items
add column if not exists importance_score numeric default 0;

-- Index for ordering by importance_score
create index if not exists idx_news_items_importance_score
  on public.news_items (importance_score desc);
