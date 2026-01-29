'use client';

import Gallery from '@/components/Gallery';
import { useState } from 'react';

export default function AdminPage() {
  const [key, setKey] = useState(0);

  return (
    <div className='mx-auto max-w-4xl p-4'>
      <h1 className='text-2xl font-semibold'>Admin Gallery</h1>
      <p className='mt-1 text-sm opacity-80'>
        Delete inappropriate uploads if needed.
      </p>
      <Gallery refreshKey={key} isAdmin />
    </div>
  );
}
