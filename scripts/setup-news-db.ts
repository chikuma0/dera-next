import { createServerClient } from '../src/lib/supabase/client';
import { RssCollector } from '../src/lib/news/rssCollector';
import * as dotenv from 'dotenv';
import * as path from 'path';
import fetch from 'node-fetch';
global.fetch = fetch as any;

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setupNewsDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = createServerClient();
  const rssCollector = new RssCollector();

  try {
    // Refresh schema cache by making a simple query
    console.log('Refreshing schema cache...');
    try {
      await supabase.from('news_items').select('id').limit(1);
      await supabase.from('news_sources').select('id').limit(1);
      await supabase.from('news_categories').select('id').limit(1);
      console.log('Schema cache refreshed');
    } catch (error) {
      console.error('Error refreshing schema cache:', error);
      // Continue execution as tables might not exist yet
    }

    // Create news sources
    const newsSources = [
      {
        name: 'TechCrunch AI',
        url: 'https://techcrunch.com/category/artificial-intelligence/',
        feed_url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        source_type: 'rss',
        priority: 8,
        logo_url: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
        description: 'AI startup and technology news from TechCrunch',
        is_active: true
      },
      {
        name: 'VentureBeat AI',
        url: 'https://venturebeat.com/category/ai/',
        feed_url: 'https://venturebeat.com/category/ai/feed/',
        source_type: 'rss',
        priority: 8,
        logo_url: 'https://venturebeat.com/wp-content/themes/vb-news/img/favicon.ico',
        description: 'AI news and analysis from VentureBeat',
        is_active: true
      }
    ];

    console.log('Creating news sources...');
    for (const source of newsSources) {
      try {
        const { error } = await supabase
          .from('news_sources')
          .upsert(source, { onConflict: 'name' });
        
        if (error) {
          console.error(`Error creating source ${source.name}:`, error);
          if (error.code === '42P01') {
            console.error('Table "news_sources" does not exist. Please run the schema setup SQL first.');
            process.exit(1);
          }
        } else {
          console.log(`Created source: ${source.name}`);
        }
      } catch (error) {
        console.error(`Unexpected error creating source ${source.name}:`, error);
      }
    }

    // Create categories
    const categories = [
      { name: 'AI & ML', description: 'Artificial Intelligence and Machine Learning news' },
      { name: 'Startups', description: 'AI startup news and funding' },
      { name: 'Research', description: 'Academic AI research and papers' },
      { name: 'Industry', description: 'Industry applications of AI' },
      { name: 'Policy', description: 'AI regulation and policy news' }
    ];

    console.log('\nCreating categories...');
    for (const category of categories) {
      try {
        const { error } = await supabase
          .from('news_categories')
          .upsert(category, { onConflict: 'name' });
        
        if (error) {
          console.error(`Error creating category ${category.name}:`, error);
          if (error.code === '42P01') {
            console.error('Table "news_categories" does not exist. Please run the schema setup SQL first.');
            process.exit(1);
          }
        } else {
          console.log(`Created category: ${category.name}`);
        }
      } catch (error) {
        console.error(`Unexpected error creating category ${category.name}:`, error);
      }
    }

    // Fetch initial news items from RSS feeds
    console.log('\nFetching initial news items from RSS feeds...');
    const { processed, saved } = await rssCollector.processAllRssFeeds();
    console.log(`Processed ${processed} news items, saved ${saved} new items`);

    console.log('\nDatabase setup completed successfully!');
  } catch (error) {
    console.error('Error setting up news database:', error);
    process.exit(1);
  }
}

setupNewsDatabase(); 