import { MarketTicker, OrderBookData, KlinePoint } from '@/types/crypto';

function getBinanceHeaders(): Record<string, string> {
  const apiKey = process.env.BINANCE_LIVE_API_KEY || process.env.BINANCE_API_KEY;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'CryptoSurveillanceEngine/2.0',
  };
  if (apiKey) {
    headers['X-MBX-APIKEY'] = apiKey;
  }
  return headers;
}

export async function fetchBinanceTicker(symbol: string): Promise<MarketTicker | null> {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const isMemeThousand = ['PEPE', 'SHIB', 'LUNC', 'FLOKI', 'BONK', 'RATS', 'SATS', 'CAT'].includes(cleanSymbol);
  const binancePair = isMemeThousand ? `1000${cleanSymbol}USDT` : `${cleanSymbol}USDT`;
  const pair = `${cleanSymbol}USDT`;
  const headers = getBinanceHeaders();

  // 1. Try Binance Futures FIRST (User trades Binance Futures - exact live futures price match!)
  try {
    const resFut = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${binancePair}`, {
      next: { revalidate: 3 },
      headers,
    });

    if (resFut.ok) {
      const d = await resFut.json();
      const lastPrice = parseFloat(d.lastPrice);
      const highPrice = parseFloat(d.highPrice);
      const lowPrice = parseFloat(d.lowPrice);
      const priceChange = parseFloat(d.priceChange);
      const priceChangePercent = parseFloat(d.priceChangePercent);
      const volume = parseFloat(d.volume);
      const quoteVolume = parseFloat(d.quoteVolume);

      return {
        symbol: cleanSymbol,
        price: lastPrice,
        priceChange24h: priceChange,
        priceChangePercent24h: priceChangePercent,
        high24h: highPrice,
        low24h: lowPrice,
        volume24h: volume,
        quoteVolume24h: quoteVolume,
        bidPrice: lastPrice * 0.9998,
        askPrice: lastPrice * 1.0002,
        spreadPercent: 0.04,
      };
    }
  } catch (err) {}

  // 2. Try Binance Global Spot with API key header
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, {
      next: { revalidate: 5 },
      headers,
    });

    if (res.ok) {
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
    }
  } catch (err) {}

  // 2. Try Binance.US (Not geoblocked in US cloud regions)
  try {
    const resUS = await fetch(`https://api.binance.us/api/v3/ticker/24hr?symbol=${pair}`, {
      next: { revalidate: 10 },
      headers,
    });

    if (resUS.ok) {
      const d = await resUS.json();
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
    }
  } catch (err) {}

  // 3. Try Bybit Linear / Futures Ticker (Worldwide unrestricted, includes BARD and all perp contracts!)
  try {
    const resBybitLinear = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${binancePair}`, {
      next: { revalidate: 3 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (resBybitLinear.ok) {
      const d = await resBybitLinear.json();
      const item = d.result?.list?.[0];
      if (item && parseFloat(item.lastPrice || '0') > 0) {
        const lastPrice = parseFloat(item.lastPrice);
        const bidPrice = parseFloat(item.bid1Price || item.lastPrice);
        const askPrice = parseFloat(item.ask1Price || item.lastPrice);
        const spreadPercent = askPrice > 0 ? ((askPrice - bidPrice) / askPrice) * 100 : 0.05;

        return {
          symbol: cleanSymbol,
          price: lastPrice,
          priceChange24h: parseFloat(item.prevPrice24h ? String(lastPrice - parseFloat(item.prevPrice24h)) : '0'),
          priceChangePercent24h: parseFloat(item.price24hPcnt || '0') * 100,
          high24h: parseFloat(item.highPrice24h || item.lastPrice),
          low24h: parseFloat(item.lowPrice24h || item.lastPrice),
          volume24h: parseFloat(item.volume24h || '0'),
          quoteVolume24h: parseFloat(item.turnover24h || '0'),
          bidPrice,
          askPrice,
          spreadPercent: Math.max(0, spreadPercent),
        };
      }
    }
  } catch (err) {}

  // 4. Try Bybit Spot Ticker (Worldwide unrestricted)
  try {
    const resBybit = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${pair}`, {
      next: { revalidate: 10 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (resBybit.ok) {
      const d = await resBybit.json();
      const item = d.result?.list?.[0];
      if (item) {
        const bidPrice = parseFloat(item.bid1Price || item.lastPrice);
        const askPrice = parseFloat(item.ask1Price || item.lastPrice);
        const spreadPercent = askPrice > 0 ? ((askPrice - bidPrice) / askPrice) * 100 : 0;

        return {
          symbol: cleanSymbol,
          price: parseFloat(item.lastPrice),
          priceChange24h: parseFloat(item.prevPrice24h ? String(parseFloat(item.lastPrice) - parseFloat(item.prevPrice24h)) : '0'),
          priceChangePercent24h: parseFloat(item.price24hPcnt || '0') * 100,
          high24h: parseFloat(item.highPrice24h || item.lastPrice),
          low24h: parseFloat(item.lowPrice24h || item.lastPrice),
          volume24h: parseFloat(item.volume24h || '0'),
          quoteVolume24h: parseFloat(item.turnover24h || '0'),
          bidPrice,
          askPrice,
          spreadPercent: Math.max(0, spreadPercent),
        };
      }
    }
  } catch (err) {}

  return null;
}

export async function fetchBinanceDepth(symbol: string): Promise<OrderBookData | null> {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const isMemeThousand = ['PEPE', 'SHIB', 'LUNC', 'FLOKI', 'BONK', 'RATS', 'SATS', 'CAT'].includes(cleanSymbol);
  const binancePair = isMemeThousand ? `1000${cleanSymbol}USDT` : `${cleanSymbol}USDT`;
  const pair = `${cleanSymbol}USDT`;
  const headers = getBinanceHeaders();

  // 1. Try Binance Futures Depth FIRST (Real live futures contracts and dynamic depth)
  try {
    const resFut = await fetch(`https://fapi.binance.com/fapi/v1/depth?symbol=${binancePair}&limit=20`, {
      next: { revalidate: 3 },
      headers,
    });
    if (resFut.ok) {
      const d = await resFut.json();
      if (d.bids?.length && d.asks?.length) {
        return parseDepth(d.bids, d.asks);
      }
    }
  } catch (err) {}

  // 2. Try Binance Global Spot
  try {
    const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pair}&limit=20`, {
      next: { revalidate: 10 },
      headers,
    });
    if (res.ok) {
      const d = await res.json();
      return parseDepth(d.bids, d.asks);
    }
  } catch (err) {}

  // 2. Try Binance.US
  try {
    const resUS = await fetch(`https://api.binance.us/api/v3/depth?symbol=${pair}&limit=20`, {
      next: { revalidate: 10 },
      headers,
    });
    if (resUS.ok) {
      const d = await resUS.json();
      return parseDepth(d.bids, d.asks);
    }
  } catch (err) {}

  // 4. Try Bybit Linear / Futures Orderbook (Worldwide unrestricted, includes BARD & all futures)
  try {
    const resBybitLinear = await fetch(`https://api.bybit.com/v5/market/orderbook?category=linear&symbol=${binancePair}&limit=20`, {
      next: { revalidate: 3 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (resBybitLinear.ok) {
      const d = await resBybitLinear.json();
      const b = (d.result?.b || []).map((x: any) => [x[0], x[1]]);
      const a = (d.result?.a || []).map((x: any) => [x[0], x[1]]);
      if (b.length && a.length) {
        return parseDepth(b, a);
      }
    }
  } catch (err) {}

  // 5. Try Bybit Spot Orderbook
  try {
    const resBybit = await fetch(`https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${pair}&limit=20`, {
      next: { revalidate: 10 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (resBybit.ok) {
      const d = await resBybit.json();
      const b = (d.result?.b || []).map((x: any) => [x[0], x[1]]);
      const a = (d.result?.a || []).map((x: any) => [x[0], x[1]]);
      return parseDepth(b, a);
    }
  } catch (err) {}

  return null;
}

function parseDepth(rawBids: any[], rawAsks: any[]): OrderBookData {
  let bidSum = 0;
  const bids = (rawBids || []).slice(0, 10).map((b: [string, string]) => {
    const price = parseFloat(b[0]);
    const quantity = parseFloat(b[1]);
    bidSum += quantity;
    return { price, quantity, total: bidSum };
  });

  let askSum = 0;
  const asks = (rawAsks || []).slice(0, 10).map((a: [string, string]) => {
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
}

export async function fetchBinanceKlines(symbol: string, interval = '1h', limit = 40): Promise<KlinePoint[]> {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const pair = `${cleanSymbol}USDT`;
  const headers = getBinanceHeaders();

  // 1. Try Binance Global
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`, {
      next: { revalidate: 30 },
      headers,
    });

    if (res.ok) {
      const raw = await res.json();
      const rawKlines: KlinePoint[] = raw.map((k: (string | number)[]) => ({
        time: Number(k[0]),
        open: parseFloat(String(k[1])),
        high: parseFloat(String(k[2])),
        low: parseFloat(String(k[3])),
        close: parseFloat(String(k[4])),
        volume: parseFloat(String(k[5])),
      }));
      return calculateTechnicalIndicators(rawKlines);
    }
  } catch (err) {}

  // 2. Try Bybit Klines (Unrestricted globally)
  try {
    const bybitInterval = interval === '15m' ? '15' : interval === '1h' ? '60' : interval === '4h' ? '240' : 'D';
    const resBybit = await fetch(`https://api.bybit.com/v5/market/kline?category=spot&symbol=${pair}&interval=${bybitInterval}&limit=${limit}`, {
      next: { revalidate: 30 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (resBybit.ok) {
      const d = await resBybit.json();
      const list = (d.result?.list || []).reverse();
      const rawKlines: KlinePoint[] = list.map((k: any) => ({
        time: Number(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
      return calculateTechnicalIndicators(rawKlines);
    }
  } catch (err) {}

  return [];
}

function calculateTechnicalIndicators(klines: KlinePoint[]): KlinePoint[] {
  if (klines.length < 5) return klines;

  const k20 = 2 / (20 + 1);
  let ema20 = klines[0].close;

  const k50 = 2 / (50 + 1);
  let ema50 = klines[0].close;

  const period = 14;
  let avgGain = 0;
  let avgLoss = 0;

  return klines.map((k, i) => {
    ema20 = (k.close - ema20) * k20 + ema20;
    ema50 = (k.close - ema50) * k50 + ema50;

    let rsi = 50;
    if (i > 0) {
      const change = k.close - klines[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      if (i <= period) {
        avgGain = (avgGain * (i - 1) + gain) / i;
        avgLoss = (avgLoss * (i - 1) + loss) / i;
      } else {
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
      }

      if (avgLoss === 0) {
        rsi = 100;
      } else {
        const rs = avgGain / avgLoss;
        rsi = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
      }
    }

    return {
      ...k,
      rsi,
      ema20: Math.round(ema20 * 100) / 100,
      ema50: Math.round(ema50 * 100) / 100,
    };
  });
}
