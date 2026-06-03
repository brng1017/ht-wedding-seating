import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('posts')
    .select('id, created_at, file_path, file_type, caption')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(60);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
