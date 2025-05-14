import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/config/env';
import { GrokTwitterService } from '@/lib/services/grokTwitterService';
import { TrendDetectionService } from '@/lib/services/trendDetectionService';
import { Tweet, TweetHashtag } from '@/types/twitter';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Function to load Twitter data from JSON file
function loadTwitterDataFromFile() {
  try {
    const dataPath = path.join(process.cwd(), 'public/data/twitter-data.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      console.log('Successfully loaded Twitter data from file');
      return data;
    }
  } catch (error) {
    console.error('Error loading Twitter data from file:', error);
  }
  return { tweets: [], hashtags: [] };
}

export async function GET(req: NextRequest) {
  try {
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    const trendDetectionService = new TrendDetectionService();
    const twitterService = new GrokTwitterService();
    
    // Get query parameters
    const url = new URL(req.url);
    const language = url.searchParams.get('language') || 'en';
    
    // Get technology trends
    const { data: technologies, error: techError } = await supabase
      .from('ai_technologies')
      .select(`
        id,
        name,
        description,
        category,
        technology_trend_points (
          date,
          mention_count,
          impact_score,
          tweet_mention_count,
          social_impact_score
        )
      `)
      .order('name');
    
    if (techError) {
      throw new Error(`Error fetching technologies: ${techError.message}`);
    }
    
    // Get social data
    let topTweets: Tweet[] = [];
    let topHashtags: TweetHashtag[] = [];
    
    try {
      topTweets = await twitterService.getTopTweets(5);
      topHashtags = await twitterService.getTopHashtags(6);
    } catch (error) {
      console.error('Error fetching social data:', error);
    }
    
    // Process trend data
    const processedTechnologies = technologies.map(tech => ({
      ...tech,
      trendData: tech.technology_trend_points || []
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        technologies: processedTechnologies,
        socialData: {
          topTweets,
          topHashtags
        }
      }
    });
  } catch (error) {
    console.error('Error in trends API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}