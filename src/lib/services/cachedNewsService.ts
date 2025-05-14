import { NewsService, NewsItem } from './newsService';
import { redisCache } from '../cache/redis';

type CachedNewsItem = Omit<NewsItem, 'published_date'> & {
  published_date: string;
};

export class CachedNewsService extends NewsService {
  protected newsService: NewsService;
  private static CACHE_PREFIX = 'news:';
  private static DEFAULT_TTL = 300; // 5 minutes

  constructor(newsService?: NewsService) {
    super();
    this.newsService = newsService || new NewsService();
  }

  private getCacheKey(method: string, ...args: (string | number | undefined)[]): string {
    return `${CachedNewsService.CACHE_PREFIX}${method}:${args.filter(Boolean).join(':')}`;
  }

  async getPublishedNews(page = 1, pageSize = 10, category?: string) {
    const cacheKey = this.getCacheKey('getPublishedNews', String(page), String(pageSize), category || 'all');
    
    return redisCache.withCache(
      cacheKey,
      () => this.newsService.getPublishedNews(page, pageSize, category)
        .then(result => ({
          ...result,
          items: result.items.map(this.serializeNewsItem)
        })),
      CachedNewsService.DEFAULT_TTL
    ).then(result => ({
      ...result,
      items: result.items.map(this.deserializeNewsItem)
    }));
  }

  async getNewsItem(id: string): Promise<NewsItem | null> {
    const cacheKey = this.getCacheKey('getNewsItem', id);
    
    return redisCache.withCache<CachedNewsItem | null>(
      cacheKey,
      () => this.newsService.getNewsItem(id).then(item => item ? this.serializeNewsItem(item) : null),
      CachedNewsService.DEFAULT_TTL
    ).then(item => item ? this.deserializeNewsItem(item) : null);
  }

  async getNewsBySource(sourceId: string, limit = 5): Promise<NewsItem[]> {
    const cacheKey = this.getCacheKey('getNewsBySource', sourceId, String(limit));
    
    return redisCache.withCache<CachedNewsItem[]>(
      cacheKey,
      () => this.newsService.getNewsBySource?.(sourceId, limit)
        .then(items => items.map(this.serializeNewsItem))
        .catch(() => this.getNewsBySourceUncached(sourceId, limit).then(items => items.map(this.serializeNewsItem)))
        || this.getNewsBySourceUncached(sourceId, limit).then(items => items.map(this.serializeNewsItem)),
      CachedNewsService.DEFAULT_TTL
    ).then(items => items.map(this.deserializeNewsItem));
  }

  private async getNewsBySourceUncached(sourceId: string, limit: number): Promise<NewsItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_items')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'published')
        .order('published_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting news by source:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNewsBySourceUncached:', error);
      return [];
    }
  }

  async searchNews(query: string, limit = 10): Promise<NewsItem[]> {
    const cacheKey = this.getCacheKey('searchNews', query, String(limit));
    
    return redisCache.withCache<CachedNewsItem[]>(
      cacheKey,
      () => this.newsService.searchNews?.(query, limit)
        .then(items => items.map(this.serializeNewsItem))
        .catch(() => this.searchNewsUncached(query, limit).then(items => items.map(this.serializeNewsItem)))
        || this.searchNewsUncached(query, limit).then(items => items.map(this.serializeNewsItem)),
      CachedNewsService.DEFAULT_TTL
    ).then(items => items.map(this.deserializeNewsItem));
  }

  private async searchNewsUncached(query: string, limit: number): Promise<NewsItem[]> {
    try {
      const { data, error } = await this.supabase.rpc('search_news', {
        search_term: query,
        result_limit: limit
      });

      if (error) {
        console.error('Error searching news:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchNewsUncached:', error);
      return [];
    }
  }

  // Invalidate cache methods
  async invalidateNewsCache(): Promise<void> {
    try {
      const keys = await redisCache.keys(`${CachedNewsService.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisCache.del(key)));
      }
    } catch (error) {
      console.error('Error invalidating news cache:', error);
    }
  }

  async invalidateNewsItemCache(id: string): Promise<void> {
    try {
      const keys = await redisCache.keys(`${CachedNewsService.CACHE_PREFIX}*${id}*`);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisCache.del(key)));
      }
    } catch (error) {
      console.error('Error invalidating news item cache:', error);
    }
  }

  // Helper methods for serialization/deserialization
  private serializeNewsItem = (item: NewsItem): CachedNewsItem => ({
    ...item,
    published_date: item.published_date.toISOString()
  });

  private deserializeNewsItem = (item: CachedNewsItem): NewsItem => ({
    ...item,
    published_date: new Date(item.published_date)
  } as NewsItem);
}
