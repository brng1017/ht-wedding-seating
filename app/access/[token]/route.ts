import { NextResponse } from 'next/server';
import {
  createUploadAccessToken,
  UPLOAD_ACCESS_COOKIE_NAME,
  verifyUploadAccessToken,
} from '@/lib/upload-access';

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const access = verifyUploadAccessToken(token);
  const url = new URL(req.url);
  const redirectUrl = new URL('/', url);

  if (!access) {
    redirectUrl.searchParams.set('access', 'invalid');
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set({
    name: UPLOAD_ACCESS_COOKIE_NAME,
    value: createUploadAccessToken(access),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(access.expiresAt),
  });

  return response;
}
