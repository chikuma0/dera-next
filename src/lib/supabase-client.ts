import { createClient } from '@supabase/supabase-js';
import { validateEnv } from './config/env';

const env = validateEnv();

export const supabase = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
    }
  }
);

// Test connection
void (async () => {
  try {
    const { data, error } = await supabase.from('news_items').select('count');
    if (error) throw error;
    console.log('Supabase connection successful, news_items count:', data);
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
  }
})(); 