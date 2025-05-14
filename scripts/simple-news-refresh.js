// scripts/simple-news-refresh.js
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');

// Load environment variables
require('dotenv').config();

// Simple keyword weights for scoring
const KEYWORD_WEIGHTS = {
  // High-impact terms
  'exclusive': 170,
  'breaking': 170,
  'just announced': 170,
  'partnership': 155,
  'acquisition': 155,
  'breakthrough': 150,
  'revolutionary': 150,
  'innovation': 140,
  
  // AI-specific terms
  'claude 3': 160,
  'gpt-5': 160,
  'gpt-4o': 160,
  'gemini': 155,
  'llama 3': 155,
  'mistral': 150,
  'anthropic': 150,
  'openai': 150,
  'large language model': 135,
  'foundation model': 135,
  'multimodal': 135,
  'artificial intelligence': 130,
  'language model': 130,
  'generative ai': 130,
  'llm': 125,
  'gpt': 125,
  'machine learning': 125,
  'deep learning': 125,
  'neural network': 125,
  'ai': 125
};

// Calculate a simple score based on keywords
function calculateScore(title, summary, source) {
  const text = `${title} ${summary}`.toLowerCase();
  let score = 100; // Base score
  
  // Check for keywords
  for (const [keyword, weight] of Object.entries(KEYWORD_WEIGHTS)) {
    if (text.includes(keyword.toLowerCase())) {
      score = Math.max(score, weight);
    }
  }
  
  // Boost score for high-quality sources
  const highQualitySources = [
    'Hacker News', 'ArXiv', 'Reddit r/MachineLearning', 'Reddit r/artificial',
    'TechCrunch', 'VentureBeat', 'MIT Technology Review', 'Wired'
  ];
  
  if (highQualitySources.some(s => source.includes(s))) {
    score *= 1.15; // 15% bonus
  }
  
  return Math.round(score);
}

async function refreshNews() {
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
        const newScore = calculateScore(
          article.title || '', 
          article.summary || '', 
          article.source || ''
        );
        
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
  
  // Open the media hub in the default browser
  console.log('\n🌐 Opening Media Hub in your browser...\n');
  
  if (process.platform === 'darwin') {
    // macOS
    exec('open http://localhost:3000/media-hub');
  } else if (process.platform === 'win32') {
    // Windows
    exec('start http://localhost:3000/media-hub');
  } else {
    // Linux and others
    exec('xdg-open http://localhost:3000/media-hub');
  }
}

// Run the refresh
refreshNews()
  .then(() => {
    console.log('Done!');
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });