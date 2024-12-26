import { supabase } from './supabase/client'
import type { NewsItem } from '../types/news'

export async function fetchNews() {
  const news = await supabase
    .from('news')
    .select('*')
    .order('relevanceScore', { ascending: false })
    .limit(10);

  return processNewsItems(news.data || []); // Add null check for news.data
}

function processNewsItems(news: NewsItem[]) {
  return news.map(item => ({
    ...item,
    displayTitle: `${item.title} (${item.source})`
  }));
}