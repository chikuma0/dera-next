'use server';

import { createClient } from 'redis';
import { mockRedis } from './mockRedis';

// Check if we should use mock Redis
const useMockRedis = process.env.USE_MOCK_REDIS === 'true';

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;
let isConnected = false;

async function getClient(): Promise<RedisClient> {
  if (useMockRedis) {
    return mockRedis as unknown as RedisClient;
  }

  if (!client) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    client = createClient({ 
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
    client.on('error', (err) => console.error('Redis Client Error:', err));
    client.on('connect', () => {
      isConnected = true;
      console.log('Redis client connected');
    });
    client.on('end', () => {
      isConnected = false;
      console.log('Redis client disconnected');
    });
  }

  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (error) {
      console.error('Redis connection error:', error);
      throw error;
    }
  }

  return client;
}

export async function getCache<T = string>(key: string): Promise<T | null> {
  try {
    const redis = await getClient();
    const result = await redis.get(key);
    return result as unknown as T;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
  try {
    const redis = await getClient();
    await redis.set(key, value, { EX: ttlSeconds });
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  try {
    const redis = await getClient();
    const result = await redis.del(key);
    return result > 0;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

export async function getCacheKeys(pattern: string): Promise<string[]> {
  try {
    const redis = await getClient();
    return await redis.keys(pattern);
  } catch (error) {
    console.error('Redis keys error:', error);
    return [];
  }
}

export async function getCacheJson<T = any>(key: string): Promise<T | null> {
  try {
    const data = await getCache<string>(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis JSON parse error:', error);
    return null;
  }
}

export async function setCacheJson(key: string, value: unknown, ttlSeconds = 3600): Promise<boolean> {
  try {
    const json = JSON.stringify(value);
    return await setCache(key, json, ttlSeconds);
  } catch (error) {
    console.error('Redis JSON stringify error:', error);
    return false;
  }
}

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 3600
): Promise<T> {
  try {
    const cached = await getCacheJson<T>(key);
    if (cached !== null) {
      console.log(`Cache hit for key: ${key}`);
      return cached;
    }
    
    console.log(`Cache miss for key: ${key}`);
    const result = await fn();
    await setCacheJson(key, result, ttlSeconds);
    return result;
  } catch (error) {
    console.error('Cache operation failed, falling back to direct call:', error);
    return await fn();
  }
}

export async function disconnectCache(): Promise<void> {
  if (client && isConnected && !useMockRedis) {
    await client.quit();
    isConnected = false;
  }
}
