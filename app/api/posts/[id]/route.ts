import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  // Fetch file path
  const { data, error } = await supabaseServer
    .from('posts')
    .select('file_path')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Delete file from storage
  await supabaseServer.storage.from('wedding-uploads').remove([data.file_path]);

  // Delete DB row
  await supabaseServer.from('posts').delete().eq('id', id);

  return NextResponse.json({ ok: true });
}
