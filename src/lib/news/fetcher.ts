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
    
    return data.items;
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
      
      const newsItems: NewsItem[] = items.map(item => {
        const newsItem = {
          id: item.guid || item.link || `${source.name}-${item.title}`,
          title: item.title?.trim() || '',
          url: item.link?.trim() || '',
          source: source.name,
          published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
          language,
          summary: item.description?.trim() || item.content?.trim() || '',
          created_at: new Date(),
          updated_at: new Date()
        };
        
        console.log('Processed item:', {
          id: newsItem.id,
          title: newsItem.title.substring(0, 50) + '...',
          source: newsItem.source,
          hasUrl: !!newsItem.url,
          pubDate: newsItem.published_date,
        });
        
        return newsItem;
      });

      const validItems = newsItems.filter(item => {
        const isValid = item.title && item.url;
        if (!isValid) {
          console.log('Filtered out invalid item:', {
            id: item.id,
            hasTitle: !!item.title,
            hasUrl: !!item.url,
          });
        }
        return isValid;
      });

      console.log(`Found ${validItems.length} valid items from ${source.name}`);

      // Store in batches to avoid potential payload size limits
      const batchSize = 50;
      for (let i = 0; i < validItems.length; i += batchSize) {
        const batch = validItems.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('news_items')
          .upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: true
          });

        if (error) {
          console.error(`Storage error for ${source.name} batch ${i}:`, error);
        } else {
          console.log(`Stored batch ${i}: ${data?.length || 0} items from ${source.name}`);
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
    // First verify the table exists and has the expected structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('news_items')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table verification error:', tableError);
      throw tableError;
    }

    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .order('published_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Database query error:', error);
      return [];
    }

    console.log(`Found ${data?.length || 0} items in database`);
    return data || [];
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}