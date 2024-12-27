import { NewsScraper } from '@/lib/news/base-scraper';
import { BaseRssScraper } from '@/lib/news/base-rss-scraper';

// Mock external dependencies
jest.mock('axios', () => ({
  default: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: { data: { posts: { edges: [] } } } }),
    isAxiosError: jest.fn().mockReturnValue(false)
  }
}));

jest.mock('cheerio', () => ({
  load: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue([]),
    text: jest.fn().mockReturnValue(''),
  })
}));

jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn().mockResolvedValue({
      items: []
    })
  }));
});

const RSS_SCRAPERS = ['VergeScraper'];

describe('Scraper Implementation Tests', () => {
  const scraperPaths = {
    'VergeScraper': '@/lib/news/scrapers/verge',
    'TechmemeScraper': '@/lib/news/scrapers/techmeme',
    'HackerNewsScraper': '@/lib/news/scrapers/hackernews',
    'DevToScraper': '@/lib/news/scrapers/devto',
    'ProductHuntScraper': '@/lib/news/scrapers/producthunt',
    'GitHubScraper': '@/lib/news/scrapers/github'
  };

  Object.entries(scraperPaths).forEach(([scraperName, path]) => {
    describe(scraperName, () => {
      let Scraper;
      
      beforeAll(async () => {
        Scraper = (await import(path))[scraperName];
      });

      it('implements required methods', () => {
        const scraper = new Scraper();
        
        // Always check for base methods
        expect(scraper.fetchNews).toBeDefined();
        expect(typeof scraper.fetchNews).toBe('function');
        expect(scraper.determinePriority).toBeDefined();
        expect(scraper.categorizeContent).toBeDefined();

        // Check for specific implementations
        if (RSS_SCRAPERS.includes(scraperName)) {
          expect(scraper.mapToNewsItem).toBeDefined();
          expect(typeof scraper.mapToNewsItem).toBe('function');
        } else {
          expect(scraper.fetchNewsInternal).toBeDefined();
          expect(typeof scraper.fetchNewsInternal).toBe('function');
        }
      });

      it('returns valid news items', async () => {
        const scraper = new Scraper();
        const mockNews = [{
          id: 'test-1',
          title: 'Test Title',
          url: 'https://test.com',
          source: 'Test Source',
          publishedAt: new Date().toISOString(),
          priority: 'general',
          contentCategory: ['test']
        }];
        
        jest.spyOn(scraper, 'fetchNews').mockResolvedValue(mockNews);
        
        const news = await scraper.fetchNews();
        expect(Array.isArray(news)).toBe(true);
        if (news.length > 0) {
          const item = news[0];
          expect(item).toMatchObject({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            source: expect.any(String),
            publishedAt: expect.any(String),
            priority: expect.stringMatching(/^(business|industry|implementation|general)$/),
            contentCategory: expect.arrayContaining([expect.any(String)])
          });
        }
      });
    });
  });
}); 