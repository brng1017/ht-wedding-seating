import { NextResponse } from 'next/server';
import { fetchGuestsFromSheet } from '@/lib/sheets';

let cache: { at: number; data: any[] } | null = null;
const TTL_MS = 60000; // 1 minute cache (tweak)

export async function GET() {
  try {
    const now = Date.now();
    if (cache && now - cache.at < TTL_MS) {
      return NextResponse.json({ guests: cache.data, cached: true });
    }

    const guests = await fetchGuestsFromSheet();
    cache = { at: now, data: guests };

    return NextResponse.json({ guests, cached: false });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to load guests' },
      { status: 500 }
    );
  }
}
