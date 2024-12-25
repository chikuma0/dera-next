import type { NewsResponse } from '@/types';
import { HackerNewsScraper } from './scrapers/hackernews';

export class NewsService {
  private scraper: HackerNewsScraper;

  constructor() {
    this.scraper = new HackerNewsScraper();
  }

  async getNews(): Promise<NewsResponse> {
    try {
      const items = await this.scraper.fetchNews();
      return { items };
    } catch (error) {
      return {
        items: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}