import { NewsItem } from '@/types/news';
import { HackerNewsScraper } from './scrapers/hackernews';

export class NewsService {
  private scrapers = [
    new HackerNewsScraper({ translate: true }),
    // TODO: Add more scrapers
  ];

  async fetchAllNews(): Promise<NewsItem[]> {
    try {
      // Run all scrapers in parallel
      const results = await Promise.allSettled(
        this.scrapers.map(scraper => {
          console.log(`Fetching from ${scraper.name}...`);
          return scraper.fetchNews();
        })
      );

      // Collect successful results
      const allNews: NewsItem[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`Successfully fetched ${result.value.length} items from ${this.scrapers[index].name}`);
          allNews.push(...result.value);
        } else {
          console.error(`Failed to fetch from ${this.scrapers[index].name}:`, result.reason);
        }
      });

      // Sort by importance and date
      return this.sortNews(allNews);
    } catch (error) {
      console.error('Error in fetchAllNews:', error);
      return [];
    }
  }

  private sortNews(news: NewsItem[]): NewsItem[] {
    return news.sort((a, b) => {
      // First sort by importance
      const importanceDiff = b.importance - a.importance;
      if (importanceDiff !== 0) return importanceDiff;
      
      // Then by date
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }

  getTopNews(news: NewsItem[], count: number = 5): NewsItem[] {
    return news.slice(0, count);
  }

  getDailyDigest(news: NewsItem[]): NewsItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return news
      .filter(item => {
        const itemDate = new Date(item.publishedAt);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      })
      .slice(0, 10); // Top 10 items
  }
}
