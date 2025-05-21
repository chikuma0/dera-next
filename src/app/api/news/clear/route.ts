import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Delete all news items
    const { error } = await supabase
      .from('news_items')
      .delete()
      .neq('id', ''); // Delete all rows

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'All news items cleared'
    });
  } catch (error) {
    console.error('Error clearing news items:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear news items'
    }, { status: 500 });
  }
}
