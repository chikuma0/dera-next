import { NextRequest } from 'next/server';
import { validateEnv } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const newsId = searchParams.get('newsId');
  
  if (!newsId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'News ID is required',
        data: []
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  try {
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    
    // Get technologies related to this news item
    const { data: technologies, error } = await supabase
      .from('news_item_technologies')
      .select(`
        relevance_score,
        ai_technologies (
          id,
          name,
          slug,
          maturity_level,
          description
        )
      `)
      .eq('news_item_id', newsId)
      .order('relevance_score', { ascending: false });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Transform the data to a more usable format
    const formattedTechnologies = technologies.map(item => ({
      ...item.ai_technologies,
      relevance_score: item.relevance_score
    }));
    
    return new Response(JSON.stringify({
      success: true,
      data: formattedTechnologies
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
        error: error instanceof Error ? error.message : 'Failed to fetch technologies',
        data: []
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