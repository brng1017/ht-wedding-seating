'use client';

import { useState } from 'react';
import MediaUploader from '@/components/MediaUploader';
import Gallery from '@/components/Gallery';

type MediaPageClientProps = {
  accessState: 'idle' | 'invalid';
  hasUploadAccess: boolean;
};

export default function MediaPageClient({
  accessState,
  hasUploadAccess,
}: MediaPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className='relative h-full flex flex-col items-center p-3'>
      <h1 className='text-5xl font-cursive'>Photo Share</h1>

      {accessState === 'invalid' && (
        <p className='mt-2 px-6 text-center text-sm uppercase opacity-70'>
          That upload link is invalid or expired.
        </p>
      )}

      {!hasUploadAccess && (
        <p className='mt-2 max-w-sm px-6 text-center text-sm opacity-70'>
          Scan your wedding QR code to unlock uploads.
        </p>
      )}

      <Gallery refreshKey={refreshKey} />
      {hasUploadAccess ? (
        <MediaUploader onUploaded={() => setRefreshKey((x) => x + 1)} />
      ) : null}
    </div>
  );
}
