// src/app/api/news/route.ts
import { NextRequest } from 'next/server';
import { fetchNews, getLatestNews } from '@/lib/news-fetcher';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = (searchParams.get('language') as 'en' | 'ja') || 'en';
  const refresh = searchParams.get('refresh') === 'true';
  
  try {
    // If refresh=true, fetch new data from RSS
    if (refresh) {
      await fetchNews(language);
    }
    
    // Get latest news from database
    const news = await getLatestNews(language);
    
    return Response.json({ success: true, data: news });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}