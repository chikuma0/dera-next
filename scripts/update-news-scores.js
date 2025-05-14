// scripts/update-news-scores.js
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Use dynamic imports for Next.js modules
async function importModules() {
  // Import the ArticleService module
  const articleServicePath = path.join(process.cwd(), 'src/lib/services/articleService.js');
  const { ArticleService } = await import('file://' + articleServicePath);
  
  return { ArticleService };
}

async function updateAllArticleScores() {
  try {
    // Import the modules
    const { ArticleService } = await importModules();
    
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

    // Create article service
    const articleService = new ArticleService();

    console.log('Fetching all news articles...');
    
    // Fetch all articles
    const { data: articles, error } = await supabase
      .from('news_items')
      .select('*');

    if (error) {
      console.error('Error fetching articles:', error);
      process.exit(1);
    }

    console.log(`Found ${articles.length} articles. Updating scores...`);

    // Update scores in batches to avoid rate limits
    const batchSize = 50;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, Math.min(i + batchSize, articles.length));
      
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(articles.length / batchSize)}...`);
      
      const updatePromises = batch.map(async (article) => {
        try {
          // Calculate new score
          const { total: newScore } = articleService.calculateArticleScore(article);
          
          // Update article with new score
          const { error: updateError } = await supabase
            .from('news_items')
            .update({ importance_score: newScore })
            .eq('id', article.id);

          if (updateError) {
            console.error(`Error updating article ${article.id}:`, updateError);
            errorCount++;
            return false;
          }
          
          updatedCount++;
          return true;
        } catch (err) {
          console.error(`Error processing article ${article.id}:`, err);
          errorCount++;
          return false;
        }
      });

      // Wait for all updates in this batch to complete
      await Promise.all(updatePromises);
      
      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < articles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`
Score update complete:
- Total articles: ${articles.length}
- Successfully updated: ${updatedCount}
- Errors: ${errorCount}
    `);
  } catch (error) {
    console.error('Error during score update:', error);
    process.exit(1);
  }
}

// Run the update
updateAllArticleScores()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });