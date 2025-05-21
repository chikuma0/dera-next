// src/app/api/news/cron/route.ts
import { NextResponse } from 'next/server';
import { fetchAndStoreNews } from '@/lib/news/fetcher';
import { ArticleService } from '@/lib/services/articleService';

// Vercel Cron handler
// Using the standard runtime instead of Edge for better environment variable support
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum duration in seconds (60s is the limit for Vercel Hobby)

export async function GET(request: Request) {
  try {
    // Debug: Log environment variables (will only show in server logs, not in client)
    console.log('Environment variables in standard runtime:', {
      CRON_SECRET: process.env.CRON_SECRET ? '*** (set)' : '❌ (not set)',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
    });
    
    // Check for cron secret if you want to secure the endpoint
    const authHeader = request.headers.get('authorization');
    const vercelSource = request.headers.get('x-vercel-source');
    const vercelCron = request.headers.get('x-vercel-cron');
    const secretParam = new URL(request.url).searchParams.get('secret');
    console.log('Auth header received:', authHeader ? '*** (present)' : '❌ (missing)');
    console.log('Vercel source header:', vercelSource || 'none');
    console.log('Vercel cron header:', vercelCron || 'none');

    // Only enforce the secret if it is defined and not in development mode
    if (process.env.CRON_SECRET && process.env.NODE_ENV !== 'development') {
      const validHeader = authHeader === `Bearer ${process.env.CRON_SECRET}`;
      const validQuery = secretParam === process.env.CRON_SECRET;
      const fromCron = vercelSource === 'cron' || vercelCron !== null;

      if (!validHeader && !validQuery && !fromCron) {
        console.error('Unauthorized cron invocation');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    } else {
      console.log('Bypassing auth check in development mode');
    }

    console.log('Starting scheduled news fetch...');
    
    try {
      // Fetch news for both languages
      console.log('Fetching English news...');
      const englishNews = await fetchAndStoreNews('en');
      
      console.log('Fetching Japanese news...');
      const japaneseNews = await fetchAndStoreNews('ja');
      
      // Calculate total items fetched
      const enCount = typeof englishNews === 'number' ? englishNews :
                      Array.isArray(englishNews) ? englishNews.length : 0;
      
      const jaCount = typeof japaneseNews === 'number' ? japaneseNews :
                      Array.isArray(japaneseNews) ? japaneseNews.length : 0;
      
      console.log(`Fetched ${enCount} English and ${jaCount} Japanese news items`);
      
      // Update scores after fetching
      try {
        console.log('Updating article scores...');
        const articleService = new ArticleService();
        await articleService.updateArticleScores();
        console.log('Article scores updated successfully');
      } catch (scoreError) {
        console.error('Error updating article scores:', scoreError);
        // Continue despite score update failure
      }

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        fetched: {
          en: enCount,
          ja: jaCount
        }
      });
    } catch (fetchError) {
      console.error('News fetch error:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: fetchError instanceof Error ? fetchError.message : 'Failed to fetch news',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in cron handler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error in cron handler',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
