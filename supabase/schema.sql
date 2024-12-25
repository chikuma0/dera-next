create table public.news (
  id text primary key,
  title jsonb not null,
  summary jsonb not null,
  url text not null,
  source text not null,
  application_category jsonb not null,
  published_at timestamp with time zone not null,
  importance integer not null,
  points integer,
  comments integer,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.news enable row level security;

-- Create policy for public read access
create policy "Allow public read access"
  on public.news
  for select
  to public
  using (true);

-- Create policy for service role write access
create policy "Allow service role write access"
  on public.news
  for all
  to service_role
  using (true);

-- Create index for faster queries
create index news_published_at_idx on public.news (published_at desc);
create index news_importance_idx on public.news (importance desc);

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger to update updated_at on row update
create trigger update_news_updated_at
  before update
  on public.news
  for each row
  execute function public.update_updated_at_column();
