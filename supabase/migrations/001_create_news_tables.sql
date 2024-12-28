-- Create the news_items table
create table if not exists public.news_items (
  id text primary key,
  title text not null,
  url text not null,
  source text not null,
  published_date timestamp with time zone not null,
  language text not null check (language in ('en', 'ja')),
  summary text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add indices for better performance
create index if not exists idx_news_items_language_date 
  on public.news_items(language, published_date desc);

create index if not exists idx_news_items_source 
  on public.news_items(source);

-- Add RLS (Row Level Security) policies
alter table public.news_items enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on public.news_items for select
  using (true);

-- Add function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger for updated_at
create trigger set_updated_at
  before update on public.news_items
  for each row
  execute function public.handle_updated_at();

-- Add function to clean old news items (older than 30 days)
create or replace function public.clean_old_news_items()
returns void as $$
begin
  delete from public.news_items
  where published_date < now() - interval '30 days';
end;
$$ language plpgsql; 