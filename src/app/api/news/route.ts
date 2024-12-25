import { NextResponse } from 'next/server';
import { HackerNewsScraper } from '@/lib/news/scrapers/hackernews';

export async function GET() {
  try {
    const scraper = new HackerNewsScraper();
    const news = await scraper.fetchNews();
    
    return NextResponse.json({ items: news });
  } catch (error) {
    return NextResponse.json(
      { items: [], error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
