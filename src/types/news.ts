// src/types/news.ts
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  source_id?: string;
  source_name?: string;
  source_logo?: string;
  image_url?: string;
  published_date: Date | string;
  language: 'en' | 'ja';
  summary?: string;
  content?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  importance_score?: number;
  relevance_score?: number;
  categories?: string[];
  translated_title?: string;
  translated_summary?: string;
  translation_status?: string;
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