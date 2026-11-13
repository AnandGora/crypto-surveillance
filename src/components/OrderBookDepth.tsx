'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Layers, ArrowDownUp, AlertCircle, TrendingUp, TrendingDown, Radio, Activity } from 'lucide-react';
import { OrderBookData } from '@/types/crypto';

interface OrderBookDepthProps {
  orderBook: OrderBookData;
  symbol: string;
}

export function OrderBookDepth({ orderBook: initialOrderBook, symbol }: OrderBookDepthProps) {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const isMemeThousand = ['PEPE', 'SHIB', 'LUNC', 'FLOKI', 'BONK', 'RATS', 'SATS', 'CAT'].includes(cleanSymbol);
  const binancePair = isMemeThousand ? `1000${cleanSymbol}USDT` : `${cleanSymbol}USDT`;

  const [orderBook, setOrderBook] = useState<OrderBookData>(initialOrderBook);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [lastTickTime, setLastTickTime] = useState<number>(Date.now());
  const wsRef = useRef<WebSocket | null>(null);

  // Sync initial orderbook when symbol changes
  useEffect(() => {
    setOrderBook(initialOrderBook);
  }, [initialOrderBook, symbol]);

  // Connect to Binance Futures Live WebSocket (100ms L2 Depth stream)
  useEffect(() => {
    let isCancelled = false;

    // Helper to parse Binance raw depth array
    const processDepth = (rawBids: any[], rawAsks: any[]) => {
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
    };

    // 1. Initial immediate client-side fetch from Binance Futures
    const fetchDirectDepth = async () => {
      try {
        const res = await fetch(`https://fapi.binance.com/fapi/v1/depth?symbol=${binancePair}&limit=20`);
        if (res.ok && !isCancelled) {
          const d = await res.json();
          if (d.bids && d.asks) {
            setOrderBook(processDepth(d.bids, d.asks));
            setIsLiveConnected(true);
            setLastTickTime(Date.now());
          }
        }
      } catch (e) {}
    };

    fetchDirectDepth();

    // 2. Open Real-Time WebSocket for Binance Futures (100ms updates)
    const streamName = `${binancePair.toLowerCase()}@depth20@100ms`;
    const wsUrl = `wss://fstream.binance.com/ws/${streamName}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isCancelled) setIsLiveConnected(true);
      };

      ws.onmessage = (event) => {
        if (isCancelled) return;
        try {
          const data = JSON.parse(event.data);
          if (data.b && data.a) {
            setOrderBook(processDepth(data.b, data.a));
            setIsLiveConnected(true);
            setLastTickTime(Date.now());
          }
        } catch (e) {}
      };

      ws.onerror = () => {
        // Fallback to 1s polling if WebSocket drops
        if (!isCancelled) setIsLiveConnected(false);
      };

      ws.onclose = () => {
        if (!isCancelled) setIsLiveConnected(false);
      };
    } catch (e) {}

    // 3. Fallback polling timer (every 1.5s) if WebSocket is not receiving
    const pollTimer = setInterval(() => {
      if (!isCancelled && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        fetchDirectDepth();
      }
    }, 1500);

    return () => {
      isCancelled = true;
      clearInterval(pollTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [binancePair]);

  const { bids, asks, totalBidVolume, totalAskVolume, buyPressurePercent, sellPressurePercent, imbalanceRatio } =
    orderBook;

  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 1,
    asks[asks.length - 1]?.total || 1
  );

  const formatPrice = (p: number) => {
    if (!p) return '0.00';
    if (p >= 1000) return p.toFixed(2);
    if (p >= 1) return p.toFixed(4);
    return p.toFixed(6);
  };

  const formatSize = (q: number) => {
    if (!q) return '0';
    if (q >= 1000000) return `${(q / 1000000).toFixed(2)}M`;
    if (q >= 1000) return `${(q / 1000).toFixed(1)}K`;
    return q.toFixed(2);
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Order Book Liquidity & Depth Surveillance
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800">
                {binancePair}
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Live Binance Futures Order Flow • Bid/Ask Imbalance • Top 10 Bids & Asks
            </p>
          </div>
        </div>

        {/* Live Stream Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
            <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
            <span>{isLiveConnected ? 'BINANCE FUTURES LIVE (100ms)' : 'POLLING LIVE (1s)'}</span>
          </div>
        </div>
      </div>

      {/* Buy vs Sell Pressure Meter */}
      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>BUY PRESSURE: {buyPressurePercent}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span>SELL PRESSURE: {sellPressurePercent}%</span>
            <TrendingDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Dual Bar */}
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-zinc-800 p-0.5">
          <div
            className="h-full rounded-l-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
            style={{ width: `${buyPressurePercent}%` }}
          />
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-300"
            style={{ width: `${sellPressurePercent}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Bid Liquidity: <strong className="text-emerald-400">{formatSize(totalBidVolume)}</strong></span>
          <span className="font-semibold text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            Imbalance: <strong className={imbalanceRatio >= 1 ? 'text-emerald-400' : 'text-rose-400'}>{imbalanceRatio.toFixed(2)}x</strong>
          </span>
          <span>Ask Liquidity: <strong className="text-rose-400">{formatSize(totalAskVolume)}</strong></span>
        </div>
      </div>

      {/* Dual Table: Bids (left) and Asks (right) */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* BIDS */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-emerald-400 border-b border-zinc-800 pb-1.5">
            <span>Bid Price (USDT)</span>
            <span>Size</span>
            <span>Cumulative</span>
          </div>
          <div className="mt-1 space-y-1">
            {bids.slice(0, 8).map((b, idx) => {
              const widthPct = Math.min(100, Math.round((b.total / maxTotal) * 100));
              return (
                <div key={idx} className="relative flex items-center justify-between px-2 py-1 text-xs rounded transition-all duration-200">
                  {/* Depth background fill */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 rounded transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="relative font-mono font-bold text-emerald-400">
                    ${formatPrice(b.price)}
                  </span>
                  <span className="relative font-mono text-zinc-200 font-semibold">{formatSize(b.quantity)}</span>
                  <span className="relative font-mono text-[10px] text-zinc-500">{formatSize(b.total)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ASKS */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-rose-400 border-b border-zinc-800 pb-1.5">
            <span>Ask Price (USDT)</span>
            <span>Size</span>
            <span>Cumulative</span>
          </div>
          <div className="mt-1 space-y-1">
            {asks.slice(0, 8).map((a, idx) => {
              const widthPct = Math.min(100, Math.round((a.total / maxTotal) * 100));
              return (
                <div key={idx} className="relative flex items-center justify-between px-2 py-1 text-xs rounded transition-all duration-200">
                  {/* Depth background fill */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-rose-500/15 rounded transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="relative font-mono font-bold text-rose-400">
                    ${formatPrice(a.price)}
                  </span>
                  <span className="relative font-mono text-zinc-200 font-semibold">{formatSize(a.quantity)}</span>
                  <span className="relative font-mono text-[10px] text-zinc-500">{formatSize(a.total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60">
        <span>Active Spread: <strong className="text-zinc-300">{(((asks[0]?.price - bids[0]?.price) / (asks[0]?.price || 1)) * 100 || 0.01).toFixed(4)}%</strong></span>
        <span className="flex items-center gap-1 font-mono">
          <Activity className="h-3 w-3 text-cyan-400" />
          WebSocket Stream Active
        </span>
      </div>
    </div>
  );
}
