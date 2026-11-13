'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Filter,
  Flame,
  Radio,
  Zap,
} from 'lucide-react';
import { TradeTick } from '@/types/crypto';

interface WhaleTradesTapeProps {
  symbol: string;
  currentPrice?: number;
}

export function WhaleTradesTape({ symbol, currentPrice = 0 }: WhaleTradesTapeProps) {
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');
  const isMemeThousand = ['PEPE', 'SHIB', 'LUNC', 'FLOKI', 'BONK', 'RATS', 'SATS', 'CAT'].includes(cleanSymbol);
  const binancePair = isMemeThousand ? `1000${cleanSymbol}USDT` : `${cleanSymbol}USDT`;

  const [trades, setTrades] = useState<TradeTick[]>([]);
  const [filter, setFilter] = useState<'all' | 'dolphin' | 'whale'>('all');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Cumulative whale flow
  const [buyVol, setBuyVol] = useState<number>(0);
  const [sellVol, setSellVol] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play audio ping on big whale trade
  const playPing = (isBuy: boolean) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isBuy ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  useEffect(() => {
    let isCancelled = false;
    setTrades([]);
    setBuyVol(0);
    setSellVol(0);

    // 1. Initial REST fetch for recent trades
    const fetchRecentTrades = async () => {
      try {
        const res = await fetch(`https://fapi.binance.com/fapi/v1/trades?symbol=${binancePair}&limit=40`);
        if (res.ok && !isCancelled) {
          const list = await res.json();
          if (Array.isArray(list)) {
            let initialBuy = 0;
            let initialSell = 0;
            const parsed: TradeTick[] = list.map((item: any) => {
              const price = parseFloat(item.price);
              const qty = parseFloat(item.qty);
              const quote = price * qty;
              const isBuyerMaker = item.isBuyerMaker; // true = taker sell; false = taker buy

              if (!isBuyerMaker) initialBuy += quote;
              else initialSell += quote;

              return {
                id: item.id,
                time: item.time,
                price,
                quantity: qty,
                quoteQuantity: quote,
                isBuyerMaker,
                isWhale: quote >= 50000,
                isDolphin: quote >= 10000 && quote < 50000,
              };
            });

            setTrades(parsed.reverse());
            setBuyVol(initialBuy);
            setSellVol(initialSell);
            setIsConnected(true);
          }
        }
      } catch (e) {}
    };

    fetchRecentTrades();

    // 2. Real-Time Binance Futures aggTrade WebSocket
    const wsUrl = `wss://fstream.binance.com/ws/${binancePair.toLowerCase()}@aggTrade`;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isCancelled) setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (isCancelled || isPaused) return;
        try {
          const data = JSON.parse(event.data);
          if (data.e === 'aggTrade') {
            const price = parseFloat(data.p);
            const qty = parseFloat(data.q);
            const quote = price * qty;
            const isBuyerMaker = data.m; // true = sell, false = buy
            const isWhale = quote >= 50000;
            const isDolphin = quote >= 10000 && quote < 50000;

            if (isWhale) {
              playPing(!isBuyerMaker);
            }

            const newTick: TradeTick = {
              id: data.a,
              time: data.T,
              price,
              quantity: qty,
              quoteQuantity: quote,
              isBuyerMaker,
              isWhale,
              isDolphin,
            };

            setTrades((prev) => [newTick, ...prev.slice(0, 79)]);

            if (!isBuyerMaker) {
              setBuyVol((b) => b + quote);
            } else {
              setSellVol((s) => s + quote);
            }
          }
        } catch (e) {}
      };

      ws.onerror = () => setIsConnected(false);
      ws.onclose = () => setIsConnected(false);
    } catch (e) {}

    return () => {
      isCancelled = true;
      if (wsRef.current) wsRef.current.close();
    };
  }, [binancePair, isPaused]);

  // Filter trades
  const filteredTrades = trades.filter((t) => {
    if (filter === 'whale') return t.isWhale;
    if (filter === 'dolphin') return t.isWhale || t.isDolphin;
    return true;
  });

  const totalFlow = buyVol + sellVol;
  const buyRatio = totalFlow > 0 ? (buyVol / totalFlow) * 100 : 50;
  const sellRatio = 100 - buyRatio;

  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toFixed(2);
    if (p >= 1) return p.toFixed(4);
    return p.toFixed(6);
  };

  const formatUSD = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toTimeString().split(' ')[0];
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live Whale Trades Tape</h3>
              <span className="flex items-center gap-1 rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                BINANCE FUTURES STREAM
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Real-time contract order execution, aggressive market fills & whale prints
            </p>
          </div>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Whale Audio Pings' : 'Enable Whale Audio Pings'}
            className={`rounded-lg p-2 text-xs border transition-colors ${
              soundEnabled
                ? 'border-cyan-500/80 bg-cyan-950/60 text-cyan-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume Trade Stream' : 'Pause Trade Stream'}
            className={`rounded-lg p-2 text-xs border transition-colors ${
              isPaused
                ? 'border-amber-500/80 bg-amber-950/60 text-amber-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>

          {/* Filter Pills */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === 'all' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setFilter('dolphin')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === 'dolphin' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              &gt; $10K
            </button>
            <button
              onClick={() => setFilter('whale')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === 'whale' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🐋 Whales (&gt; $50K)
            </button>
          </div>
        </div>
      </div>

      {/* Cumulative Flow Pressure Bar */}
      <div className="mb-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Taker Buy Flow: {buyRatio.toFixed(1)}% ({formatUSD(buyVol)})
          </span>
          <span className="flex items-center gap-1.5 font-bold text-rose-400">
            Taker Sell Flow: {sellRatio.toFixed(1)}% ({formatUSD(sellVol)})
            <TrendingDown className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
            style={{ width: `${buyRatio}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-300"
            style={{ width: `${sellRatio}%` }}
          />
        </div>
      </div>

      {/* Trades Table Header */}
      <div className="grid grid-cols-5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-1.5 border-b border-zinc-800/60">
        <div>Time</div>
        <div>Side / Type</div>
        <div className="text-right">Price (USDT)</div>
        <div className="text-right">Amount ({cleanSymbol})</div>
        <div className="text-right">Volume (USD)</div>
      </div>

      {/* Real-time Trades List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/40 font-mono text-xs pr-1">
        {filteredTrades.length > 0 ? (
          filteredTrades.map((trade) => {
            const isBuy = !trade.isBuyerMaker; // taker buy = aggressive long fill

            return (
              <div
                key={trade.id}
                className={`grid grid-cols-5 items-center px-3 py-2 transition-colors ${
                  trade.isWhale
                    ? isBuy
                      ? 'bg-emerald-950/40 border-l-2 border-emerald-400'
                      : 'bg-rose-950/40 border-l-2 border-rose-400'
                    : trade.isDolphin
                    ? isBuy
                      ? 'bg-emerald-950/20'
                      : 'bg-rose-950/20'
                    : 'hover:bg-zinc-800/30'
                }`}
              >
                {/* Time */}
                <div className="text-[11px] text-zinc-500">{formatTime(trade.time)}</div>

                {/* Side & Badge */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isBuy ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {isBuy ? 'BUY' : 'SELL'}
                  </span>
                  {trade.isWhale && (
                    <span className="rounded bg-amber-950/80 border border-amber-700 px-1 text-[9px] font-bold text-amber-300">
                      🐋 WHALE
                    </span>
                  )}
                  {trade.isDolphin && (
                    <span className="rounded bg-cyan-950/80 border border-cyan-700 px-1 text-[9px] font-bold text-cyan-300">
                      🐬 DOLPHIN
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className={`text-right font-bold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${formatPrice(trade.price)}
                </div>

                {/* Amount */}
                <div className="text-right text-zinc-300">
                  {trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>

                {/* Quote USD Volume */}
                <div className="text-right font-bold text-white">
                  {formatUSD(trade.quoteQuantity)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-sm text-zinc-500">
            No matching trades received yet for current filter.
          </div>
        )}
      </div>
    </div>
  );
}
