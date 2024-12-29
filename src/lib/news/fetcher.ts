// src/lib/news/fetcher.ts
import Parser from 'rss-parser';
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { articleService } from '../services/articleService';

// Interface definitions remain the same
interface RSSItem {
  guid?: string;
  link?: string;
  title?: string;
  pubDate?: string;
  description?: string;
  content?: string;
}

type CustomRSSParser = Parser<{[key: string]: any}, {
  mediaContent: string;
  source: string;
  summary: string;
}>;

const parser: CustomRSSParser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['source', 'source'],
      ['description', 'summary']
    ]
  },
  requestOptions: {
    headers: {
      'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
      'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
    }
  }
});

function getSupabaseClient(): SupabaseClient {
  const env = validateEnv();
  return createClient(env.supabase.url, env.supabase.serviceRoleKey);
}

async function fetchRSSWithProxy(url: string): Promise<RSSItem[]> {
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
    
    if (!Array.isArray(data.items)) {
      throw new Error('Invalid response format: items is not an array');
    }
    
    return data.items as RSSItem[];
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
      
      const newsItems: NewsItem[] = items.map((item: RSSItem) => ({
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

      // Store in batches and process with article service
      const batchSize = 50;
      for (let i = 0; i < validItems.length; i += batchSize) {
        const batch = validItems.slice(i, i + batchSize);
        
        // First, store the items
        const { data, error } = await supabase
          .from('news_items')
          .upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: true
          })
          .select();

        if (error) {
          console.error(`Storage error for ${source.name} batch ${i}:`, error);
          continue;
        }

        const insertedCount = Array.isArray(data) ? data.length : 0;
        console.log(`Stored batch ${i}: ${insertedCount} items from ${source.name}`);

        // Then, process them with article service
        if (data && data.length > 0) {
          console.log(`Processing ${data.length} articles with article service...`);
          const processedItems = await articleService.processArticleBatch(data);
          allItems.push(...processedItems);
          console.log(`Processed ${processedItems.length} articles successfully`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${source.name}:`, error);
    }
  }

  return allItems;
}

export async function getLatestNews(language: 'en' | 'ja' = 'en', sortBy: 'date' | 'score' = 'date'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  console.log('Getting latest news from database:', language, 'sorted by:', sortBy);

  try {
    const query = supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .limit(30);

    // Add sorting based on parameter
    if (sortBy === 'score') {
      query.order('importance_score', { ascending: false });
    } else {
      query.order('published_date', { ascending: false });
    }

    const { data, error } = await query;

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

// New function to get trending articles
export async function getTrendingNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .gte('published_date', twentyFourHoursAgo.toISOString())
      .order('importance_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching trending news:', error);
    return [];
  }
}