import { BaseRssScraper } from '@/lib/news/base-rss-scraper';
import type { NewsItem } from '@/types';
import type Parser from 'rss-parser';

class MockVergeScraper extends BaseRssScraper {
  constructor() {
    super('The Verge', 'https://www.theverge.com/rss/index.xml');
  }

  // Make it public for testing
  mapToNewsItem(item: Parser.Item): NewsItem {
    return {
      id: 'test-1',
      title: 'Test Title',
      url: 'https://test.com',
      source: 'Test Source',
      publishedAt: new Date().toISOString(),
      priority: 'general',
      contentCategory: ['test']
    };
  }

  // Override fetchNewsInternal to use our mock data
  protected async fetchNewsInternal(): Promise<NewsItem[]> {
    return [{
      id: 'test-1',
      title: 'Test Title',
      url: 'https://test.com',
      source: 'Test Source',
      publishedAt: new Date().toISOString(),
      priority: 'general',
      contentCategory: ['test']
    }];
  }
}

const mockInstance = new MockVergeScraper();
export const VergeScraper = jest.fn().mockImplementation(() => mockInstance); 