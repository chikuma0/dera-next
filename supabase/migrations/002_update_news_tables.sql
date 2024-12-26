-- Add missing columns and indices
alter table public.news_items
add column if not exists by text,
add column if not exists comments integer,
add column if not exists score integer;

-- Add indices for performance
create index if not exists idx_news_items_content_category on news_items using gin(content_category);
create index if not exists idx_news_items_source on news_items(source);
create index if not exists idx_news_items_by on news_items(by);

-- Update RLS policies
drop policy if exists "Enable read access for all users" on public.news_items;
create policy "Enable read access for all users"
  on public.news_items for select
  using (true);

-- Add function to clean old news items
create or replace function clean_expired_news_items()
returns trigger as $$
begin
  delete from public.news_items
  where expires_at < now();
  return null;
end;
$$ language plpgsql; 