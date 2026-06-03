'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from 'react';
import { supabasePublic } from '@/lib/supabase/client';
import { FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';

type Post = {
  id: string;
  created_at: string;
  file_path: string;
  file_type: 'image' | 'video';
  caption: string | null;
};

type SlideTransition = {
  direction: 1 | -1;
  from: number;
  phase: 'idle' | 'active';
  to: number;
};

const SLIDE_DURATION_MS = 280;

export default function Gallery({
  refreshKey,
  isAdmin = false,
}: {
  refreshKey: number;
  isAdmin?: boolean;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideTransition, setSlideTransition] = useState<SlideTransition | null>(
    null
  );
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const slideTimeoutRef = useRef<number | null>(null);

  const visibleActiveIndex =
    activeIndex === null || posts.length === 0
      ? null
      : Math.min(activeIndex, posts.length - 1);
  const activePost =
    visibleActiveIndex === null ? null : posts[visibleActiveIndex] ?? null;

  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current !== null) {
        window.clearTimeout(slideTimeoutRef.current);
      }
    };
  }, []);

  const stepActivePost = useCallback(
    (direction: 1 | -1) => {
      if (visibleActiveIndex === null || posts.length === 0) return;

      const nextIndex =
        (visibleActiveIndex + direction + posts.length) % posts.length;

      if (nextIndex === visibleActiveIndex) return;

      if (slideTimeoutRef.current !== null) {
        window.clearTimeout(slideTimeoutRef.current);
      }

      setSlideTransition({
        direction,
        from: visibleActiveIndex,
        phase: 'idle',
        to: nextIndex,
      });
      setActiveIndex(nextIndex);

      window.requestAnimationFrame(() => {
        setSlideTransition((current) => {
          if (
            current === null ||
            current.from !== visibleActiveIndex ||
            current.to !== nextIndex
          ) {
            return current;
          }

          return { ...current, phase: 'active' };
        });
      });

      slideTimeoutRef.current = window.setTimeout(() => {
        setSlideTransition(null);
        slideTimeoutRef.current = null;
      }, SLIDE_DURATION_MS);
    },
    [posts.length, visibleActiveIndex]
  );

  async function fetchPosts() {
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to load posts');
      }

      setPosts(Array.isArray(json.posts) ? json.posts : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  function load() {
    setLoading(true);
    void fetchPosts();
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPosts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshKey]);

  useEffect(() => {
    if (visibleActiveIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepActivePost(-1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepActivePost(1);
      }

      if (event.key === 'Escape') {
        setActiveIndex(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepActivePost, visibleActiveIndex]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    stepActivePost(deltaX > 0 ? -1 : 1);
  }

  function getPostUrl(post: Post) {
    return supabasePublic.storage
      .from('wedding-uploads')
      .getPublicUrl(post.file_path).data.publicUrl;
  }

  function renderPostMedia(post: Post) {
    const url = getPostUrl(post);

    if (post.file_type === 'image') {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={post.caption ?? 'upload'}
          className='max-h-screen max-w-screen object-contain'
        />
      );
    }

    return (
      <video
        src={url}
        className='max-h-screen max-w-screen'
        controls
        autoPlay
        playsInline
      />
    );
  }

  function renderActiveSlide(
    post: Post,
    index: number,
    role: 'current' | 'next'
  ) {
    const isTransitioning = slideTransition !== null;
    const isOutgoing = role === 'current';
    const direction = slideTransition?.direction ?? 1;

    let transform = 'translate3d(0, 0, 0)';
    let opacity = 1;

    if (isTransitioning) {
      if (slideTransition.phase === 'idle') {
        transform = isOutgoing
          ? 'translate3d(0, 0, 0)'
          : `translate3d(${direction * 100}%, 0, 0)`;
        opacity = isOutgoing ? 1 : 0.92;
      } else {
        transform = isOutgoing
          ? `translate3d(${-direction * 100}%, 0, 0)`
          : 'translate3d(0, 0, 0)';
        opacity = isOutgoing ? 0.82 : 1;
      }
    }

    return (
      <div
        key={`${role}-${post.id}-${index}`}
        className='absolute inset-0 flex items-center justify-center px-14 sm:px-20'
        style={{
          opacity,
          transform,
          transition: isTransitioning
            ? `transform ${SLIDE_DURATION_MS}ms ease, opacity ${SLIDE_DURATION_MS}ms ease`
            : undefined,
        }}
      >
        <div
          className='pointer-events-auto flex max-h-full max-w-full flex-col items-center justify-center gap-4'
          onClick={(event) => event.stopPropagation()}
        >
          {renderPostMedia(post)}
          {post.caption && (
            <div className='text-center text-sm text-white/80'>{post.caption}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='mt-2 min-h-0 flex flex-col'>
      <div className='flex items-baseline justify-center'>
        <button className='text-sm underline opacity-80' onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className='mt-3 opacity-80'>Loading...</div>
      ) : (
        <div className='mt-3 flex-1 min-h-0 overflow-y-scroll pb-12'>
          <div className='grid grid-cols-2 sm:grid-cols-3'>
            {posts.map((p, index) => {
              const url = getPostUrl(p);

              return (
                <div key={p.id} className='relative overflow-hidden'>
                  <div
                    className='aspect-square bg-black/5'
                    onClick={() => setActiveIndex(index)}
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
                          className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80'
                          size={36}
                        />
                      </>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      className='absolute top-2 right-2 rounded-full bg-red-500/60 px-2 py-1 text-xs text-white'
                      onClick={async () => {
                        if (!confirm('Delete this photo/video?')) return;

                        const res = await fetch(`/api/posts/${p.id}`, {
                          method: 'DELETE',
                        });

                        if (!res.ok) return;

                        setPosts((current) =>
                          current.filter((post) => post.id !== p.id)
                        );
                        setActiveIndex((current) => {
                          if (current === null) return current;
                          if (current === index) return null;
                          return current > index ? current - 1 : current;
                        });
                      }}
                    >
                      x
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
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-[fadeIn_0.3s_ease-out]'
          onClick={() => setActiveIndex(null)}
        >
          <button
            className='absolute top-4 right-4 z-20 text-2xl text-white opacity-80'
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex(null);
              setSlideTransition(null);
            }}
            aria-label='Close post'
          >
            x
          </button>

          {posts.length > 1 && (
            <>
              <button
                className='absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white opacity-90 transition hover:bg-white/20 sm:left-5'
                onClick={(event) => {
                  event.stopPropagation();
                  stepActivePost(-1);
                }}
                aria-label='Previous post'
              >
                <FaChevronLeft size={24} />
              </button>
              <button
                className='absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white opacity-90 transition hover:bg-white/20 sm:right-5'
                onClick={(event) => {
                  event.stopPropagation();
                  stepActivePost(1);
                }}
                aria-label='Next post'
              >
                <FaChevronRight size={24} />
              </button>
            </>
          )}

          <div
            className='pointer-events-none relative h-full w-full overflow-hidden touch-pan-y'
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
            {slideTransition &&
              posts[slideTransition.from] &&
              renderActiveSlide(
                posts[slideTransition.from],
                slideTransition.from,
                'current'
              )}
            {visibleActiveIndex !== null &&
              renderActiveSlide(activePost, visibleActiveIndex, 'next')}
          </div>
        </div>
      )}
    </div>
  );
}
