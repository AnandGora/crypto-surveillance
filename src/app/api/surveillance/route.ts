import { NextRequest, NextResponse } from 'next/server';
import { runSurveillance } from '@/lib/surveillance-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get('coin') || 'BTC';
  const interval = searchParams.get('interval') || '1h';

  try {
    const report = await runSurveillance(coin, interval);
    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (err: any) {
    console.error(`[Surveillance Route Error for ${coin}]:`, err);
    return NextResponse.json(
      { error: 'Failed to process surveillance query', details: err?.message },
      { status: 500 }
    );
  }
}
