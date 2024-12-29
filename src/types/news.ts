// src/types/news.ts
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published_date: Date;
  language: 'en' | 'ja';
  summary?: string;
  created_at?: Date;
  updated_at?: Date;
  importance_score?: number;
  categories?: string[];
}

export interface RSSSource {
  name: string;
  url: string;
  language: 'en' | 'ja';
}

export const NEWS_SOURCES: RSSSource[] = [
  {
    name: 'Google News - AI',
    url: 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en',
    language: 'en'
  },
  {
    name: 'Google News - AI (Japanese)',
    url: 'https://news.google.com/rss/search?q=人工知能&hl=ja&gl=JP&ceid=JP:ja',
    language: 'ja'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    language: 'en'
  }
];