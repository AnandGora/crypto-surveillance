import { MarketTicker, OrderBookData, KlinePoint } from '@/types/crypto';

export async function fetchBinanceTicker(symbol: string): Promise<MarketTicker | null> {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const pair = `${cleanSymbol}USDT`;

  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, {
      next: { revalidate: 10 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return null;

    const d = await res.json();
    const bidPrice = parseFloat(d.bidPrice) || parseFloat(d.lastPrice);
    const askPrice = parseFloat(d.askPrice) || parseFloat(d.lastPrice);
    const spreadPercent = askPrice > 0 ? ((askPrice - bidPrice) / askPrice) * 100 : 0;

    return {
      symbol: cleanSymbol,
      price: parseFloat(d.lastPrice),
      priceChange24h: parseFloat(d.priceChange),
      priceChangePercent24h: parseFloat(d.priceChangePercent),
      high24h: parseFloat(d.highPrice),
      low24h: parseFloat(d.lowPrice),
      volume24h: parseFloat(d.volume),
      quoteVolume24h: parseFloat(d.quoteVolume),
      bidPrice,
      askPrice,
      spreadPercent: Math.max(0, spreadPercent),
    };
  } catch (err) {
    console.warn(`[Binance Ticker Error for ${symbol}]:`, err);
    return null;
  }
}

export async function fetchBinanceDepth(symbol: string): Promise<OrderBookData | null> {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const pair = `${cleanSymbol}USDT`;

  try {
    const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pair}&limit=20`, {
      next: { revalidate: 10 },
    });

    if (!res.ok) return null;

    const d = await res.json();
    let bidSum = 0;
    const bids = (d.bids || []).slice(0, 10).map((b: [string, string]) => {
      const price = parseFloat(b[0]);
      const quantity = parseFloat(b[1]);
      bidSum += quantity;
      return { price, quantity, total: bidSum };
    });

    let askSum = 0;
    const asks = (d.asks || []).slice(0, 10).map((a: [string, string]) => {
      const price = parseFloat(a[0]);
      const quantity = parseFloat(a[1]);
      askSum += quantity;
      return { price, quantity, total: askSum };
    });

    const totalVolume = bidSum + askSum;
    const buyPressurePercent = totalVolume > 0 ? (bidSum / totalVolume) * 100 : 50;
    const sellPressurePercent = totalVolume > 0 ? (askSum / totalVolume) * 100 : 50;
    const imbalanceRatio = askSum > 0 ? bidSum / askSum : 1;

    return {
      bids,
      asks,
      totalBidVolume: bidSum,
      totalAskVolume: askSum,
      buyPressurePercent: Math.round(buyPressurePercent * 10) / 10,
      sellPressurePercent: Math.round(sellPressurePercent * 10) / 10,
      imbalanceRatio: Math.round(imbalanceRatio * 100) / 100,
    };
  } catch (err) {
    console.warn(`[Binance Depth Error for ${symbol}]:`, err);
    return null;
  }
}

export async function fetchBinanceKlines(symbol: string, interval = '1h', limit = 24): Promise<KlinePoint[]> {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const pair = `${cleanSymbol}USDT`;

  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) return [];

    const raw = await res.json();
    return raw.map((k: (string | number)[]) => ({
      time: Number(k[0]),
      open: parseFloat(String(k[1])),
      high: parseFloat(String(k[2])),
      low: parseFloat(String(k[3])),
      close: parseFloat(String(k[4])),
      volume: parseFloat(String(k[5])),
    }));
  } catch (err) {
    console.warn(`[Binance Klines Error for ${symbol}]:`, err);
    return [];
  }
}
