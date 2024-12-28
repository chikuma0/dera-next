# src/lib/types.ts
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  publishedDate: Date;
  source: string;
  language: 'en' | 'ja';
}

# src/lib/news-fetcher.ts
import Parser from 'rss-parser';
import { NewsItem } from './types';
import { createClient } from '@supabase/supabase-js';

const parser = new Parser({
  customFields: {
    item: [
      ['source', 'source']
    ]
  }
});

const GOOGLE_NEWS_FEEDS = {
  en: 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en',
  ja: 'https://news.google.com/rss/search?q=人工知能&hl=ja&gl=JP&ceid=JP:ja'
};

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(GOOGLE_NEWS_FEEDS[language]);
    
    const items: NewsItem[] = feed.items.map(item => ({
      id: item.guid || item.link || '',
      title: item.title || '',
      url: item.link || '',
      publishedDate: new Date(item.pubDate || ''),
      source: item.source || 'Google News',
      language
    }));

    // Store in Supabase
    const { error } = await supabase
      .from('news_items')
      .upsert(
        items,
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error storing news:', error);
    }

    return items;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getLatestNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('language', language)
    .order('publishedDate', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching from Supabase:', error);
    return [];
  }

  return data as NewsItem[];
}