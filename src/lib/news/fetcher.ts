// src/lib/news/fetcher.ts
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseClient(): SupabaseClient {
  const env = validateEnv();
  return createClient(env.supabase.url, env.supabase.serviceRoleKey);
}

async function fetchRSSWithProxy(url: string): Promise<any[]> {
  console.log('Fetching RSS with proxy:', url);
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=${process.env.RSS2JSON_API_KEY || ''}`;
  
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('RSS proxy response:', {
      status: data.status,
      feed: data.feed?.title,
      itemCount: data.items?.length,
    });
    
    if (data.status !== 'ok') {
      throw new Error(`RSS proxy error: ${data.message || 'Unknown error'}`);
    }
    
    return data.items || [];
  } catch (error) {
    console.error('RSS fetch error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function fetchAndStoreNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  const sources = NEWS_SOURCES.filter(source => source.language === language);
  const allItems: NewsItem[] = [];

  console.log(`Starting fetch for ${sources.length} ${language} sources`);

  for (const source of sources) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const items = await fetchRSSWithProxy(source.url);
      
      const newsItems: NewsItem[] = items.map((item: any) => ({
        id: item.guid || item.link || `${source.name}-${item.title}`,
        title: item.title?.trim() || '',
        url: item.link?.trim() || '',
        source: source.name,
        published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
        language,
        summary: item.description?.trim() || item.content?.trim() || '',
        created_at: new Date(),
        updated_at: new Date()
      }));

      const validItems = newsItems.filter(item => item.title && item.url);
      console.log(`Found ${validItems.length} valid items from ${source.name}`);

      // Store in batches
      const batchSize = 50;
      for (let i = 0; i < validItems.length; i += batchSize) {
        const batch = validItems.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('news_items')
          .upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: true
          })
          .select();

        if (error) {
          console.error(`Storage error for ${source.name} batch ${i}:`, error);
        } else {
          const insertedCount = Array.isArray(data) ? data.length : 0;
          console.log(`Stored batch ${i}: ${insertedCount} items from ${source.name}`);
          allItems.push(...batch);
        }
      }
    } catch (error) {
      console.error(`Error processing ${source.name}:`, error);
    }
  }

  return allItems;
}

export async function getLatestNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  console.log('Getting latest news from database:', language);

  try {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .order('published_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}