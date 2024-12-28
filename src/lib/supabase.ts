import { createClient } from '@supabase/supabase-js'
import { validateEnv } from '../config/env'
import type { Database } from './types'

// Run validation first
const env = validateEnv();

console.log('Supabase: Initializing client');
export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      persistSession: false
    }
  }
);

// Test the connection
void (async () => {
  try {
    await supabase.from('news_items').select('count');
    console.log('Supabase: Connection successful');
  } catch (err) {
    console.error('Supabase: Connection error:', err);
  }
})();