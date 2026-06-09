import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import {
  getUploadAccessFromCookieValue,
  UPLOAD_ACCESS_COOKIE_NAME,
} from '@/lib/upload-access';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const access = getUploadAccessFromCookieValue(
    cookieStore.get(UPLOAD_ACCESS_COOKIE_NAME)?.value,
  );

  if (!access) {
    notFound();
  }

  return (
    <div className='mx-auto max-w-4xl p-4'>
      <h1 className='text-2xl font-semibold'>Admin Gallery</h1>
      <p className='mt-1 text-sm opacity-80'>
        Delete inappropriate uploads if needed.
      </p>
      <Gallery refreshKey={0} isAdmin />
    </div>
  );
}
