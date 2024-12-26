-- Enable necessary extensions
create extension if not exists "vector" with schema "public";

-- Create enum for content priorities
create type content_priority as enum ('business', 'industry', 'implementation', 'general');

-- Create news_items table
create table if not exists public.news_items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null unique,
  source text not null,
  published_at timestamp with time zone not null,
  priority content_priority not null default 'general',
  relevance_score float not null default 0.0,
  content_category text[] not null default '{}',
  summary text,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  
  constraint relevance_score_range check (relevance_score >= 0 and relevance_score <= 1)
);

-- Create index for faster queries
create index news_items_priority_idx on public.news_items (priority);
create index news_items_relevance_score_idx on public.news_items (relevance_score);
create index news_items_published_at_idx on public.news_items (published_at);

-- Add RLS policies
alter table public.news_items enable row level security;

create policy "Enable read access for all users"
  on public.news_items for select
  using (true);

-- Function to clean expired news items
create or replace function clean_expired_news_items()
returns trigger as $$
begin
  delete from public.news_items
  where expires_at < now();
  return null;
end;
$$ language plpgsql;

-- Trigger to clean expired items daily
create trigger clean_expired_news_items_trigger
  after insert on public.news_items
  execute procedure clean_expired_news_items(); 