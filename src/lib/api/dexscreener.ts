import { DexPair } from '@/types/crypto';

export async function fetchDexPairs(query: string): Promise<DexPair[]> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 20 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.pairs || !Array.isArray(data.pairs)) return [];

    // Filter top pairs sorted by liquidity
    const sorted = data.pairs
      .filter((p: any) => p && p.baseToken && p.quoteToken)
      .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
      .slice(0, 10);

    return sorted.map((p: any) => ({
      chainId: p.chainId || 'unknown',
      dexId: p.dexId || 'unknown',
      pairAddress: p.pairAddress || '',
      baseToken: {
        address: p.baseToken?.address || '',
        name: p.baseToken?.name || '',
        symbol: p.baseToken?.symbol || '',
      },
      quoteToken: {
        symbol: p.quoteToken?.symbol || '',
      },
      priceUsd: p.priceUsd || '0',
      liquidityUsd: parseFloat(p.liquidity?.usd || '0'),
      fdv: parseFloat(p.fdv || '0'),
      volume24h: parseFloat(p.volume?.h24 || '0'),
      txns24h: {
        buys: parseInt(p.txns?.h24?.buys || '0', 10),
        sells: parseInt(p.txns?.h24?.sells || '0', 10),
      },
      priceChange24h: parseFloat(p.priceChange?.h24 || '0'),
    }));
  } catch (err) {
    console.warn(`[DexScreener Error for ${query}]:`, err);
    return [];
  }
}
