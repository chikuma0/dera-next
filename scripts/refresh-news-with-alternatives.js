// scripts/refresh-news-with-alternatives.js
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Use dynamic imports for Next.js modules
async function importModules() {
  // Import the fetcher module
  const fetcherPath = path.join(process.cwd(), 'src/lib/news/fetcher.js');
  const { fetchAndStoreNews } = await import('file://' + fetcherPath);
  
  // Import the ArticleService module
  const articleServicePath = path.join(process.cwd(), 'src/lib/services/articleService.js');
  const { ArticleService } = await import('file://' + articleServicePath);
  
  return { fetchAndStoreNews, ArticleService };
}

// Load environment variables
require('dotenv').config();

async function refreshNewsWithAlternatives() {
  try {
    // Import the modules
    const { fetchAndStoreNews, ArticleService } = await importModules();
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Starting news refresh with alternative sources...');
    
    // Fetch news for English
    console.log('Fetching English news...');
    const enItems = await fetchAndStoreNews('en', true);
    console.log(`Fetched ${enItems.length} English news items`);
    
    // Fetch news for Japanese
    console.log('Fetching Japanese news...');
    const jaItems = await fetchAndStoreNews('ja', true);
    console.log(`Fetched ${jaItems.length} Japanese news items`);
    
    // Update scores for all articles
    console.log('Updating scores for all articles...');
    const articleService = new ArticleService();
    await articleService.updateArticleScores();
    
    // Get top articles to display results
    console.log('\nTop English Articles:');
    const topEnArticles = await articleService.getTopArticles('en', 5);
    topEnArticles.forEach((article, index) => {
      console.log(`${index + 1}. [${article.source}] ${article.title} (Score: ${article.score_breakdown.total})`);
    });
    
    if (process.env.NEXT_PUBLIC_LANGUAGE_SUPPORT === 'true') {
      console.log('\nTop Japanese Articles:');
      const topJaArticles = await articleService.getTopArticles('ja', 5);
      topJaArticles.forEach((article, index) => {
        console.log(`${index + 1}. [${article.source}] ${article.title} (Score: ${article.score_breakdown.total})`);
      });
    }
    
    console.log('\nNews refresh complete!');
  } catch (error) {
    console.error('Error during news refresh:', error);
    process.exit(1);
  }
}

// Run the refresh
refreshNewsWithAlternatives()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });