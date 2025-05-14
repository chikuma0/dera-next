import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testRedisConnection() {
  try {
    console.log('Testing Redis connection...');
    console.log('Host:', process.env.REDIS_HOST);
    console.log('Port:', process.env.REDIS_PORT);
    
    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
      throw new Error('Redis host and port are required');
    }
    
    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      connectTimeout: 5000,
    });

    redis.on('connect', () => {
      console.log('✅ Successfully connected to Redis');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
      process.exit(1);
    });

    // Test basic operations
    await redis.set('test-key', 'Hello, Redis!');
    const value = await redis.get('test-key');
    console.log('Test key value:', value);
    
    // Test JSON operations
    await redis.set('test-json', JSON.stringify({ message: 'Test JSON' }));
    const jsonValue = await redis.get('test-json');
    console.log('Test JSON value:', JSON.parse(jsonValue || '{}'));
    
    console.log('✅ Redis connection test completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing Redis connection:', error);
    process.exit(1);
  }
}

testRedisConnection();
