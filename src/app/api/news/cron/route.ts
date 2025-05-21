// src/app/api/news/cron/route.ts
import { NextResponse } from 'next/server';
import { fetchAndStoreNews } from '@/lib/news/fetcher';

// Vercel Cron handler
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Maximum duration in seconds (5 minutes)

export async function GET(request: Request) {
  try {
    // Check for cron secret if you want to secure the endpoint
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Starting scheduled news fetch...');
    
    // Fetch both English and Japanese news
    const [englishNews, japaneseNews] = await Promise.all([
      fetchAndStoreNews('en'),
      fetchAndStoreNews('ja')
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      fetched: {
        en: englishNews.length,
        ja: japaneseNews.length
      }
    });
  } catch (error) {
    console.error('Scheduled fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch news' 
      },
      { status: 500 }
    );
  }
}