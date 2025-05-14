import { fetchAndStoreNews } from './fetcher';
import { NewsCache } from './cache';

export class NewsCollector {
  private cache: NewsCache;
  private isRunning = false;

  constructor() {
    this.cache = new NewsCache();
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Initial collection
    await this.collectNews();
    
    // Schedule periodic collection
    setInterval(() => {
      this.collectNews();
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }

  private async collectNews() {
    try {
      console.log('Starting news collection...');
      
      // Collect news for both languages
      const [enNews, jaNews] = await Promise.all([
        fetchAndStoreNews('en', true),
        fetchAndStoreNews('ja', true)
      ]);
      
      console.log(`Collected ${enNews.length} English and ${jaNews.length} Japanese news items`);
      
      // Invalidate cache to ensure fresh data
      await this.cache.invalidateCache();
      
      console.log('News collection completed');
    } catch (error) {
      console.error('Error in news collection:', error);
    }
  }
} 