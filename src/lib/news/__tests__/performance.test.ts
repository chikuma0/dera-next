import { NewsCache } from '../cache';
import { getLatestNews } from '../fetcher';
import { NewsCollector } from '../collector';
import { NewsItem } from '@/types/news';

describe('News System Performance Tests', () => {
  let cache: NewsCache;
  let collector: NewsCollector;

  beforeAll(() => {
    cache = new NewsCache();
    collector = new NewsCollector();
  });

  afterAll(async () => {
    await cache.invalidateCache();
  });

  test('Initial page load should be under 2 seconds', async () => {
    const startTime = Date.now();
    const news = await getLatestNews('en');
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(2000);
    expect(news.length).toBeGreaterThan(0);
  });

  test('Cached page load should be under 200ms', async () => {
    // First load to populate cache
    await cache.getNews('en', 1);
    
    const startTime = Date.now();
    const cachedNews = await cache.getNews('en', 1);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(200);
    expect(cachedNews).not.toBeNull();
  });

  test('News collector should complete within 30 seconds', async () => {
    const startTime = Date.now();
    await collector.start();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(30000);
  });

  test('Pagination should maintain consistent data', async () => {
    const page1 = await getLatestNews('en');
    const page2 = await getLatestNews('en');
    
    // Check that we're getting different items
    const page1Ids = new Set(page1.map(item => item.id));
    const page2Ids = new Set(page2.map(item => item.id));
    
    // Should have some overlap but not complete overlap
    const intersection = new Set([...page1Ids].filter(x => page2Ids.has(x)));
    expect(intersection.size).toBeLessThan(page1Ids.size);
    expect(intersection.size).toBeLessThan(page2Ids.size);
  });

  test('Cache invalidation should work correctly', async () => {
    // Set some test data
    const testData: NewsItem[] = [{
      id: 'test1',
      title: 'Test Article',
      url: 'https://example.com',
      source_id: 'test-source',
      published_date: new Date(),
      language: 'en',
      summary: 'Test summary',
      created_at: new Date(),
      updated_at: new Date()
    }];
    await cache.setNews('en', 1, testData);
    
    // Verify it's cached
    const cached = await cache.getNews('en', 1);
    expect(cached).toEqual(testData);
    
    // Invalidate cache
    await cache.invalidateCache();
    
    // Verify cache is cleared
    const afterInvalidation = await cache.getNews('en', 1);
    expect(afterInvalidation).toBeNull();
  });

  test('Error handling should not break the system', async () => {
    // Test with invalid parameters
    const invalidNews = await getLatestNews('invalid-language' as any);
    expect(invalidNews).toEqual([]);
    
    // Test with invalid page number
    const invalidPage = await cache.getNews('en', -1);
    expect(invalidPage).toBeNull();
  });
}); 