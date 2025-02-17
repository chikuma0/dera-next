import { NextResponse } from 'next/server';
import { ArticleService } from '@/lib/services/articleService';

export async function GET() {
  try {
    console.log('Initializing article service...');
    const articleService = new ArticleService();

    // Skip score update for testing
    // console.log('Updating article scores...');
    // await articleService.updateArticleScores();

    console.log('\nFetching English articles...');
    let enArticles: Array<any> = [];
    try {
      const result = await Promise.race([
        articleService.getTopArticles('en', 5),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('English articles fetch timeout')), 5000)
        )
      ]);
      enArticles = result || [];
      console.log(`Found ${enArticles.length} English articles`);
    } catch (error) {
      console.error('Error fetching English articles:', error);
    }
    
    console.log('\nFetching Japanese articles...');
    let jaArticles: Array<any> = [];
    try {
      const result = await Promise.race([
        articleService.getTopArticles('ja', 5),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Japanese articles fetch timeout')), 5000)
        )
      ]);
      jaArticles = result || [];
      console.log(`Found ${jaArticles.length} Japanese articles`);
    } catch (error) {
      console.error('Error fetching Japanese articles:', error);
    }

    const formatArticle = (article: any) => {
      try {
        console.log('Formatting article:', article.title);
        const scoreData = article.score_breakdown || {};
        
        return {
          title: article.title || 'Untitled',
          published_date: new Date(article.published_date || Date.now()).toLocaleDateString(),
          url: article.url || '#',
          score: {
            total: scoreData.total || 0,
            breakdown: {
              keywordScore: scoreData.breakdown.keywordScore || 0,
              timeDecay: Math.round((scoreData.breakdown.timeDecay || 0) * 100),
              titleScore: scoreData.breakdown.titleScore || 0,
              summaryScore: scoreData.breakdown.summaryScore || 0
            }
          }
        };
      } catch (error) {
        console.error('Error formatting article:', error);
        return null;
      }
    };

    const formattedEnArticles = enArticles
      .map(formatArticle)
      .filter(Boolean);
    const formattedJaArticles = jaArticles
      .map(formatArticle)
      .filter(Boolean);

    console.log(`Formatted ${formattedEnArticles.length} English and ${formattedJaArticles.length} Japanese articles`);

    return NextResponse.json({
      success: true,
      data: {
        english: formattedEnArticles,
        japanese: formattedJaArticles
      }
    });
  } catch (error) {
    console.error('Error in test-scoring:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}