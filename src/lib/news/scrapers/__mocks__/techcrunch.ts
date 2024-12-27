import { BaseRssScraper } from '@/lib/news/base-rss-scraper';
import type { NewsItem } from '@/types';
import type Parser from 'rss-parser';

const mockNewsItem: NewsItem = {
  id: 'test-1',
  title: 'Test Title',
  url: 'https://test.com',
  source: 'Test Source',
  publishedAt: new Date().toISOString(),
  priority: 'general',
  contentCategory: ['test']
};

// Create a proper mock that exposes the protected methods for testing
const mockMethods = {
  mapToNewsItem: jest.fn().mockReturnValue(mockNewsItem),
  fetchNewsInternal: jest.fn().mockResolvedValue([mockNewsItem]),
  determinePriority: jest.fn().mockReturnValue('general'),
  categorizeContent: jest.fn().mockReturnValue(['test']),
  fetchNews: jest.fn().mockResolvedValue([mockNewsItem])
};

class MockTechCrunchScraper extends BaseRssScraper {
  constructor() {
    super('TechCrunch', 'https://techcrunch.com/feed/');
    // Expose protected methods for testing
    Object.assign(this, mockMethods);
  }
}

// Create a spy object that wraps our mock instance
const mockInstance = new MockTechCrunchScraper();
export const TechCrunchScraper = jest.fn().mockImplementation(() => mockInstance); 