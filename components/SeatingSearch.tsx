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

    async function loadGuests() {
      setLoading(true);

      try {
        const res = await fetch('/api/guests', { cache: 'no-store' });
        if (!res.ok) throw new Error('Network error');

        const json = await res.json();
        if (!mounted) return;

        const guestList = Array.isArray(json.guests) ? json.guests : [];
        setGuests(guestList);
        localStorage.setItem('wedding_guests_cache', JSON.stringify(guestList));
      } catch {
        const cached = localStorage.getItem('wedding_guests_cache');
        if (cached && mounted) {
          try {
            const parsed = JSON.parse(cached);
            setGuests(Array.isArray(parsed) ? parsed : []);
          } catch {
            localStorage.removeItem('wedding_guests_cache');
            setGuests([]);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadGuests();
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
    <div className='w-full flex-1 p-4 flex flex-col min-h-0'>
      <input
        className='w-full border-b px-4 py-3 text-sm text-center uppercase'
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
        <div className='mt-4 space-y-3 flex-1 min-h-0 overflow-y-auto'>
          {results.length === 0 ? (
            <div className='p-4 opacity-60 uppercase text-center'>
              <div>No matches yet</div>
            </div>
          ) : (
            results.map((g) => (
              <div key={`${g.name}-${g.table}`} className='p-2 text-center'>
                <div className='text-lg font-light opacity-80 uppercase'>
                  {g.name} | Table {g.table}
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
