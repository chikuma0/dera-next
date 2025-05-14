import { Redis } from 'ioredis';
import { NewsItem } from '@/types/news';

export class NewsCache {
  private static instance: NewsCache;
  private client: Redis;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });
  }

  public static getInstance(): NewsCache {
    if (!NewsCache.instance) {
      NewsCache.instance = new NewsCache();
    }
    return NewsCache.instance;
  }

  private async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (!this.connectionPromise) {
      this.connectionPromise = new Promise((resolve, reject) => {
        if (this.isConnected) {
          resolve();
          return;
        }

        this.client.once('ready', () => {
          this.isConnected = true;
          this.connectionPromise = null;
          resolve();
        });

        this.client.once('error', (err: Error) => {
          this.connectionPromise = null;
          reject(err);
        });
      });
    }

    return this.connectionPromise;
  }

  async getNews(language: 'en' | 'ja', page: number, category?: string): Promise<NewsItem[] | null> {
    try {
      await this.connect();
      const key = this.getCacheKey(language, page, category);
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async setNews(language: 'en' | 'ja', page: number, news: NewsItem[], category?: string): Promise<void> {
    try {
      await this.connect();
      const key = this.getCacheKey(language, page, category);
      await this.client.set(key, JSON.stringify(news), 'EX', 3600); // Cache for 1 hour
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidateCache(): Promise<void> {
    try {
      await this.connect();
      await this.client.flushall();
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  private getCacheKey(language: 'en' | 'ja', page: number, category?: string): string {
    return `news:${language}:${page}${category ? `:${category}` : ''}`;
  }
} 