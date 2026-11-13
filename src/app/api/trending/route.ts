import { NextResponse } from 'next/server';
import { fetchCoinGeckoTrending } from '@/lib/api/coingecko';
import { DEFAULT_TICKERS } from '@/lib/constants';

export async function GET() {
  try {
    const rawTrending = await fetchCoinGeckoTrending();
    const trending = rawTrending.slice(0, 8).map((c: any) => ({
      id: c.item?.id,
      name: c.item?.name,
      symbol: c.item?.symbol,
      marketCapRank: c.item?.market_cap_rank,
      thumb: c.item?.thumb,
      priceBtc: c.item?.price_btc,
    }));

    return NextResponse.json({
      trending,
      defaultWatchlist: DEFAULT_TICKERS,
    });
  } catch (err: any) {
    console.error('[Trending Route Error]:', err);
    return NextResponse.json({ trending: [], defaultWatchlist: DEFAULT_TICKERS });
  }
}
