'use client';

import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';

type Guest = { name: string; table: string; party?: string; notes?: string };

export default function SeatingSearch() {
  const [query, setQuery] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await fetch('/api/guests', { cache: 'no-store' });
      const json = await res.json();
      if (mounted) {
        setGuests(json.guests ?? []);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(guests, {
      keys: ['name', 'party'],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [guests]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse
      .search(q)
      .slice(0, 10)
      .map((r) => r.item);
  }, [query, fuse]);

  return (
    <div className='mx-auto max-w-xl p-4'>
      <h1 className='text-2xl font-semibold'>Find Your Table</h1>
      <p className='mt-2 text-sm opacity-80'>
        Type your name. If you're in a group, try the family name.
      </p>

      <input
        className='mt-4 w-full rounded-xl border px-4 py-3 text-lg'
        placeholder={
          loading ? 'Loading guest list...' : 'Start typing your name...'
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        autoComplete='off'
        inputMode='search'
      />

      {query.trim() && (
        <div className='mt-4 space-y-3'>
          {results.length === 0 ? (
            <div className='rounded-xl border p-4'>
              <div className='font-medium'>No matches yet</div>
              <div className='text-sm opacity-80 mt-1'>
                Try a shorter version (e.g., "Chris" instead of "Christopher").
              </div>
            </div>
          ) : (
            results.map((g) => (
              <div
                key={`${g.name}-${g.table}`}
                className='rounded-xl border p-4'
              >
                <div className='flex items-baseline justify-between gap-4'>
                  <div className='font-semibold text-lg'>{g.name}</div>
                  <div className='text-xl font-bold'>Table {g.table}</div>
                </div>
                {(g.party || g.notes) && (
                  <div className='mt-2 text-sm opacity-80'>
                    {g.party ? <span>Party: {g.party}</span> : null}
                    {g.party && g.notes ? <span> • </span> : null}
                    {g.notes ? <span>Notes: {g.notes}</span> : null}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
