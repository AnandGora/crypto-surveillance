import { FuturesMetrics } from '@/types/crypto';

export async function fetchBinanceFuturesMetrics(symbol: string): Promise<FuturesMetrics> {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  
  // Binance Futures symbol formatting (e.g. PEPE is 1000PEPEUSDT, SHIB is 1000SHIBUSDT, LUNC is 1000LUNCUSDT)
  const isMemeThousand = ['PEPE', 'SHIB', 'LUNC', 'FLOKI', 'BONK', 'RATS', 'SATS', 'CAT'].includes(cleanSymbol);
  const pair = isMemeThousand ? `1000${cleanSymbol}USDT` : `${cleanSymbol}USDT`;

  const fallback: FuturesMetrics = {
    hasFutures: false,
    markPrice: 0,
    indexPrice: 0,
    openInterest: 0,
    openInterestUsd: 0,
    openInterestChange24h: 0,
    openInterestHistory: [],
    fundingRate: 0,
    fundingRatePercent: 0,
    annualizedFundingRate: 0,
    nextFundingTime: 0,
    fundingCountdown: '0h 0m',
    fundingPayer: 'Neutral',
    topLongShortPositionRatio: { ratio: 1, longPercent: 50, shortPercent: 50 },
    topLongShortAccountRatio: { ratio: 1, longPercent: 50, shortPercent: 50 },
    globalLongShortAccountRatio: { ratio: 1, longPercent: 50, shortPercent: 50 },
    takerBuySell: { ratio: 1, buyVol: 0, sellVol: 0, buyPercent: 50, sellPercent: 50 },
    squeezeRisk: 'BALANCED / NEUTRAL',
  };

  try {
    const [premiumRes, oiRes, oiHistRes, topPosRes, topAccRes, globalAccRes, takerRes] = await Promise.all([
      fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${pair}`, { next: { revalidate: 15 } }),
      fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${pair}`, { next: { revalidate: 15 } }),
      fetch(`https://fapi.binance.com/futures/data/openInterestHist?symbol=${pair}&period=1h&limit=24`, { next: { revalidate: 60 } }),
      fetch(`https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=${pair}&period=1h&limit=1`, { next: { revalidate: 30 } }),
      fetch(`https://fapi.binance.com/futures/data/topLongShortAccountRatio?symbol=${pair}&period=1h&limit=1`, { next: { revalidate: 30 } }),
      fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${pair}&period=1h&limit=1`, { next: { revalidate: 30 } }),
      fetch(`https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=${pair}&period=1h&limit=1`, { next: { revalidate: 30 } }),
    ]);

    if (!premiumRes.ok) {
      return fallback;
    }

    const premiumData = await premiumRes.json();
    const oiData = oiRes.ok ? await oiRes.json() : null;
    const oiHistData = oiHistRes.ok ? await oiHistRes.json() : [];
    const topPosData = topPosRes.ok ? await topPosRes.json() : [];
    const topAccData = topAccRes.ok ? await topAccRes.json() : [];
    const globalAccData = globalAccRes.ok ? await globalAccRes.json() : [];
    const takerData = takerRes.ok ? await takerRes.json() : [];

    const fundingRate = parseFloat(premiumData.lastFundingRate || '0');
    const fundingRatePercent = fundingRate * 100;
    const annualizedFundingRate = fundingRatePercent * 3 * 365;
    const nextFundingTime = parseInt(premiumData.nextFundingTime || '0', 10);

    // Calculate funding countdown
    let fundingCountdown = '0h 0m';
    if (nextFundingTime > Date.now()) {
      const diffMs = nextFundingTime - Date.now();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      fundingCountdown = `${diffHours}h ${diffMins}m`;
    }

    const fundingPayer: FuturesMetrics['fundingPayer'] =
      fundingRate > 0.00005
        ? 'Longs Pay Shorts'
        : fundingRate < -0.00005
        ? 'Shorts Pay Longs'
        : 'Neutral';

    // Open Interest
    const openInterest = parseFloat(oiData?.openInterest || '0');
    const markPrice = parseFloat(premiumData.markPrice || '0');
    const indexPrice = parseFloat(premiumData.indexPrice || '0');
    const openInterestUsd = openInterest * markPrice;

    // OI History & 24h change
    const openInterestHistory = Array.isArray(oiHistData)
      ? oiHistData.map((item: any) => ({
          time: item.timestamp,
          value: parseFloat(item.sumOpenInterestValue || '0'),
        }))
      : [];

    let openInterestChange24h = 0;
    if (openInterestHistory.length >= 2) {
      const first = openInterestHistory[0].value;
      const last = openInterestHistory[openInterestHistory.length - 1].value;
      if (first > 0) {
        openInterestChange24h = ((last - first) / first) * 100;
      }
    }

    // Top Trader Position Ratio
    const topPos = topPosData[0];
    const topLongPercent = topPos ? parseFloat(topPos.longPosition || topPos.longAccount || '0.5') * 100 : 50;
    const topShortPercent = topPos ? parseFloat(topPos.shortPosition || topPos.shortAccount || '0.5') * 100 : 50;
    const topPosRatio = topPos ? parseFloat(topPos.longShortRatio || '1') : 1;

    // Top Trader Account Ratio
    const topAcc = topAccData[0];
    const topAccLongPercent = topAcc ? parseFloat(topAcc.longAccount || '0.5') * 100 : 50;
    const topAccShortPercent = topAcc ? parseFloat(topAcc.shortAccount || '0.5') * 100 : 50;
    const topAccRatio = topAcc ? parseFloat(topAcc.longShortRatio || '1') : 1;

    // Global Account Ratio
    const globalAcc = globalAccData[0];
    const globalLongPercent = globalAcc ? parseFloat(globalAcc.longAccount || '0.5') * 100 : 50;
    const globalShortPercent = globalAcc ? parseFloat(globalAcc.shortAccount || '0.5') * 100 : 50;
    const globalRatio = globalAcc ? parseFloat(globalAcc.longShortRatio || '1') : 1;

    // Taker Buy / Sell Volume
    const taker = takerData[0];
    const takerBuyVol = taker ? parseFloat(taker.buyVol || '0') : 0;
    const takerSellVol = taker ? parseFloat(taker.sellVol || '0') : 0;
    const takerTotal = takerBuyVol + takerSellVol;
    const takerRatio = taker ? parseFloat(taker.buySellRatio || '1') : 1;
    const takerBuyPercent = takerTotal > 0 ? (takerBuyVol / takerTotal) * 100 : 50;
    const takerSellPercent = takerTotal > 0 ? (takerSellVol / takerTotal) * 100 : 50;

    // Squeeze Risk Detector
    let squeezeRisk: FuturesMetrics['squeezeRisk'] = 'BALANCED / NEUTRAL';
    if (fundingRate < -0.0003 && topLongPercent > 55) {
      squeezeRisk = 'HIGH SHORT SQUEEZE RISK'; // Heavy shorts paying longs while smart money is long
    } else if (fundingRate > 0.0005 && globalLongPercent > 65) {
      squeezeRisk = 'HIGH LONG LIQUIDATION RISK'; // Over-leveraged retail longs
    }

    return {
      hasFutures: true,
      markPrice,
      indexPrice,
      openInterest,
      openInterestUsd,
      openInterestChange24h,
      openInterestHistory,
      fundingRate,
      fundingRatePercent,
      annualizedFundingRate,
      nextFundingTime,
      fundingCountdown,
      fundingPayer,
      topLongShortPositionRatio: {
        ratio: topPosRatio,
        longPercent: Math.round(topLongPercent * 10) / 10,
        shortPercent: Math.round(topShortPercent * 10) / 10,
      },
      topLongShortAccountRatio: {
        ratio: topAccRatio,
        longPercent: Math.round(topAccLongPercent * 10) / 10,
        shortPercent: Math.round(topAccShortPercent * 10) / 10,
      },
      globalLongShortAccountRatio: {
        ratio: globalRatio,
        longPercent: Math.round(globalLongPercent * 10) / 10,
        shortPercent: Math.round(globalShortPercent * 10) / 10,
      },
      takerBuySell: {
        ratio: takerRatio,
        buyVol: takerBuyVol,
        sellVol: takerSellVol,
        buyPercent: Math.round(takerBuyPercent * 10) / 10,
        sellPercent: Math.round(takerSellPercent * 10) / 10,
      },
      squeezeRisk,
    };
  } catch (err) {
    console.warn(`[Binance Futures Error for ${symbol}]:`, err);
    return fallback;
  }
}
