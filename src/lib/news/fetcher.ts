import Parser from 'rss-parser';
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient } from '@supabase/supabase-js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['source', 'source']
    ]
  }
});

// Initialize Supabase with validated env
const env = validateEnv();
const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function fetchAndStoreNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const sources = NEWS_SOURCES.filter(source => source.language === language);
  const items: NewsItem[] = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      
      const newsItems: NewsItem[] = feed.items.map(item => ({
        id: item.guid || item.link || '',
        title: item.title || '',
        url: item.link || '',
        source: source.name,
        published_date: new Date(item.pubDate || ''),
        language: source.language,
        summary: item.contentSnippet
      }));

      // Store in Supabase
      const { error } = await supabase
        .from('news_items')
        .upsert(
          newsItems,
          { onConflict: 'id' }
        );

      if (error) {
        console.error(`Error storing news from ${source.name}:`, error);
      } else {
        items.push(...newsItems);
      }
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
    }
  }

  return items;
}

export async function getLatestNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  console.log('Fetching news for language:', language);
  
  try {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .order('publishedDate', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching news:', error);
      return [];
    }

    console.log(`Found ${data?.length || 0} news items`);
    return data as NewsItem[];
  } catch (err) {
    console.error('Unexpected error fetching news:', err);
    return [];
  }
}
