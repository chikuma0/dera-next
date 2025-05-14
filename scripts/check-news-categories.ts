import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../src/lib/config/env';

async function checkNewsCategories() {
  try {
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    
    console.log('Checking news_categories table...');
    
    // Check if table exists and get row count
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'news_categories' });
    
    if (tableError) {
      console.error('Error checking news_categories table:', tableError);
      console.log('Trying to query the table directly...');
      
      // Try to query the table directly
      const { data, error } = await supabase
        .from('news_categories')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error querying news_categories:', error);
        console.log('\nThe news_categories table might not exist or you might not have permission to access it.');
        return;
      }
      
      console.log(`Found news_categories table with ${data.length} rows`);
      
      // Get sample categories
      const { data: categories, error: categoriesError } = await supabase
        .from('news_categories')
        .select('*')
        .limit(5);
      
      if (categoriesError) {
        console.error('Error fetching sample categories:', categoriesError);
        return;
      }
      
      console.log('\nSample categories:');
      console.table(categories);
      return;
    }
    
    console.log('Table info:', tableInfo);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkNewsCategories()
  .then(() => console.log('\nDone!'))
  .catch(console.error);
