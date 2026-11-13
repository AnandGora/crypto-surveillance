import { DexPair } from '@/types/crypto';

export async function fetchDexPairs(query: string): Promise<DexPair[]> {
  const cleanQ = query.trim().toUpperCase();

  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 10 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.pairs || !Array.isArray(data.pairs)) return [];

    // Filter strictly to avoid scam/spoofed meme coins matching generic terms
    const filtered = data.pairs.filter((p: any) => {
      if (!p || !p.baseToken || !p.quoteToken) return false;
      const baseSym = (p.baseToken.symbol || '').toUpperCase();
      const baseName = (p.baseToken.name || '').toUpperCase();

      // Exact symbol match, or wrapped version (e.g. WBTC for BTC), or exact name match
      return (
        baseSym === cleanQ ||
        baseSym === `W${cleanQ}` ||
        baseSym === `${cleanQ}USDT` ||
        baseName === cleanQ
      );
    });

    // If strict filter found matches, use those; otherwise use all valid pairs
    const targetPairs = filtered.length > 0 ? filtered : data.pairs.filter((p: any) => p && p.baseToken && p.quoteToken);

    // Sort by liquidity USD
    const sorted = targetPairs
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
