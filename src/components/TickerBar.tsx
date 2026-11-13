'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DEFAULT_TICKERS } from '@/lib/constants';

interface TickerBarProps {
  currentSymbol: string;
  onSelectCoin: (symbol: string) => void;
  quickTickers?: { [symbol: string]: { price: number; change24h: number } };
}

export function TickerBar({ currentSymbol, onSelectCoin, quickTickers = {} }: TickerBarProps) {
  return (
    <div className="border-b border-zinc-800/60 bg-zinc-950/60 overflow-x-auto no-scrollbar">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
          Quick Radar:
        </span>
        <div className="flex items-center gap-2">
          {DEFAULT_TICKERS.map((sym) => {
            const data = quickTickers[sym];
            const isSelected = currentSymbol === sym;
            const isPositive = (data?.change24h || 0) >= 0;

            return (
              <button
                key={sym}
                onClick={() => onSelectCoin(sym)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/20'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60'
                }`}
              >
                <span>{sym}</span>
                {data ? (
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
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
