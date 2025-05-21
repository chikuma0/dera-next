import { getCache, setCache, deleteCache, withCache } from '@/lib/cache/redis';
import { NewsItem } from '@/types/news';

type Language = 'en' | 'ja';
type CacheKey = 'EN' | 'JA' | 'LAST_UPDATE';

export class NewsCache {
  private static instance: NewsCache;
  private readonly CACHE_TTL = 6 * 60 * 60; // 6 hours in seconds
  private readonly CACHE_PREFIX = 'news:';
  private readonly CACHE_KEYS: Record<CacheKey, string> = {
    EN: 'en',
    JA: 'ja',
    LAST_UPDATE: 'last_update'
  };

  private constructor() {}

  static getInstance(): NewsCache {
    if (!NewsCache.instance) {
      NewsCache.instance = new NewsCache();
    }
    return NewsCache.instance;
  }

  async getNews(language: Language): Promise<NewsItem[] | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${this.CACHE_KEYS[language.toUpperCase() as CacheKey]}`;
      const cachedData = await getCache<string>(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      // Check if cache is still valid
      const lastUpdate = await this.getLastUpdate();
      if (lastUpdate && Date.now() - lastUpdate > this.CACHE_TTL * 1000) {
        await this.invalidateCache();
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error getting news from cache:', error);
      return null;
    }
  }

  async setNews(language: Language, news: NewsItem[]): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${this.CACHE_KEYS[language.toUpperCase() as CacheKey]}`;
      await setCache(cacheKey, JSON.stringify(news), this.CACHE_TTL);
      await this.updateLastUpdate();
    } catch (error) {
      console.error('Error setting news in cache:', error);
    }
  }

  async invalidateCache(): Promise<void> {
    try {
      const keys = Object.values(this.CACHE_KEYS).map(key => `${this.CACHE_PREFIX}${key}`);
      await Promise.all(keys.map(key => deleteCache(key)));
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  private async getLastUpdate(): Promise<number | null> {
    try {
      const lastUpdate = await getCache<string>(`${this.CACHE_PREFIX}${this.CACHE_KEYS.LAST_UPDATE}`);
      return lastUpdate ? parseInt(lastUpdate, 10) : null;
    } catch (error) {
      console.error('Error getting last update timestamp:', error);
      return null;
    }
  }

  private async updateLastUpdate(): Promise<void> {
    try {
      await setCache(
        `${this.CACHE_PREFIX}${this.CACHE_KEYS.LAST_UPDATE}`,
        Date.now().toString(),
        this.CACHE_TTL
      );
    } catch (error) {
      console.error('Error updating last update timestamp:', error);
    }
  }
} 