// scripts/analyze-trends.ts
import { TrendDetectionService } from '../src/lib/services/trendDetectionService.js';
import { ImpactAnalysisService } from '../src/lib/services/impactAnalysisService.js';
import { getLatestNews } from '../src/lib/news/fetcher.js';

/**
 * This script analyzes news articles for trends and impact analysis.
 * It can be run as a scheduled task (e.g., via cron) to keep trend and impact data updated.
 *
 * Usage:
 * - To analyze trends and impact: npm run analyze-trends
 * - To generate a weekly report: npm run analyze-trends -- --report
 * - To skip impact analysis: npm run analyze-trends -- --no-impact
 * - To skip trend analysis: npm run analyze-trends -- --no-trends
 */

async function main() {
  console.log('Starting AI trend and impact analysis...');
  
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const generateReport = args.includes('--report');
    const skipImpact = args.includes('--no-impact');
    const skipTrends = args.includes('--no-trends');
    
    // Get latest news
    console.log('Fetching latest news...');
    const enNews = await getLatestNews('en');
    const jaNews = await getLatestNews('ja');
    const allNews = [...enNews, ...jaNews];
    console.log(`Found ${allNews.length} news items to analyze`);
    
    // Process for trends
    if (!skipTrends) {
      console.log('Processing articles for trends...');
      const trendService = new TrendDetectionService();
      await trendService.processArticlesForTrends(allNews);
      
      // Calculate growth rates
      console.log('Calculating growth rates...');
      await trendService.calculateGrowthRates();
      
      // Generate weekly trend report if requested
      if (generateReport) {
        console.log('Generating weekly trend report...');
        await trendService.generateWeeklyTrendReport();
        console.log('Weekly trend report generated successfully');
      }
      
      console.log('Trend analysis completed successfully');
    } else {
      console.log('Skipping trend analysis as requested');
    }
    
    // Process for impact analysis
    if (!skipImpact) {
      console.log('Processing articles for impact analysis...');
      const impactService = new ImpactAnalysisService();
      await impactService.processArticlesForImpact(allNews);
      
      // Generate impact insights
      console.log('Generating impact insights...');
      await impactService.generateImpactInsights();
      
      console.log('Impact analysis completed successfully');
    } else {
      console.log('Skipping impact analysis as requested');
    }
    
    console.log('Analysis completed successfully');
  } catch (error) {
    console.error('Error during analysis:', error);
    process.exit(1);
  }
}

main();