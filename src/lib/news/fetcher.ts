'use server';

// src/lib/news/fetcher.ts
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { withCache } from '@/lib/cache/redis';
import { SummaryService } from '@/lib/services/summaryService';
import { getBaseUrl } from '../getBaseUrl';

const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

function getSupabaseClient(): SupabaseClient {
  const env = validateEnv();
  return createClient(env.supabase.url, env.supabase.serviceRoleKey);
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchRSSWithProxy(url: string, retryCount = 0): Promise<any[]> {
  console.log('Fetching RSS with proxy:', url);
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=${process.env.RSS2JSON_API_KEY || ''}`;
  
  try {
    const response = await fetch(proxyUrl);
    
    if (response.status === 429) { // Rate limit
      if (retryCount < MAX_RETRIES) {
        console.log(`Rate limited, retrying in ${RETRY_DELAY/1000} seconds...`);
        await delay(RETRY_DELAY);
        return fetchRSSWithProxy(url, retryCount + 1);
      }
      throw new Error('Max retries reached for rate limit');
    }
    
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
      // Add delay between requests to respect rate limits
      await delay(RATE_LIMIT_DELAY);

      // First, get or create the news source
      const { data: sourceData, error: sourceError } = await supabase
        .from('news_sources')
        .upsert({
          name: source.name,
          url: source.url,
          feed_url: source.url,
          source_type: 'rss',
          is_active: true
        }, {
          onConflict: 'name'
        })
        .select()
        .single();

      if (sourceError) {
        console.error(`Error with source ${source.name}:`, sourceError);
        continue;
      }

      console.log(`Fetching from ${source.name}...`);
      const items = await fetchRSSWithProxy(source.url);
      
      const newsItems: NewsItem[] = items.map((item: any) => ({
        id: uuidv4(),
        title: item.title?.trim() || '',
        url: item.link?.trim() || '',
        source: source.name,
        source_id: sourceData.id,
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
            onConflict: 'url',
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

// Server-only function with Redis caching
export async function getLatestNewsWithCache(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const cacheKey = `news:latest:${language}`;
  try {
    const result = await withCache(cacheKey, async () => {
      return await getLatestNewsFromDB(language);
    }, 60); // 60 seconds TTL
    return Array.isArray(result) ? result : [];
  } catch (e) {
    return [];
  }
}

// Database-only function (no Redis)
async function getLatestNewsFromDB(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  console.log('Getting latest news from database:', language);
  const summaryService = new SummaryService();

  try {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', 'en') // Always fetch English base articles
      .order('published_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    if (!data) return [];

    // For Japanese, ensure each article has a translated summary
    if (language === 'ja') {
      for (const item of data) {
        if (!item.translated_summary) {
          try {
            // Generate summary with Perplexity
            const jaSummary = await summaryService.summarizeArticle(item.url, item.title);
            // Save to DB
            await supabase
              .from('news_items')
              .update({ translated_summary: jaSummary })
              .eq('id', item.id);
            item.translated_summary = jaSummary;
          } catch (err) {
            console.error('Failed to generate Japanese summary:', err);
            item.translated_summary = '';
          }
        }
      }
    }

    // Return news with the correct summary for the language
    return data.map(item => ({
      ...item,
      summary: language === 'ja' ? item.translated_summary || '' : item.summary || ''
    }));
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}

// Client-safe function that uses the API route
export async function getLatestNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  try {
    const baseUrl = await getBaseUrl();
    const url = new URL('/api/news', baseUrl || 'http://localhost:3000');
    url.searchParams.set('language', language);

    const response = await fetch(url.href);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}