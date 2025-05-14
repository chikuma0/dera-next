import { fetchAndStoreNews } from './fetcher';
import { validateEnv } from '../config/env';

const FETCH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export class NewsScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    console.log('Starting news scheduler...');
    this.isRunning = true;
    
    // Initial fetch
    this.fetchNews();
    
    // Schedule periodic fetches
    this.timer = setInterval(() => {
      this.fetchNews();
    }, FETCH_INTERVAL);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('News scheduler stopped');
  }

  private async fetchNews() {
    try {
      console.log('Starting scheduled news fetch...');
      const env = validateEnv();
      
      // Fetch for both languages
      await Promise.all([
        fetchAndStoreNews('en', true),
        fetchAndStoreNews('ja', true)
      ]);
      
      console.log('Scheduled news fetch completed');
    } catch (error) {
      console.error('Error in scheduled news fetch:', error);
    }
  }
} 