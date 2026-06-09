import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import {
  UPLOAD_ACCESS_COOKIE_NAME,
  verifyUploadAccessToken,
} from '@/lib/upload-access';

const MAX_MB = 30;

export async function POST(req: Request) {
  try {
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

    const requireApproval =
      (process.env.UPLOADS_REQUIRE_APPROVAL ?? 'true') === 'true';

    const form = await req.formData();
    const file = form.get('file');
    const caption = (form.get('caption') ?? '').toString().slice(0, 140);

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_MB}MB)` },
        { status: 400 }
      );
    }

    const mime = file.type;
    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Only images/videos allowed' },
        { status: 400 }
      );
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const fileType = isImage ? 'image' : 'video';
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${
      ext || (isImage ? 'jpg' : 'mp4')
    }`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: upErr } = await supabaseServer.storage
      .from('wedding-uploads')
      .upload(key, arrayBuffer, {
        contentType: mime,
        upsert: false,
      });

    if (upErr) throw upErr;

    const { error: dbErr } = await supabaseServer.from('posts').insert({
      file_path: key,
      file_type: fileType,
      caption: caption || null,
      approved: !requireApproval,
    });

    if (dbErr) throw dbErr;

    return NextResponse.json({ ok: true, approved: !requireApproval });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
