import Parser from 'rss-parser';
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient } from '@supabase/supabase-js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['source', 'source'],
      ['description', 'summary']
    ],
    headers: {
      'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
      'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
    }
  }
});

function getSupabaseClient() {
  const env = validateEnv();
  return createClient(env.supabase.url, env.supabase.serviceRoleKey);
}

async function fetchRSSWithProxy(url: string) {
  console.log('Fetching RSS with proxy:', url);
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const data = await response.json();
  
  if (data.status !== 'ok') {
    console.error('RSS proxy error:', data);
    throw new Error(`Failed to fetch RSS feed: ${data.message || 'Unknown error'}`);
  }
  
  console.log(`RSS proxy success: found ${data.items?.length || 0} items`);
  return data.items;
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
      
      const newsItems: NewsItem[] = items.map(item => ({
        id: item.guid || item.link || `${source.name}-${item.title}`,
        title: item.title || '',
        url: item.link || '',
        source: source.name,
        published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
        language,
        summary: item.description || '',
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Filter out items without titles or URLs
      const validItems = newsItems.filter(item => item.title && item.url);
      console.log(`Found ${validItems.length} valid items from ${source.name}`);

      // Store in database
      const { data, error } = await supabase
        .from('news_items')
        .upsert(validItems, {
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (error) {
        console.error(`Storage error for ${source.name}:`, error);
      } else {
        console.log(`Stored ${data?.length || 0} items from ${source.name}`);
        allItems.push(...validItems);
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

    console.log(`Found ${data?.length || 0} items in database`);
    return data || [];
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}