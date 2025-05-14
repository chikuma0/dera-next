import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../src/lib/config/env';

async function importInitialNews() {
  const env = validateEnv();
  const supabase = createClient(
    env.supabase.url,
    env.supabase.serviceRoleKey
  );

  // Sample news data
  const newsItems = [
    {
      title: "OpenAI Releases GPT-5 with Unprecedented Capabilities",
      summary: "OpenAI has announced the release of GPT-5, featuring significant improvements in reasoning and multimodal understanding.",
      url: "https://example.com/openai-gpt5",
      source_id: "", // Will be set after fetching source
      published_at: new Date("2024-04-24T10:00:00Z"),
      image_url: "https://example.com/gpt5-image.jpg",
      relevance_score: 0.95,
      importance_score: 0.9,
      trend_score: 0.85,
      is_breaking: true,
      status: "published",
      categories: ["AI & ML", "Research"]
    },
    {
      title: "Japanese AI Startup Raises $100M Series B",
      summary: "A promising Japanese AI startup has secured $100M in Series B funding to expand its AI-powered business solutions.",
      url: "https://example.com/japanese-ai-startup",
      source_id: "", // Will be set after fetching source
      published_at: new Date("2024-04-24T09:00:00Z"),
      image_url: "https://example.com/startup-image.jpg",
      relevance_score: 0.85,
      importance_score: 0.8,
      trend_score: 0.75,
      is_breaking: false,
      status: "published",
      categories: ["Startups", "Japan Market"]
    },
    {
      title: "New AI Regulation Framework Proposed in Japan",
      summary: "Japanese government announces new regulatory framework for AI development and deployment.",
      url: "https://example.com/japan-ai-regulation",
      source_id: "", // Will be set after fetching source
      published_at: new Date("2024-04-24T08:00:00Z"),
      image_url: "https://example.com/regulation-image.jpg",
      relevance_score: 0.8,
      importance_score: 0.85,
      trend_score: 0.7,
      is_breaking: false,
      status: "published",
      categories: ["Policy", "Japan Market"]
    }
  ];

  try {
    // Get source IDs
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('id, name');

    if (sourcesError) {
      throw new Error(`Error fetching sources: ${sourcesError.message}`);
    }

    const sourceMap = new Map(sources.map(s => [s.name, s.id]));
    const defaultSourceId = sources[0]?.id;

    // Get category IDs
    const { data: categories, error: categoriesError } = await supabase
      .from('news_categories')
      .select('id, name');

    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }

    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    // Import news items
    for (const item of newsItems) {
      // Set source ID (using first source as default)
      item.source_id = defaultSourceId;

      // Insert news item
      const { data: newsItem, error: newsError } = await supabase
        .from('news_items')
        .insert([{
          ...item,
          collected_at: new Date(),
          ai_processed: true
        }])
        .select()
        .single();

      if (newsError) {
        console.error(`Error inserting news item "${item.title}":`, newsError);
        continue;
      }

      // Add categories
      for (const categoryName of item.categories) {
        const categoryId = categoryMap.get(categoryName);
        if (!categoryId) {
          console.warn(`Category not found: ${categoryName}`);
          continue;
        }

        const { error: categoryError } = await supabase
          .from('news_item_categories')
          .insert([{
            news_item_id: newsItem.id,
            category_id: categoryId,
            confidence: 1.0
          }]);

        if (categoryError) {
          console.error(`Error adding category "${categoryName}" to news item:`, categoryError);
        }
      }

      console.log(`Successfully imported: ${item.title}`);
    }

    console.log('Initial news data import completed successfully');
  } catch (error) {
    console.error('Error importing initial news data:', error);
  }
}

// Run the import
importInitialNews().catch(console.error); 