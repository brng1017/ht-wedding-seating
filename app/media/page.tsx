'use client';

import { useState } from 'react';
import MediaUploader from '@/components/MediaUploader';
import Gallery from '@/components/Gallery';

export default function MediaPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className='relative h-full flex flex-col items-center p-3'>
      <h1 className='text-5xl font-cursive'>Photo Share</h1>

      <Gallery refreshKey={refreshKey} />
      <MediaUploader onUploaded={() => setRefreshKey((x) => x + 1)} />
    </div>
  );
}
