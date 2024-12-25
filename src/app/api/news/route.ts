import { NextResponse } from 'next/server';
import { HackerNewsScraper } from '@/lib/news/scrapers/hackernews';

export async function GET() {
  const scraper = new HackerNewsScraper({ translate: true });
  const news = await scraper.fetchNews();
  
  return NextResponse.json(news);
}
