'use client';

import { useEffect, useState } from 'react';
import { supabasePublic } from '@/lib/supabase/client';
import { FaPlay } from 'react-icons/fa';

type Post = {
  id: string;
  created_at: string;
  file_path: string;
  file_type: 'image' | 'video';
  caption: string | null;
};

export default function Gallery({
  refreshKey,
  isAdmin = false,
}: {
  refreshKey: number;
  isAdmin?: boolean;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<Post | null>(null);

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
    <div className='mt-2 min-h-0 flex flex-col'>
      <div className='flex items-baseline justify-center'>
        <button className='text-sm underline opacity-80' onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className='mt-3 opacity-80'>Loading…</div>
      ) : (
        <div className='flex-1 min-h-0 overflow-y-scroll mt-3 pb-12'>
          <div className='grid grid-cols-2 sm:grid-cols-3'>
            {posts.map((p) => {
              const { data } = supabasePublic.storage
                .from('wedding-uploads')
                .getPublicUrl(p.file_path);

              const url = data.publicUrl;

              return (
                <div key={p.id} className='relative overflow-hidden'>
                  <div
                    className='aspect-square bg-black/5'
                    onClick={() => setActivePost(p)}
                  >
                    {p.file_type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={p.caption ?? 'upload'}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <>
                        <video
                          src={url}
                          className='h-full w-full object-cover'
                          playsInline
                        />
                        <FaPlay
                          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80'
                          size={36}
                        />
                      </>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      className='absolute top-2 right-2 rounded-full bg-red-500/60 text-white px-2 py-1 text-xs'
                      onClick={async () => {
                        if (!confirm('Delete this photo/video?')) return;

                        await fetch(`/api/posts/${p.id}`, {
                          method: 'DELETE',
                        });

                        location.reload();
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activePost && (
        <div
          className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-[fadeIn_0.3s_ease-out]'
          onClick={() => setActivePost(null)}
        >
          <button
            className='absolute top-4 right-4 text-white text-2xl opacity-80'
            onClick={() => setActivePost(null)}
          >
            ✕
          </button>

          <div
            className='max-h-full max-w-full'
            onClick={(e) => e.stopPropagation()}
          >
            {activePost.file_type === 'image' ? (
              <img
                src={
                  supabasePublic.storage
                    .from('wedding-uploads')
                    .getPublicUrl(activePost.file_path).data.publicUrl
                }
                alt={activePost.caption ?? 'upload'}
                className='max-h-screen max-w-screen object-contain'
              />
            ) : (
              <video
                src={
                  supabasePublic.storage
                    .from('wedding-uploads')
                    .getPublicUrl(activePost.file_path).data.publicUrl
                }
                className='max-h-screen max-w-screen'
                controls
                autoPlay
                playsInline
              />
            )}

            {activePost.caption && (
              <div className='mt-4 text-center text-white/80 text-sm'>
                {activePost.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
