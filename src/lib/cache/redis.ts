'use server';

import { createClient } from 'redis';
import { mockRedis } from './mockRedis';

// Check if we should use mock Redis
const useMockRedis = process.env.USE_MOCK_REDIS === 'true';

type RedisClient = ReturnType<typeof createClient>;

export interface ICache {
  set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
  get<T = string>(key: string): Promise<T | null>;
  del(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  withCache<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
  getJson<T = any>(key: string): Promise<T | null>;
  setJson(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
  disconnect(): Promise<void>;
}

class RedisCache implements ICache {
  private static instance: RedisCache;
  private client: RedisClient;
  private isConnected: boolean = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {
    if (useMockRedis) {
      // Use mock Redis in test mode
      // @ts-ignore - MockRedis implements the same interface
      this.client = mockRedis;
      this.isConnected = true;
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = createClient({ 
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error('Too many retries on Redis. Connection terminated');
            return new Error('Redis connection failed after retries');
          }
          return Math.min(retries * 100, 5000);
        }
      }
    });
    
    // Handle connection events
    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Redis client connected');
    });
    this.client.on('end', () => {
      this.isConnected = false;
      console.log('Redis client disconnected');
    });
  }

  public static getInstance(): ICache {
    if (useMockRedis) {
      return mockRedis as unknown as ICache;
    }

    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected && !useMockRedis) {
      try {
        await this.client.connect();
        this.isConnected = true;
      } catch (error) {
        console.error('Redis connection error:', error);
        throw error;
      }
    }
  }

  public async get<T = string>(key: string): Promise<T | null> {
    try {
      await this.connect();
      const result = await this.client.get(key);
      return result as unknown as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  public async set(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    try {
      await this.connect();
      await this.client.set(key, value, { EX: ttlSeconds });
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      await this.connect();
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }

  public async getJson<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.get<string>(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis JSON parse error:', error);
      return null;
    }
  }

  public async setJson(key: string, value: unknown, ttlSeconds = 3600): Promise<boolean> {
    try {
      const json = JSON.stringify(value);
      return await this.set(key, json, ttlSeconds);
    } catch (error) {
      console.error('Redis JSON stringify error:', error);
      return false;
    }
  }

  public async withCache<T>(
    key: string, 
    fn: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<T> {
    try {
      const cached = await this.getJson<T>(key);
      if (cached !== null) {
        console.log(`Cache hit for key: ${key}`);
        return cached;
      }
      
      console.log(`Cache miss for key: ${key}`);
      const result = await fn();
      await this.setJson(key, result, ttlSeconds);
      return result;
    } catch (error) {
      console.error('Cache operation failed, falling back to direct call:', error);
      return await fn();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected && !useMockRedis) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

export const redisCache = RedisCache.getInstance();
