import { NextRequest } from 'next/server';
import { fetchAndStoreNews, getLatestNews } from '@/lib/news/fetcher';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = (searchParams.get('language') as 'en' | 'ja') || 'en';
  const refresh = searchParams.get('refresh') === 'true';
  
  try {
    console.log(`API Route: Processing ${language} request, refresh=${refresh}`);
    
    // If refresh=true, fetch new data from RSS
    if (refresh) {
      console.log('API Route: Starting RSS fetch...');
      const newItems = await fetchAndStoreNews(language);
      console.log(`API Route: Fetched and stored ${newItems.length} new items`);
    }
    
    // Get latest news from database
    console.log('API Route: Getting latest news from database...');
    const news = await getLatestNews(language);
    console.log(`API Route: Retrieved ${news.length} items from database`);
    
    // Ensure we always return an array, even if empty
    const newsArray = Array.isArray(news) ? news : [];
    
    return new Response(JSON.stringify({
      success: true,
      data: newsArray
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    // Return an empty array with error status
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news',
        data: []
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}