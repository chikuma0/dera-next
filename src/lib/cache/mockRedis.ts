type CacheData = {
  [key: string]: {
    value: any;
    expires: number | null;
  };
};

export class MockRedisCache {
  private static instance: MockRedisCache;
  private data: CacheData = {};
  private isConnected = false;

  private constructor() {}

  public static getInstance(): MockRedisCache {
    if (!MockRedisCache.instance) {
      MockRedisCache.instance = new MockRedisCache();
      // Auto-connect for convenience in testing
      MockRedisCache.instance.connect().catch(console.error);
    }
    return MockRedisCache.instance;
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      this.isConnected = true;
      console.log('Mock Redis connected');
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Mock Redis disconnected');
  }

  async set(
    key: string,
    value: any,
    ttlSeconds?: number
  ): Promise<boolean> {
    await this.ensureConnected();
    const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.data[key] = { value: JSON.parse(JSON.stringify(value)), expires };
    return true;
  }

  async get<T = any>(key: string): Promise<T | null> {
    await this.ensureConnected();
    const item = this.data[key];
    if (!item) return null;

    // Check if the item has expired
    if (item.expires && item.expires < Date.now()) {
      delete this.data[key];
      return null;
    }

    return JSON.parse(JSON.stringify(item.value));
  }

  async del(key: string): Promise<boolean> {
    await this.ensureConnected();
    const exists = key in this.data;
    if (exists) {
      delete this.data[key];
      return true;
    }
    return false;
  }

  async keys(pattern: string): Promise<string[]> {
    await this.ensureConnected();
    // Convert pattern to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Object.keys(this.data).filter(key => regex.test(key));
  }

  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<T> {
    try {
      await this.ensureConnected();
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        console.log(`Cache hit for key: ${key}`);
        return cached;
      }

      console.log(`Cache miss for key: ${key}`);
      // If not in cache, execute the function and cache the result
      const result = await fn();
      await this.set(key, result, ttlSeconds);
      return result;
    } catch (error) {
      console.error('Mock Redis cache operation failed, falling back to direct call:', error);
      return await fn();
    }
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    const data = await this.get<string>(key);
    return data ? JSON.parse(data) : null;
  }

  async setJson(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    const json = JSON.stringify(value);
    return this.set(key, json, ttlSeconds);
  }

  // Clear all data (for testing)
  async flushAll(): Promise<void> {
    this.data = {};
  }

  // Get the current data (for testing)
  getData(): CacheData {
    return this.data;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }
}

// Singleton instance
export const mockRedis = MockRedisCache.getInstance();
