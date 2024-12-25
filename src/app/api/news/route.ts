import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AIApplication } from '@/types/news';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('news')
    .select('*')
    .order('publishedAt', { ascending: false });

  if (category) {
    query = query.or(
      `applicationCategory->>primary.eq.${category},` +
      `applicationCategory->secondary.cs.{${category}}`
    );
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .select('*', { count: 'exact' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data.map(item => ({
      ...item,
      publishedAt: new Date(item.publishedAt)
    })),
    pagination: {
      total: count,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}
