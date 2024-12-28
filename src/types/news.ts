// src/types/news.ts
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedDate: Date;
  summary?: string;
  language: 'en' | 'ja';
}

export interface RSSSource {
  name: string;
  url: string;
  language: 'en' | 'ja';
}

// src/config/sources.ts
export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    language: 'en'
  },
  // Add more sources as needed
];