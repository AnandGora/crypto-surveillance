import { NextResponse } from 'next/server';
import { fetchFearAndGreed } from '@/lib/api/sentiment';

export async function GET() {
  try {
    const data = await fetchFearAndGreed();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    console.error('[Sentiment Route Error]:', err);
    return NextResponse.json({ value: 50, classification: 'Neutral', history: [] });
  }
}
