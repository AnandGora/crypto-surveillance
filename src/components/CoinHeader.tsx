'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, Database } from 'lucide-react';
import { SurveillanceReport } from '@/types/crypto';

interface CoinHeaderProps {
  report: SurveillanceReport;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
}

export function CoinHeader({ report, isWatchlisted, onToggleWatchlist }: CoinHeaderProps) {
  const { coin, ticker, risk, dataSource } = report;
  const isPositive = ticker.priceChangePercent24h >= 0;

  const formatPrice = (val: number) => {
    if (!val || val === 0) return '$0.00';
    if (val >= 1000) {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (val >= 1) {
      return `$${val.toFixed(2)}`;
    }
    if (val >= 0.0001) {
      return `$${val.toFixed(4)}`;
    }
    return `$${val.toFixed(8)}`;
  };

  const formatLargeNumber = (val?: number) => {
    if (!val) return 'N/A';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  // High/Low range position
  const rangeSpan = ticker.high24h - ticker.low24h;
  const currentPos = rangeSpan > 0 ? Math.min(100, Math.max(0, ((ticker.price - ticker.low24h) / rangeSpan) * 100)) : 50;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Identity and Price */}
        <div className="flex flex-wrap items-center gap-4">
          {coin.icon ? (
            <img src={coin.icon} alt={coin.name} className="h-14 w-14 rounded-full border border-zinc-700 p-1 bg-zinc-950" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-950/50 text-xl font-bold text-cyan-300">
              {coin.symbol.slice(0, 3)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{coin.name}</h1>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                {coin.symbol}
              </span>
              {coin.rank && (
                <span className="rounded-md border border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Rank #{coin.rank}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {formatPrice(ticker.price)}
              </span>
              <span
                className={`flex items-center text-sm font-bold sm:text-base ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                {isPositive ? '+' : ''}
                {ticker.priceChangePercent24h.toFixed(2)}%
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline">24h change</span>
            </div>
          </div>
        </div>

        {/* Right: Risk Badge & Watchlist toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Health Score Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-2.5 shadow-inner">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-zinc-400">Surveillance Grade</div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white">{risk.overallScore}</span>
                <span className="text-xs text-zinc-400">/100</span>
                <span
                  className={`ml-1 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                    risk.overallScore >= 75
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : risk.overallScore >= 50
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {risk.healthGrade} • {risk.verdict}
                </span>
              </div>
            </div>
          </div>

          {/* Watchlist toggle */}
          <button
            onClick={onToggleWatchlist}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
              isWatchlisted
                ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
            }`}
          >
            {isWatchlisted ? (
              <>
                <BookmarkCheck className="h-4 w-4 text-cyan-400" />
                <span>On Radar</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span>Track Coin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg bg-zinc-950/40 p-2.5">
          <div className="text-[11px] font-medium text-zinc-400">24h Range</div>
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-300">
            <span>{formatPrice(ticker.low24h)}</span>
            <span>{formatPrice(ticker.high24h)}</span>
          </div>
          {/* Visual Range bar */}
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
              style={{ width: `${currentPos}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-zinc-950/40 p-2.5">
          <div className="text-[11px] font-medium text-zinc-400">Market Cap</div>
          <div className="mt-1 text-sm font-bold text-white">{formatLargeNumber(coin.marketCap)}</div>
          <div className="text-[10px] text-zinc-500">Circulating Cap</div>
        </div>

        <div className="rounded-lg bg-zinc-950/40 p-2.5">
          <div className="text-[11px] font-medium text-zinc-400">24h Volume</div>
          <div className="mt-1 text-sm font-bold text-white">{formatLargeNumber(ticker.quoteVolume24h)}</div>
          <div className="text-[10px] text-zinc-500">Turnover USD</div>
        </div>

        <div className="rounded-lg bg-zinc-950/40 p-2.5">
          <div className="text-[11px] font-medium text-zinc-400">Bid-Ask Spread</div>
          <div className="mt-1 text-sm font-bold text-cyan-400">{ticker.spreadPercent.toFixed(3)}%</div>
          <div className="text-[10px] text-zinc-500">Slippage impact</div>
        </div>

        <div className="rounded-lg bg-zinc-950/40 p-2.5">
          <div className="text-[11px] font-medium text-zinc-400">All-Time High</div>
          <div className="mt-1 text-sm font-bold text-white">{formatPrice(coin.ath || 0)}</div>
          <div className="text-[10px] text-rose-400">
            {coin.athChangePercent ? `${coin.athChangePercent.toFixed(1)}% from ATH` : 'N/A'}
          </div>
        </div>

        <div className="rounded-lg bg-zinc-950/40 p-2.5">
          <div className="text-[11px] font-medium text-zinc-400">Surveillance APIs</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {dataSource.binance && (
              <span className="rounded bg-yellow-950/60 border border-yellow-800/40 px-1 py-0.2 text-[9px] font-medium text-yellow-300">
                Binance
              </span>
            )}
            {dataSource.dexScreener && (
              <span className="rounded bg-purple-950/60 border border-purple-800/40 px-1 py-0.2 text-[9px] font-medium text-purple-300">
                DexScreener
              </span>
            )}
            {dataSource.coingecko && (
              <span className="rounded bg-emerald-950/60 border border-emerald-800/40 px-1 py-0.2 text-[9px] font-medium text-emerald-300">
                CoinGecko
              </span>
            )}
            {dataSource.github && (
              <span className="rounded bg-blue-950/60 border border-blue-800/40 px-1 py-0.2 text-[9px] font-medium text-blue-300">
                GitHub
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
