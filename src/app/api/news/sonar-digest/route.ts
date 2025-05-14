import { NextRequest } from 'next/server';
import { SonarDigestService } from '@/lib/services/sonarDigestService';

// Use ISR (Incremental Static Regeneration) with a revalidation period of 1 week
export const revalidate = 604800; // 7 days in seconds (7 * 24 * 60 * 60)

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: Processing Sonar digest request');
    
    // Create a new instance of SonarDigestService
    const sonarDigestService = new SonarDigestService();
    
    // Always get the latest digest from the database
    console.log('API Route: Getting latest Sonar digest from database...');
    const digest = await sonarDigestService.getLatestWeeklyDigest();
    
    if (!digest) {
      // If no digest is found, return a 404 with instructions to run the script
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No Sonar digest found. Please run the weekly generation script: node scripts/generate-weekly-sonar-digest.js',
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
    
    console.log(`API Route: Retrieved Sonar digest`);
    
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
        error: error instanceof Error ? error.message : 'Failed to process Sonar digest request',
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