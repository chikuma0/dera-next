import { parseStringPromise } from 'xml2js';
import { createServerClient } from '../supabase/client';
import { validateEnv } from '../config/env';
import https from 'https';

interface RssFeedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  'content:encoded'?: string;
  'media:content'?: {
    $: {
      url: string;
    };
  }[];
  enclosure?: {
    $: {
      url: string;
      type: string;
    };
  }[];
  category?: string | string[] | { _: string }[];
}

interface ProcessedNewsItem {
  title: string;
  url: string;
  summary?: string;
  content?: string;
  published_at: Date;
  image_url?: string;
  categories?: string[];
}

export class RssCollector {
  private supabase;
  
  constructor() {
    this.supabase = createServerClient();
  }
  
  /**
   * Fetch news from an RSS feed
   */
  async fetchFromRss(feedUrl: string): Promise<ProcessedNewsItem[]> {
    try {
      console.log(`Fetching RSS feed: ${feedUrl}`);
      const xml = await new Promise<string>((resolve, reject) => {
        https.get(feedUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(data);
          });
          res.on('error', (err) => {
            reject(err);
          });
        }).on('error', (err) => {
          reject(err);
        });
      });
      
      const result = await parseStringPromise(xml, { explicitArray: false });
      
      if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
        console.error(`Invalid RSS feed format for ${feedUrl}`);
        return [];
      }
      
      const items = Array.isArray(result.rss.channel.item) 
        ? result.rss.channel.item 
        : [result.rss.channel.item];
      
      console.log(`Found ${items.length} items in feed ${feedUrl}`);
      return items.map((item: RssFeedItem) => this.processRssItem(item));
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error);
      return [];
    }
  }
  
  /**
   * Process an RSS item to extract relevant information
   */
  private processRssItem(item: RssFeedItem): ProcessedNewsItem {
    // Extract image URL
    let imageUrl: string | undefined;
    
    if (item['media:content'] && Array.isArray(item['media:content'])) {
      const mediaContent = item['media:content'].find(m => 
        m.$ && m.$.url && (m.$.url.endsWith('.jpg') || m.$.url.endsWith('.png') || m.$.url.endsWith('.jpeg'))
      );
      if (mediaContent) {
        imageUrl = mediaContent.$.url;
      }
    } else if (item.enclosure && Array.isArray(item.enclosure)) {
      const image = item.enclosure.find(e => 
        e.$ && e.$.type && e.$.type.startsWith('image/')
      );
      if (image) {
        imageUrl = image.$.url;
      }
    }
    
    // Extract categories
    let categories: string[] = [];
    
    if (item.category) {
      if (Array.isArray(item.category)) {
        categories = item.category.map((cat: string | { _: string }) => {
          // Handle different category formats
          if (typeof cat === 'string') {
            return cat;
          } else if (cat && typeof cat === 'object' && '_' in cat) {
            return cat._;
          }
          return '';
        }).filter(Boolean);
      } else if (typeof item.category === 'string') {
        categories = [item.category];
      }
    }
    
    // Extract publication date
    let pubDate = new Date();
    if (item.pubDate) {
      pubDate = new Date(item.pubDate);
      // Handle invalid dates by using current date as fallback
      if (isNaN(pubDate.getTime())) {
        pubDate = new Date();
      }
    }
    
    return {
      title: item.title,
      url: item.link,
      summary: item.description,
      content: item['content:encoded'] || item.description,
      published_at: pubDate,
      image_url: imageUrl,
      categories: categories,
    };
  }
  
  /**
   * Save news items to the database using raw SQL
   */
  async saveNewsItems(sourceId: string, items: Array<ProcessedNewsItem>): Promise<number> {
    let savedCount = 0;
    
    for (const item of items) {
      try {
        console.log(`Processing news item: ${item.title}`);
        
        // Check if the news item already exists
        const { data: existingItems, error: existingError } = await this.supabase
          .from('news_items')
          .select('id')
          .eq('url', item.url)
          .limit(1);
        
        if (existingError) {
          console.error('Error checking existing item:', existingError);
          continue;
        }
        
        if (existingItems && existingItems.length > 0) {
          console.log(`Skipping existing item: ${item.title}`);
          continue;
        }
        
        // Insert the news item
        const { error: insertError } = await this.supabase
          .from('news_items')
          .insert({
            title: item.title,
            summary: item.summary,
            content: item.content,
            source_id: sourceId,
            url: item.url,
            published_date: item.published_at.toISOString(),
            image_url: item.image_url,
            status: 'pending',
            relevance_score: 0.0
          });
        
        if (insertError) {
          console.error('Error saving news item:', insertError);
          continue;
        }
        
        console.log(`Saved news item: ${item.title}`);
        savedCount++;
        
      } catch (error) {
        console.error('Error processing news item:', error);
      }
    }
    
    return savedCount;
  }
  
  /**
   * Process all RSS feeds for active sources
   */
  async processAllRssFeeds(): Promise<{ processed: number; saved: number }> {
    let totalProcessed = 0;
    let totalSaved = 0;
    
    try {
      // Get all active sources using direct query
      const { data: sources, error: sourcesError } = await this.supabase
        .from('news_sources')
        .select('id, feed_url')
        .eq('is_active', true)
        .eq('source_type', 'rss')
        .not('feed_url', 'is', null);
      
      if (sourcesError) {
        console.error('Error fetching sources:', sourcesError);
        return { processed: 0, saved: 0 };
      }
      
      for (const source of sources || []) {
        const items = await this.fetchFromRss(source.feed_url);
        totalProcessed += items.length;
        
        if (items.length > 0) {
          const savedCount = await this.saveNewsItems(source.id, items);
          totalSaved += savedCount;
        }
      }
    } catch (error) {
      console.error('Error processing RSS feeds:', error);
    }
    
    return { processed: totalProcessed, saved: totalSaved };
  }
} 