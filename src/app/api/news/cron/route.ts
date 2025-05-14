// src/app/api/news/cron/route.ts
import { NextResponse } from 'next/server';
import { fetchAndStoreNews } from '@/lib/news/fetcher';
import { ArticleService } from '@/lib/services/articleService';

// Vercel Cron handler
// Using standard runtime instead of edge for better environment variable support
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Maximum duration in seconds (5 minutes)

export async function GET(request: Request) {
  try {
    // Debug: Log environment variables (will only show in server logs, not in client)
    console.log('Environment variables in edge runtime:', {
      CRON_SECRET: process.env.CRON_SECRET ? '*** (set)' : '❌ (not set)',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
    });
    
    // Check for cron secret if you want to secure the endpoint
    const authHeader = request.headers.get('authorization');
    console.log('Auth header received:', authHeader ? '*** (present)' : '❌ (missing)');
    
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET is not set in environment variables');
      return new NextResponse('Server configuration error', { status: 500 });
    }
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Invalid authorization header');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Starting scheduled news fetch...');
    
    // Fetch both English and Japanese news
    const [englishNews, japaneseNews] = await Promise.all([
      fetchAndStoreNews('en'),
      fetchAndStoreNews('ja')
    ]);

    // Update scores after fetching
    const articleService = new ArticleService();
    await articleService.updateArticleScores();

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