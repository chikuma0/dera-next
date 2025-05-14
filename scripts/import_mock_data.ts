const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or service role key is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface NewsSource {
  id: string;
  name: string;
  url: string;
  source_type: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

// Mock data
const mockCategories = [
  { name: 'AI & ML', description: 'Artificial Intelligence and Machine Learning news' },
  { name: 'Startups', description: 'AI startup news and funding' },
  { name: 'Research', description: 'Academic AI research and papers' },
  { name: 'Industry', description: 'Industry applications of AI' },
  { name: 'Policy', description: 'AI regulation and policy news' }
];

const mockNews = [
  {
    title: 'OpenAI Announces GPT-5',
    summary: 'Latest language model shows improvements in reasoning',
    source_name: 'AI Insider',
    url: 'https://example.com/gpt5',
    published_date: new Date(),
    importance_score: 95,
    sentiment: 0.8,
    categories: ['AI & ML', 'Research']
  }
  // Add more mock news items as needed
];

async function importMockData() {
  try {
    console.log('Starting import of mock data to Supabase...');

    // Step 1: Import news sources
    console.log('Importing news sources...');
    const mockSources = [
      { name: 'AI Insider', url: 'https://example.com/ai-insider', source_type: 'rss', is_active: true },
      { name: 'Science Daily', url: 'https://example.com/science-daily', source_type: 'rss', is_active: true },
      { name: 'Tech Crunch Japan', url: 'https://example.com/techcrunch-jp', source_type: 'rss', is_active: true }
    ];

    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .upsert(mockSources, { onConflict: 'name' })
      .select();

    if (sourcesError) {
      throw new Error(`Error importing sources: ${sourcesError.message}`);
    }
    console.log(`Imported ${sources?.length ?? 0} news sources`);

    // Create a map of source names to their IDs
    const sourceMap: Record<string, string> = {};
    sources?.forEach((source: NewsSource) => {
      sourceMap[source.name] = source.id;
    });

    // Step 2: Import categories
    console.log('Importing categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('news_categories')
      .upsert(mockCategories, { onConflict: 'name' })
      .select();

    if (categoriesError) {
      throw new Error(`Error importing categories: ${categoriesError.message}`);
    }
    console.log(`Imported ${categories?.length ?? 0} categories`);

    // Create a map of category names to their IDs
    const categoryMap: Record<string, string> = {};
    categories?.forEach((category: Category) => {
      categoryMap[category.name] = category.id;
    });

    // Step 3: Import news items
    console.log('Importing news items...');
    for (const item of mockNews) {
      // Get the correct source_id from our map
      const sourceId = sourceMap[item.source_name ?? ''];
      if (!sourceId) {
        console.warn(`Source "${item.source_name}" not found. Skipping news item: ${item.title}`);
        continue;
      }

      // Insert the news item
      const { data: newsItem, error: newsError } = await supabase
        .from('news_items')
        .upsert({
          title: item.title,
          summary: item.summary,
          source_id: sourceId,
          url: item.url,
          published_date: item.published_date,
          created_at: new Date(),
          updated_at: new Date(),
          importance_score: item.importance_score,
          sentiment: item.sentiment,
          source: item.source_name,
          language: 'en'
        }, { onConflict: 'url' })
        .select()
        .single();

      if (newsError) {
        console.error(`Error importing news item "${item.title}": ${newsError.message}`);
        continue;
      }

      // Insert category associations
      if (item.categories && item.categories.length > 0) {
        const categoryAssociations = item.categories
          .map(categoryName => {
            const categoryId = categoryMap[categoryName];
            if (!categoryId) {
              console.warn(`Category "${categoryName}" not found for news item: ${item.title}`);
              return null;
            }
            return {
              news_item_id: newsItem?.id,
              category_id: categoryId
            };
          })
          .filter((assoc): assoc is { news_item_id: string; category_id: string } => assoc !== null);

        if (categoryAssociations.length > 0) {
          const { error: assocError } = await supabase
            .from('news_item_categories')
            .upsert(categoryAssociations, { 
              onConflict: 'news_item_id,category_id'
            });

          if (assocError) {
            console.error(`Error creating category associations for "${item.title}": ${assocError.message}`);
          }
        }
      }
    }

    console.log('Mock data import completed successfully!');
  } catch (error) {
    console.error('Error importing mock data:', error);
    process.exit(1);
  }
}

// Run the import
importMockData(); 