// src/app/api/debug/scores/route.ts
import { NextResponse } from 'next/server';
import { articleService } from '@/lib/services/articleService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = (searchParams.get('language') || 'en') as 'en' | 'ja';
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    
    console.log('Debug API called with:', { language, hours });
    
    // Get articles with scores
    const articles = await articleService.getArticlesByScore(language, hours);
    console.log(`Found ${articles.length} articles`);
    
    if (!articles.length) {
      return NextResponse.json({
        stats: { count: 0, average: 0, median: 0, max: 0, min: 0 },
        topArticles: []
      });
    }

    // Process each article and get detailed scores
    const processedArticles = articles.map(article => {
      const scoreDetails = articleService['calculateImportanceScore'](article, true);
      if (typeof scoreDetails === 'number') {
        console.error('Unexpected score format for article:', article.title);
        return null;
      }

      return {
        title: article.title,
        url: article.url,
        source: article.source,
        published_date: article.published_date,
        categories: article.categories || [],
        score: scoreDetails.total,
        scoreBreakdown: scoreDetails
      };
    }).filter(Boolean);

    // Calculate stats from actual scores
    const scores = processedArticles.map(a => a.score);
    const stats = {
      count: articles.length,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      median: scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)],
      max: Math.max(...scores),
      min: Math.min(...scores)
    };

    console.log('Stats:', stats);
    return NextResponse.json({ 
      stats, 
      topArticles: processedArticles.sort((a, b) => b.score - a.score)
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}