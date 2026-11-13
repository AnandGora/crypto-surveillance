import { NextResponse } from 'next/server';
import { fetchLiveCryptoNews } from '@/lib/api/news';

export async function GET() {
  try {
    const news = await fetchLiveCryptoNews();
    return NextResponse.json({ news }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (err: any) {
    console.error('[News Route Error]:', err);
    return NextResponse.json({ news: [], error: err?.message }, { status: 500 });
  }
}
