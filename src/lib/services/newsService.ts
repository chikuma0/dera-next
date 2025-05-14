import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../config/env';
import { clientEnv } from '../config/clientEnv';
import { NewsItem as ExternalNewsItem } from '@/types/news';

export type NewsItem = ExternalNewsItem;

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  feed_url?: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
  priority: number;
  source_type: 'rss' | 'api' | 'twitter' | 'manual';
  scraping_config?: any;
}

export interface NewsCategory {
  id: string;
  name: string;
  description?: string;
}

export interface NewsTag {
  id: string;
  name: string;
}

export class NewsService {
  protected supabase;
  
  constructor() {
    const env = validateEnv();
    this.supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  }
  
  /**
   * Get a single news item by ID
   */
  async getNewsItem(id: string): Promise<NewsItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('news_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching news item:', error);
        return null;
      }

      return {
        ...data,
        published_date: new Date(data.published_date),
        created_at: data.created_at ? new Date(data.created_at) : new Date(),
        updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
      } as NewsItem;
    } catch (error) {
      console.error('Error in getNewsItem:', error);
      return null;
    }
  }

  /**
   * Get published news items with pagination
   */
  async getPublishedNews(page = 1, pageSize = 10, category?: string): Promise<{
    items: NewsItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      console.log('Fetching news with params:', { page, pageSize, category });
      
      // Ensure page is at least 1
      page = Math.max(1, page);
      const startIndex = (page - 1) * pageSize;

      // First get the total count
      let countQuery = this.supabase
        .from('published_news_with_categories')
        .select('*', { count: 'exact', head: true });

      if (category) {
        countQuery = countQuery.contains('categories', [category]);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error getting count:', countError);
        throw countError;
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // If no items, return empty result
      if (totalCount === 0) {
        return { items: [], totalCount, page, pageSize, totalPages };
      }

      // Then get the paginated data
      let query = this.supabase
        .from('published_news_with_categories')
        .select('*')
        .order('published_date', { ascending: false })
        .range(startIndex, startIndex + pageSize - 1);

      if (category) {
        query = query.contains('categories', [category]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching news items:', error);
        throw error;
      }

      const items = (data || []).map(item => ({
        ...item,
        published_date: new Date(item.published_date),
        created_at: item.created_at ? new Date(item.created_at) : new Date(),
        updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
      })) as NewsItem[];

      return {
        items,
        totalCount,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Error in getPublishedNews:', error);
      throw error;
    }
  }

  /**
   * Get news items by source ID
   */
  /**
   * Get all news categories
   */
  async getCategories(): Promise<NewsCategory[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  /**
   * Get news items by source ID
   */
  async getNewsBySource(sourceId: string, limit = 5): Promise<NewsItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_items')
        .select('*')
        .eq('source_id', sourceId)
        .order('published_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting news by source:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        published_date: new Date(item.published_date),
        created_at: item.created_at ? new Date(item.created_at) : new Date(),
        updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
      })) as NewsItem[];
    } catch (error) {
      console.error('Error in getNewsBySource:', error);
      throw error;
    }
  }

  /**
   * Search news items by query
   */
  async searchNews(query: string, limit = 10): Promise<NewsItem[]> {
    try {
      const { data, error } = await this.supabase.rpc('search_news', {
        search_term: query,
        result_limit: limit
      });

      if (error) {
        console.error('Error searching news:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        published_date: new Date(item.published_date),
        created_at: item.created_at ? new Date(item.created_at) : new Date(),
        updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
      })) as NewsItem[];
    } catch (error) {
      console.error('Error in searchNews:', error);
      throw error;
    }
  }
}
