import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function optimizeDatabase() {
  try {
    console.log('Starting database optimization...');
    
    // 1. Update statistics
    console.log('Updating database statistics...');
    await supabase.rpc('exec', { query: 'ANALYZE' });
    
    // 2. Rebuild indexes
    console.log('Rebuilding indexes...');
    await supabase.rpc('exec', { 
      query: `
        REINDEX TABLE news_items;
        REINDEX TABLE news_sources;
        REINDEX TABLE news_categories;
      `
    });
    
    // 3. Vacuum to reclaim space
    console.log('Running VACUUM...');
    await supabase.rpc('exec', { query: 'VACUUM ANALYZE' });
    
    console.log('✅ Database optimization completed successfully!');
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
}

optimizeDatabase();
