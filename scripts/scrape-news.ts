import { NewsService } from '../src/lib/news-service';
import { saveNewsItems } from '../src/lib/supabase';

async function main() {
  const newsService = new NewsService();

  try {
    console.log('Starting news scraping...');
    
    // Fetch news from all sources
    const allNews = await newsService.fetchAllNews();
    console.log(`Fetched ${allNews.length} total news items`);

    // Save to Supabase
    await saveNewsItems(allNews);
    console.log('Successfully saved news items to database');

    // Get daily digest
    const dailyDigest = newsService.getDailyDigest(allNews);
    console.log('\nDaily Digest:');
    dailyDigest.forEach(item => {
      console.log(`- ${item.title.en || item.title.ja} (${item.source})`);
    });

  } catch (error) {
    console.error('Error in news scraping script:', error);
    process.exit(1);
  }
}

main();
