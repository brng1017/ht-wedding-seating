import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import {
  UPLOAD_ACCESS_COOKIE_NAME,
  verifyUploadAccessToken,
} from '@/lib/upload-access';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(UPLOAD_ACCESS_COOKIE_NAME)?.value;
  const uploadAccess = accessToken
    ? verifyUploadAccessToken(accessToken)
    : null;

  if (!uploadAccess) {
    return NextResponse.json(
      { error: 'Upload access is required' },
      { status: 401 },
    );
  }

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
