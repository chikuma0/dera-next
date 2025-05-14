import { NextRequest } from 'next/server';
import { WeeklyDigestService } from '@/lib/services/weeklyDigestService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const generate = searchParams.get('generate') === 'true';
  
  try {
    console.log(`API Route: Processing weekly digest request, generate=${generate}`);
    
    const weeklyDigestService = new WeeklyDigestService();
    
    // If generate=true, generate a new digest
    if (generate) {
      console.log('API Route: Generating new weekly digest...');
      const digest = await weeklyDigestService.generateWeeklyDigest();
      
      if (!digest) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to generate weekly digest',
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
      
      console.log(`API Route: Generated weekly digest with ID ${digest.id}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: digest
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Otherwise, get the latest digest
    console.log('API Route: Getting latest weekly digest...');
    const digest = await weeklyDigestService.getLatestWeeklyDigest();
    
    if (!digest) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No weekly digest found',
          data: null
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    console.log(`API Route: Retrieved weekly digest with ID ${digest.id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: digest
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('API Route Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process weekly digest request',
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