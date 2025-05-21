import { NextRequest } from 'next/server';
import { fetchAndStoreNews, getLatestNews, getLatestNewsWithCache } from '@/lib/news/fetcher';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = (searchParams.get('language') || 'en') as 'en' | 'ja';

  if (!['en', 'ja'].includes(language)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }

  try {
    const news = await getLatestNewsWithCache(language);
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}