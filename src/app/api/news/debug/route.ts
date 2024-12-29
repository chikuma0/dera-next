// src/app/api/news/debug/route.ts
import { NextResponse } from 'next/server';
import { fetchAndStoreNews, getLatestNews } from '@/lib/news/fetcher';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const language = url.searchParams.get('language') as 'en' | 'ja' || 'en';
    const mode = url.searchParams.get('mode') || 'all';

    let response: any = {
      timestamp: new Date().toISOString(),
      success: false,
      message: '',
      data: null
    };

    if (mode === 'fetch') {
      // Only fetch new items
      const items = await fetchAndStoreNews(language);
      response.success = true;
      response.message = `Fetched ${items.length} items`;
      response.data = { itemCount: items.length };
    } else if (mode === 'read') {
      // Only read from database
      const items = await getLatestNews(language);
      response.success = true;
      response.message = `Retrieved ${items.length} items from database`;
      response.data = { items };
    } else {
      // Fetch and read
      const fetchedItems = await fetchAndStoreNews(language);
      const storedItems = await getLatestNews(language);
      response.success = true;
      response.message = `Fetched ${fetchedItems.length} items, retrieved ${storedItems.length} from database`;
      response.data = {
        fetched: { count: fetchedItems.length },
        stored: { count: storedItems.length, items: storedItems }
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error
    }, { status: 500 });
  }
}