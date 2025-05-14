import { NextRequest } from 'next/server';
import { TrendDetectionService } from '@/lib/services/trendDetectionService';
import { ImpactAnalysisService } from '@/lib/services/impactAnalysisService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = (searchParams.get('language') as 'en' | 'ja') || 'en';
  
  try {
    // Initialize services
    const trendService = new TrendDetectionService();
    const impactService = new ImpactAnalysisService();
    
    // Fetch data in parallel
    const [trendData, impactData] = await Promise.all([
      trendService.getTrendDashboardData(),
      impactService.getImpactDashboardData()
    ]);
    
    // Return combined data
    return new Response(JSON.stringify({
      success: true,
      data: {
        trend: trendData,
        impact: impactData
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    
    // Extract error details if available
    let trendError = null;
    let impactError = null;
    let errorMessage = 'Failed to fetch business intelligence data';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check if it's a Supabase error with details
      // @ts-ignore
      if (error.code && error.message) {
        // Try to determine if it's a trend or impact error based on the message
        if (error.message.includes('trend') || error.message.includes('ai_technologies')) {
          trendError = {
            message: error.message,
            // @ts-ignore
            code: error.code,
            // @ts-ignore
            details: error.details || null
          };
        } else if (error.message.includes('impact') || error.message.includes('industries')) {
          impactError = {
            message: error.message,
            // @ts-ignore
            code: error.code,
            // @ts-ignore
            details: error.details || null
          };
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        trendError,
        impactError,
        data: null
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