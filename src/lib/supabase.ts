import { createClient } from '@supabase/supabase-js';
import { NewsItem } from '@/types/news';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DatabaseNews extends Omit<NewsItem, 'publishedAt'> {
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function saveNewsItems(items: NewsItem[]) {
  const { data, error } = await supabase
    .from('news')
    .upsert(
      items.map(item => ({
        ...item,
        publishedAt: item.publishedAt.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error saving news items:', error);
    throw error;
  }

  return data;
}

export async function getLatestNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('publishedAt', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching news:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    publishedAt: new Date(item.publishedAt)
  }));
}
