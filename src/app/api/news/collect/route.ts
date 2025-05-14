import { NextRequest, NextResponse } from 'next/server';
import { RssCollector } from '@/lib/news/rssCollector';
import { createClient } from '@supabase/supabase-js';

// This handler will be called when the API endpoint is hit
export async function POST(req: NextRequest) {
  try {
    // Basic auth check using a simple API key
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = req.headers.get('x-supabase-url');
    const supabaseAnonKey = req.headers.get('x-supabase-anon-key');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 400 }
      );
    }
    
    const serviceRoleKey = authHeader.replace('Bearer ', '');
    
    console.log('Using Supabase configuration:', {
      url: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!serviceRoleKey
    });
    
    // Run the RSS collector with provided credentials
    const collector = new RssCollector();
    const result = await collector.processAllRssFeeds();
    
    // Auto-approve news with basic rules
    try {
      await autoApproveNews(supabaseUrl, serviceRoleKey);
    } catch (error) {
      console.error('Error auto-approving news:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} news items, saved ${result.saved} new items`,
      data: result
    });
  } catch (error) {
    console.error('Error collecting news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Helper function to auto-approve news based on simple rules
async function autoApproveNews(supabaseUrl: string, serviceRoleKey: string) {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Get all pending news items
    const { data: pendingNews, error: pendingError } = await supabase
      .from('news_items')
      .select('id, source_id, status')
      .eq('status', 'pending');

    if (pendingError) {
      console.error('Error fetching pending news:', pendingError);
      return;
    }

    if (!pendingNews || pendingNews.length === 0) {
      return;
    }

    // Get source priorities
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('id, priority');

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      return;
    }

    // Create a map of source IDs to priorities
    const sourcePriorityMap = new Map(
      sources.map(source => [source.id, source.priority])
    );

    // Update status for high-priority sources
    const highPriorityItems = pendingNews.filter(item => {
      const priority = sourcePriorityMap.get(item.source_id);
      return priority && priority >= 8; // Auto-approve if priority >= 8
    });

    if (highPriorityItems.length > 0) {
      const { error: updateError } = await supabase
        .from('news_items')
        .update({ status: 'published' })
        .in('id', highPriorityItems.map(item => item.id));

      if (updateError) {
        console.error('Error updating news status:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in auto-approve process:', error);
  }
} 