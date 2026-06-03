'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from 'react';
import { supabasePublic } from '@/lib/supabase/client';
import { FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';
import { LuRefreshCw } from 'react-icons/lu';

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
  fromOffsetPx: number;
  phase: 'idle' | 'active';
  to: number;
};

type DragState = 'idle' | 'dragging' | 'settling';

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
  const [slideTransition, setSlideTransition] =
    useState<SlideTransition | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragState, setDragState] = useState<DragState>('idle');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const slideTimeoutRef = useRef<number | null>(null);
  const dragTimeoutRef = useRef<number | null>(null);
  const overlayViewportRef = useRef<HTMLDivElement | null>(null);

  const visibleActiveIndex =
    activeIndex === null || posts.length === 0
      ? null
      : Math.min(activeIndex, posts.length - 1);
  const activePost =
    visibleActiveIndex === null ? null : (posts[visibleActiveIndex] ?? null);
  const dragDirection = dragOffsetX === 0 ? 0 : dragOffsetX > 0 ? -1 : 1;
  const dragTargetIndex = useMemo(() => {
    if (
      visibleActiveIndex === null ||
      posts.length < 2 ||
      dragDirection === 0
    ) {
      return null;
    }

    return (
      (visibleActiveIndex + dragDirection + posts.length) % posts.length
    );
  }, [dragDirection, posts.length, visibleActiveIndex]);

  const getViewportWidth = useCallback(() => {
    const width = overlayViewportRef.current?.getBoundingClientRect().width;
    if (width && width > 0) return width;
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1;
  }, []);

  const resetDragState = useCallback(() => {
    if (dragTimeoutRef.current !== null) {
      window.clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
    setDragOffsetX(0);
    setDragState('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current !== null) {
        window.clearTimeout(slideTimeoutRef.current);
      }
      if (dragTimeoutRef.current !== null) {
        window.clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  const stepActivePost = useCallback(
    (direction: 1 | -1, fromOffsetPx = 0) => {
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
        fromOffsetPx,
        phase: 'idle',
        to: nextIndex,
      });
      setActiveIndex(nextIndex);
      setDragOffsetX(0);
      setDragState('idle');

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
    [posts.length, visibleActiveIndex],
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
    if (posts.length < 2 || slideTransition !== null) return;

    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isDragging.current = false;
    setDragOffsetX(0);
    setDragState('idle');
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (!isDragging.current) {
      if (Math.abs(deltaX) < 8) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
      isDragging.current = true;
      setDragState('dragging');
    }

    setDragOffsetX(deltaX);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (!isDragging.current) {
      resetDragState();
      return;
    }

    const minSwipeDistance = Math.min(getViewportWidth() * 0.18, 120);
    const isCommittedSwipe =
      Math.abs(deltaX) >= minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY);

    if (isCommittedSwipe) {
      stepActivePost(deltaX > 0 ? -1 : 1, deltaX);
    } else {
      setDragState('settling');
      setDragOffsetX(0);
      dragTimeoutRef.current = window.setTimeout(() => {
        setDragState('idle');
        dragTimeoutRef.current = null;
      }, SLIDE_DURATION_MS);
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
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
    role: 'current' | 'next',
  ) {
    const isTransitioning = slideTransition !== null;
    const isDraggingSlide = !isTransitioning && dragState === 'dragging';
    const isSettlingBack = !isTransitioning && dragState === 'settling';
    const isOutgoing = role === 'current';
    const direction = slideTransition?.direction ?? 1;
    const viewportWidth = getViewportWidth();
    const transitionOffsetPercent = slideTransition
      ? (slideTransition.fromOffsetPx / viewportWidth) * 100
      : 0;
    const dragOffsetPercent = (dragOffsetX / viewportWidth) * 100;

    let transform = 'translate3d(0, 0, 0)';
    let opacity = 1;

    if (isTransitioning) {
      if (slideTransition.phase === 'idle') {
        transform = isOutgoing
          ? `translate3d(${transitionOffsetPercent}%, 0, 0)`
          : `translate3d(${direction * 100 + transitionOffsetPercent}%, 0, 0)`;
        opacity = isOutgoing ? 1 : 0.92;
      } else {
        transform = isOutgoing
          ? `translate3d(${-direction * 100}%, 0, 0)`
          : 'translate3d(0, 0, 0)';
        opacity = isOutgoing ? 0.82 : 1;
      }
    } else if (isDraggingSlide && dragTargetIndex !== null) {
      const isDragOutgoing = role === 'current';

      transform = isDragOutgoing
        ? `translate3d(${dragOffsetPercent}%, 0, 0)`
        : `translate3d(${dragDirection * 100 + dragOffsetPercent}%, 0, 0)`;
      opacity = isDragOutgoing ? 1 : 0.92;
    }

    return (
      <div
        key={`${role}-${post.id}-${index}`}
        className='absolute inset-0 flex items-center justify-center px-14 sm:px-20'
        style={{
          opacity,
          transform,
          transition:
            isTransitioning || isSettlingBack
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
            <div className='text-center text-sm text-white/80'>
              {post.caption}
            </div>
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
        <div className='mt-36 flex-1 min-h-0 flex items-center justify-center'>
          <LuRefreshCw className='size-8 opacity-80 animate-spin' />
        </div>
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
                          current.filter((post) => post.id !== p.id),
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
              resetDragState();
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
            ref={overlayViewportRef}
            className='pointer-events-none relative h-full w-full overflow-hidden touch-pan-y'
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
            {slideTransition &&
              posts[slideTransition.from] &&
              renderActiveSlide(
                posts[slideTransition.from],
                slideTransition.from,
                'current',
              )}
            {!slideTransition &&
              dragTargetIndex !== null &&
              visibleActiveIndex !== null &&
              renderActiveSlide(activePost, visibleActiveIndex, 'current')}
            {slideTransition &&
              visibleActiveIndex !== null &&
              renderActiveSlide(activePost, visibleActiveIndex, 'next')}
            {!slideTransition &&
              dragTargetIndex !== null &&
              posts[dragTargetIndex] &&
              renderActiveSlide(posts[dragTargetIndex], dragTargetIndex, 'next')}
            {!slideTransition &&
              dragTargetIndex === null &&
              visibleActiveIndex !== null &&
              renderActiveSlide(activePost, visibleActiveIndex, 'current')}
          </div>
        </div>
      )}
    </div>
  );
}
