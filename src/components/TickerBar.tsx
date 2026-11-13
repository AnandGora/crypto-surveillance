'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Bookmark, Radio } from 'lucide-react';
import { DEFAULT_TICKERS } from '@/lib/constants';
import { WatchlistCoin } from '@/types/crypto';

interface TickerBarProps {
  currentSymbol: string;
  onSelectCoin: (symbol: string) => void;
  quickTickers?: { [symbol: string]: { price: number; change24h: number } };
  watchlist?: WatchlistCoin[];
  onOpenRadar?: () => void;
}

export function TickerBar({
  currentSymbol,
  onSelectCoin,
  quickTickers = {},
  watchlist = [],
  onOpenRadar,
}: TickerBarProps) {
  const formatPrice = (p?: number) => {
    if (!p || p === 0) return '';
    if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.0001) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(6)}`;
  };

  // User's Pinned Radar Coins
  const radarCoins = watchlist;
  const radarSymbols = new Set(radarCoins.map((c) => c.symbol.toUpperCase()));

  // Market benchmark coins (exclude ones already in radar)
  const marketCoins = DEFAULT_TICKERS.filter((sym) => !radarSymbols.has(sym.toUpperCase()));

  return (
    <div className="border-b border-zinc-800/80 bg-zinc-950/90 overflow-x-auto no-scrollbar shadow-inner">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        {/* Label */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
            Quick Radar
          </span>
          {radarCoins.length > 0 && (
            <span className="rounded-full bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300">
              {radarCoins.length}
            </span>
          )}
          <span className="text-zinc-600">:</span>
        </div>

        {/* Scrollable Coin Buttons */}
        <div className="flex items-center gap-2">
          {/* 1. USER'S PINNED RADAR COINS (BARD, JCT, etc.) */}
          {radarCoins.map((coin) => {
            const sym = coin.symbol.toUpperCase();
            const liveData = quickTickers[sym];
            const price = liveData?.price ?? coin.price;
            const change = liveData?.change24h ?? coin.change24h;
            const isSelected = currentSymbol.toUpperCase() === sym;
            const isPositive = change >= 0;

            return (
              <button
                key={sym}
                onClick={() => onSelectCoin(sym)}
                title={`Tracked on Radar: ${coin.name || sym}`}
                className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 font-bold shadow-sm shadow-cyan-500/30'
                    : 'border-cyan-800/60 bg-cyan-950/20 text-zinc-200 hover:border-cyan-500 hover:bg-cyan-950/40'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Bookmark className="h-2.5 w-2.5 text-cyan-400 fill-cyan-400" />
                  <span className="font-bold text-white">{sym}</span>
                </span>

                {price > 0 && (
                  <span className="font-mono text-[11px] text-zinc-300">
                    {formatPrice(price)}
                  </span>
                )}

                <span
                  className={`flex items-center text-[10px] font-semibold ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-2.5 w-2.5" />
                  )}
                  {isPositive ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
              </button>
            );
          })}

          {/* Divider if radar coins exist */}
          {radarCoins.length > 0 && marketCoins.length > 0 && (
            <div className="h-4 w-px bg-zinc-800 shrink-0" />
          )}

          {/* 2. MARKET BENCHMARK COINS (BTC, ETH, SOL, etc.) */}
          {marketCoins.map((sym) => {
            const data = quickTickers[sym];
            const isSelected = currentSymbol.toUpperCase() === sym;
            const isPositive = (data?.change24h || 0) >= 0;

            return (
              <button
                key={sym}
                onClick={() => onSelectCoin(sym)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'border-cyan-500/80 bg-zinc-900 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/20'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                <span className="font-medium">{sym}</span>
                {data ? (
                  <>
                    {data.price > 0 && (
                      <span className="font-mono text-[11px] text-zinc-400">
                        {formatPrice(data.price)}
                      </span>
                    )}
                    <span
                      className={`flex items-center text-[10px] ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="mr-0.5 h-2.5 w-2.5" />
                      )}
                      {isPositive ? '+' : ''}
                      {data.change24h.toFixed(1)}%
                    </span>
                  </>
                ) : null}
              </button>
            );
          })}

          {/* Manage Radar button */}
          {onOpenRadar && (
            <button
              onClick={onOpenRadar}
              className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-500 hover:border-cyan-500/60 hover:text-cyan-400 hover:bg-cyan-950/20 transition-all whitespace-nowrap"
            >
              <Bookmark className="h-3 w-3" />
              <span>{radarCoins.length > 0 ? 'Radar' : '+ Add Coin'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
