import { NextRequest } from 'next/server';
import { TrendDetectionService } from '@/lib/services/trendDetectionService';
import { ImpactAnalysisService } from '@/lib/services/impactAnalysisService';
import { getLatestNews } from '@/lib/news/fetcher';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skipImpact = searchParams.get('skipImpact') === 'true';
    const skipTrends = searchParams.get('skipTrends') === 'true';
    
    // Get latest news
    const enNews = await getLatestNews('en');
    const jaNews = await getLatestNews('ja');
    const allNews = [...enNews, ...jaNews];
    
    const results = {
      trendsProcessed: false,
      impactProcessed: false,
      articlesCount: allNews.length
    };
    
    // Process for trends
    if (!skipTrends) {
      const trendService = new TrendDetectionService();
      await trendService.processArticlesForTrends(allNews);
      
      // Calculate growth rates
      await trendService.calculateGrowthRates();
      
      results.trendsProcessed = true;
    }
    
    // Process for impact analysis
    if (!skipImpact) {
      const impactService = new ImpactAnalysisService();
      await impactService.processArticlesForImpact(allNews);
      
      // Generate impact insights
      await impactService.generateImpactInsights();
      
      results.impactProcessed = true;
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${allNews.length} articles for analysis`,
      results
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze trends and impact',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}