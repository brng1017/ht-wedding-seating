'use client';

import Gallery from '@/components/Gallery';

export default function AdminPage() {
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
