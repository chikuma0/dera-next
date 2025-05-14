// Load test configuration first
import '../scripts/test-config';

import { CachedNewsService } from '../src/lib/services/cachedNewsService';
import { NewsService } from '../src/lib/services/newsService';
import { NewsItem } from '../src/types/news';

// Mock data for testing
const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Test News 1',
    url: 'https://example.com/test1',
    source_id: 'test-source',
    source_name: 'Test Source',
    source_logo: 'https://example.com/logo.png',
    image_url: 'https://example.com/test1.jpg',
    published_date: new Date(),
    language: 'en',
    summary: 'Test description',
    created_at: new Date(),
    updated_at: new Date(),
    importance_score: 0.8,
    categories: ['test'],
    translated_title: 'テストニュース1',
    translated_summary: 'テスト説明'
  },
  {
    id: '2',
    title: 'Test News 2',
    url: 'https://example.com/test2',
    source_id: 'test-source',
    source_name: 'Test Source',
    source_logo: 'https://example.com/logo.png',
    image_url: 'https://example.com/test2.jpg',
    published_date: new Date(),
    language: 'en',
    summary: 'Another test description',
    created_at: new Date(),
    updated_at: new Date(),
    importance_score: 0.7,
    categories: ['test'],
    translated_title: 'テストニュース2',
    translated_summary: '別のテスト説明'
  }
];

// Create a mock NewsService
class MockNewsService extends NewsService {
  async getPublishedNews(page = 1, pageSize = 10, category?: string) {
    console.log(`Fetching news with params:`, { page, pageSize, category });
    const filteredItems = category 
      ? mockNewsItems.filter(item => item.categories?.includes(category))
      : mockNewsItems;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = filteredItems.slice(start, end);
    
    return {
      items: paginatedItems,
      totalCount: filteredItems.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredItems.length / pageSize)
    };
  }

  async getNewsItem(id: string): Promise<NewsItem | null> {
    console.log(`Fetching news item with id: ${id}`);
    return mockNewsItems.find(item => item.id === id) || null;
  }

  async getNewsBySource(sourceId: string, limit = 5): Promise<NewsItem[]> {
    console.log(`Fetching news by source: ${sourceId}, limit: ${limit}`);
    return mockNewsItems
      .filter(item => item.source_id === sourceId)
      .slice(0, limit);
  }

  async searchNews(query: string, limit = 10): Promise<NewsItem[]> {
    console.log(`Searching news with query: ${query}, limit: ${limit}`);
    return mockNewsItems
      .filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.summary?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
      .slice(0, limit);
  }
}

async function testCachedNewsService() {
  console.log('Testing CachedNewsService with test configuration...');
  
  // Create a mock news service and wrap it with caching
  const mockNewsService = new MockNewsService();
  const cachedNewsService = new CachedNewsService(mockNewsService);
  
  try {
    // Test getPublishedNews
    console.log('\n1. Testing getPublishedNews...');
    const page1 = await cachedNewsService.getPublishedNews(1, 2);
    console.log(`Fetched ${page1.items.length} news items (Page 1):`);
    page1.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.published_date})`);
    });
    
    // Test cache hit
    console.log('\n2. Testing cache hit...');
    const page1Cached = await cachedNewsService.getPublishedNews(1, 2);
    console.log(`Fetched ${page1Cached.items.length} news items from cache (Page 1):`);
    
    // Test getNewsItem
    console.log('\n3. Testing getNewsItem...');
    if (page1.items.length > 0) {
      const firstItem = page1.items[0];
      const newsItem = await cachedNewsService.getNewsItem(firstItem.id);
      if (newsItem) {
        console.log(`Fetched news item: ${newsItem.title}`);
        console.log(`Source: ${newsItem.source_id}`);
        console.log(`Published: ${newsItem.published_date}`);
      } else {
        console.error('Failed to fetch news item');
      }
    }
    
    // Test getNewsBySource
    console.log('\n4. Testing getNewsBySource...');
    const sourceNews = await cachedNewsService.getNewsBySource('test-source', 2);
    console.log(`Fetched ${sourceNews.length} news items from source 'test-source':`);
    sourceNews.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.source_id})`);
    });
    
    // Test searchNews
    console.log('\n5. Testing searchNews...');
    const searchResults = await cachedNewsService.searchNews('test', 2);
    console.log(`Found ${searchResults.length} news items matching 'test':`);
    searchResults.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
    });
    
    // Test cache invalidation
    console.log('\n6. Testing cache invalidation...');
    await cachedNewsService.invalidateNewsCache();
    console.log('News cache invalidated successfully');
    
    // Test cache after invalidation
    console.log('\n7. Testing cache after invalidation...');
    const pageAfterInvalidation = await cachedNewsService.getPublishedNews(1, 2);
    console.log(`Fetched ${pageAfterInvalidation.items.length} news items after invalidation (Page 1):`);
    
  } catch (error) {
    console.error('Error testing CachedNewsService:', error);
  }
}

// Run the tests
testCachedNewsService()
  .then(() => console.log('\nTests completed!'))
  .catch(console.error);
