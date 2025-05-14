import { NextRequest } from 'next/server';
import { TrendDetectionService } from '@/lib/services/trendDetectionService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const trendService = new TrendDetectionService();
    await trendService.generateWeeklyTrendReport();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Weekly trend report generated successfully'
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
        error: error instanceof Error ? error.message : 'Failed to generate weekly report',
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