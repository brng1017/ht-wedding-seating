'use client';

import { useEffect, useState } from 'react';
import { supabasePublic } from '@/lib/supabase/client';

type Post = {
  id: string;
  created_at: string;
  file_path: string;
  file_type: 'image' | 'video';
  caption: string | null;
};

export default function Gallery({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/posts', { cache: 'no-store' });
    const json = await res.json();
    setPosts(json.posts ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className='mt-4'>
      <div className='flex items-baseline justify-between'>
        <div className='text-lg font-semibold'>Gallery</div>
        <button className='text-sm underline opacity-80' onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className='mt-3 opacity-80'>Loading…</div>
      ) : (
        <div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3'>
          {posts.map((p) => {
            const { data } = supabasePublic.storage
              .from('wedding-uploads')
              .getPublicUrl(p.file_path);

            const url = data.publicUrl;

            return (
              <div key={p.id} className='rounded-2xl border overflow-hidden'>
                <div className='aspect-square bg-black/5'>
                  {p.file_type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={p.caption ?? 'upload'}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <video
                      src={url}
                      className='h-full w-full object-cover'
                      controls
                      playsInline
                    />
                  )}
                </div>
                {p.caption ? (
                  <div className='p-2 text-sm opacity-80'>{p.caption}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
