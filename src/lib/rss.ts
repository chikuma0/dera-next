import Parser from 'rss-parser';
import { NewsItem, RSS_SOURCES } from '@/types/news';
import { createClient } from '@supabase/supabase-js';

const parser = new Parser();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchAndStoreFeeds(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  
  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      
      for (const item of feed.items) {
        const newsItem: NewsItem = {
          id: item.guid || item.link || '',
          title: item.title || '',
          url: item.link || '',
          source: source.name,
          publishedDate: new Date(item.pubDate || ''),
          language: source.language
        };
        
        // Store in Supabase
        const { error } = await supabase
          .from('news_items')
          .upsert([newsItem], {
            onConflict: 'id'
          });
          
        if (error) {
          console.error('Error storing news item:', error);
        } else {
          items.push(newsItem);
        }
      }
    } catch (error) {
      console.error(`Error fetching RSS from ${source.name}:`, error);
    }
  }
  
  return items;
}

export async function getLatestNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
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
  
  return data as NewsItem[];
}