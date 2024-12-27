import { NewsScraper } from '@/lib/news/base-scraper';

export class MockTechmemeScraper extends NewsScraper {
  constructor() {
    super('Techmeme');
  }

  protected fetchNewsInternal = jest.fn().mockResolvedValue([{
    id: 'test-1',
    title: 'Test Title',
    url: 'https://test.com',
    source: 'Test Source',
    publishedAt: new Date().toISOString(),
    priority: 'general',
    contentCategory: ['test']
  }]);
}

export const TechmemeScraper = jest.fn().mockImplementation(() => new MockTechmemeScraper()); 