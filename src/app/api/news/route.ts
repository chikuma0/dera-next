import { NewsService } from '@/lib/news/news-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const newsService = new NewsService();
    const news = await newsService.getNews();
    
    return NextResponse.json(news);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { 
        items: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
