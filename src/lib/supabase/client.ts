import { createClient } from '@supabase/supabase-js'
import { validateEnv } from '../config/env'  // Make sure this path is correct based on your file structure

// Run validation first
const env = validateEnv();

console.log('Supabase: Initializing client');
export const supabase = createClient(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      persistSession: false
    }
  }
);

// Test the connection
supabase
  .from('news_items')
  .select('count')
  .then(() => console.log('Supabase: Connection successful'))
  .catch(err => console.error('Supabase: Connection error:', err));