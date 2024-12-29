// src/app/api/debug/reprocess/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/config/env';
import { articleService } from '@/lib/services/articleService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const language = body.language || 'en';
    const hours = body.hours || 24;
    
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    
    // Get articles to reprocess
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const { data: articles, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .gte('published_date', cutoffTime.toISOString());

    if (error) throw error;
    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No articles found to process' });
    }

    // Process articles using the imported service instance directly
    const processedArticles = await articleService.processArticleBatch(articles);

    return NextResponse.json({
      message: `Successfully reprocessed ${processedArticles.length} articles`,
      processed: processedArticles.length
    });

  } catch (error) {
    console.error('Reprocess API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}