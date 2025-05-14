import { NextRequest } from 'next/server';
import { validateEnv } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';
import { ImpactAnalysisService } from '@/lib/services/impactAnalysisService';
import { TrendDetectionService } from '@/lib/services/trendDetectionService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = (searchParams.get('language') as 'en' | 'ja') || 'en';
  
  try {
    const impactService = new ImpactAnalysisService();
    
    // Get impact dashboard data
    let impactData;
    
    try {
      // First, try to analyze fresh data to generate new impact insights
      console.log('Attempting to analyze fresh data for impact insights...');
      
      // This would typically involve analyzing recent trends and generating new insights
      // For now, we'll just try to get existing data from the impact service
      impactData = await impactService.getImpactDashboardData();
      console.log('Successfully loaded impact data from service');
    } catch (error) {
      console.error('All attempts to fetch real impact data failed:', error);
      
      // Return empty data
      console.log('No impact data found. Please run the fetch-real-trend-data.js script to generate real impact data.');
      impactData = {
        topTechnologies: [],
        impactHeatmap: [],
        latestInsights: []
      };
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: impactData
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    // Extract error details if available
    let errorMessage = 'Failed to fetch impact data';
    let errorDetails = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // @ts-ignore - Access any additional properties that might be on the error object
      if (error.details) {
        // @ts-ignore
        errorDetails = error.details;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: errorDetails,
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