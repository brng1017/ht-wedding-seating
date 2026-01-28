'use client';

import { useState } from 'react';
import MediaUploader from '@/components/MediaUploader';
import Gallery from '@/components/Gallery';

export default function MediaPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className='mx-auto max-w-3xl p-4'>
      <h1 className='text-2xl font-semibold'>Photo & Video Wall</h1>
      <div className='mt-4 grid gap-4 md:grid-cols-2'>
        <MediaUploader onUploaded={() => setRefreshKey((x) => x + 1)} />
        <div className='rounded-2xl border p-4'>
          <div className='text-lg font-semibold'>Slideshow Mode</div>
          <p className='mt-1 text-sm opacity-80'>
            Put this on a TV/tablet for a live feed vibe.
          </p>
          <a
            className='mt-3 inline-block rounded-xl border px-4 py-3 font-semibold'
            href='/tv'
          >
            Open Slideshow
          </a>
        </div>
      </div>

      <Gallery refreshKey={refreshKey} />
    </div>
  );
}
