import { fetchAndStoreNews } from './fetcher';
import { NewsCache } from './cache';

export class NewsCollector {
  private cache: NewsCache;
  private isRunning = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = NewsCache.getInstance();
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
        fetchAndStoreNews('en'),
        fetchAndStoreNews('ja')
      ]);
      
      console.log(`Collected ${enNews.length} English and ${jaNews.length} Japanese news items`);
      
      // Invalidate cache to ensure fresh data
      await this.cache.invalidateCache();
      
      // Reset retry count on success
      this.retryCount = 0;
      
      console.log('News collection completed');
    } catch (error) {
      console.error('Error in news collection:', error);
      
      // Implement retry logic
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        console.log(`Retrying news collection in ${this.RETRY_DELAY/1000} seconds (attempt ${this.retryCount}/${this.MAX_RETRIES})`);
        
        setTimeout(() => {
          this.collectNews();
        }, this.RETRY_DELAY);
      } else {
        console.error('Max retries reached. Will try again on next scheduled interval.');
        this.retryCount = 0;
      }
    }
  }
} 