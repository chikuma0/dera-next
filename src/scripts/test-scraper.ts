#!/usr/bin/env ts-node
import { NewsService } from '../lib/news/news-service';

async function testScraper(scraperName: string) {
  const service = new NewsService();
  const scraper = service.getScraper(scraperName);
  
  if (!scraper) {
    console.error(`Scraper "${scraperName}" not found`);
    process.exit(1);
  }

  try {
    console.log(`Testing ${scraperName}...`);
    const news = await scraper.fetchNews();
    console.log(`Found ${news.length} items`);
    console.log('\nSample item:');
    console.log(JSON.stringify(news[0], null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Allow running from command line
if (require.main === module) {
  const scraperName = process.argv[2];
  if (!scraperName) {
    console.error('Please provide a scraper name');
    process.exit(1);
  }
  testScraper(scraperName);
} 