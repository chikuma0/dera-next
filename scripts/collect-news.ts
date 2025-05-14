import * as dotenv from 'dotenv';
import * as path from 'path';
import { RssCollector } from '../src/lib/news/rssCollector';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function collectNews() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  try {
    console.log('Starting news collection...');
    
    // Create an instance of RssCollector without parameters
    const collector = new RssCollector();
    
    // Process all RSS feeds
    const result = await collector.processAllRssFeeds();
    
    console.log('News collection completed:', result);
  } catch (error) {
    console.error('Failed to collect news:', error);
    process.exit(1);
  }
}

collectNews(); 