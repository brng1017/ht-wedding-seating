'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to load posts');
      }

      setPosts(Array.isArray(json.posts) ? json.posts : []);
    } catch {
      setPosts([]);
    }
  }

  const next = useCallback(() => {
    setIndex((currentIndex) =>
      posts.length ? (currentIndex + 1) % posts.length : 0
    );
  }, [posts.length]);

  useEffect(() => {
    void load();
    const intervalId = setInterval(() => {
      void load();
    }, 30_000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (index < posts.length) return;
    setIndex(0);
  }, [index, posts.length]);

  useEffect(() => {
    if (!posts.length) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const current = posts[index];
    if (!current) return;

    if (current.file_type === 'image') {
      timeoutRef.current = setTimeout(next, IMAGE_DURATION_MS);
    }
  }, [index, next, posts]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!posts.length) {
    return (
      <div className='flex h-screen items-center justify-center text-xl'>
        Waiting for uploads...
      </div>
    );
  }

  const post = posts[index];
  if (!post) return null;

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
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-black/50 px-4 py-2 text-lg text-white'>
          {post.caption}
        </div>
      )}
    </div>
  );
}
