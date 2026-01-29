'use client';

import { useEffect, useRef, useState } from 'react';
import { supabasePublic } from '@/lib/supabase/client';

type Post = {
  id: string;
  file_path: string;
  file_type: 'image' | 'video';
  caption: string | null;
};

const IMAGE_DURATION_MS = 5000;

export default function TvPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function load() {
    const res = await fetch('/api/posts', { cache: 'no-store' });
    const json = await res.json();
    setPosts(json.posts ?? []);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 30_000); // refresh every 30s
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!posts.length) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const current = posts[index];

    if (current.file_type === 'image') {
      timeoutRef.current = setTimeout(next, IMAGE_DURATION_MS);
    }
  }, [index, posts]);

  function next() {
    setIndex((i) => (i + 1) % posts.length);
  }

  if (!posts.length) {
    return (
      <div className='flex h-screen items-center justify-center text-xl'>
        Waiting for uploads…
      </div>
    );
  }

  const post = posts[index];
  const { data } = supabasePublic.storage
    .from('wedding-uploads')
    .getPublicUrl(post.file_path);

  return (
    <div className='fixed inset-0 bg-black flex items-center justify-center'>
      {post.file_type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.publicUrl}
          alt=''
          className='max-h-screen max-w-screen object-contain'
        />
      ) : (
        <video
          ref={videoRef}
          src={data.publicUrl}
          className='max-h-screen max-w-screen'
          autoPlay
          playsInline
          onEnded={next}
        />
      )}

      {post.caption && (
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded-xl'>
          {post.caption}
        </div>
      )}
    </div>
  );
}
