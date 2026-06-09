import { cookies } from 'next/headers';
import MediaPageClient from '@/components/MediaPageClient';
import {
  getUploadAccessFromCookieValue,
  UPLOAD_ACCESS_COOKIE_NAME,
} from '@/lib/upload-access';

type MediaPageProps = {
  searchParams: Promise<{
    access?: string;
  }>;
};

export default async function MediaPage({ searchParams }: MediaPageProps) {
  const cookieStore = await cookies();
  const access = getUploadAccessFromCookieValue(
    cookieStore.get(UPLOAD_ACCESS_COOKIE_NAME)?.value,
  );
  const params = await searchParams;

  return (
    <MediaPageClient
      hasUploadAccess={Boolean(access)}
      accessState={params.access === 'invalid' ? 'invalid' : 'idle'}
    />
  );
}
