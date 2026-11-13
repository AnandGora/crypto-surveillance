'use client';

import React from 'react';
import { Zap, TrendingUp, TrendingDown, Clock, Users, Flame, BarChart2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { FuturesMetrics } from '@/types/crypto';
import { LiquidationWalls } from './LiquidationWalls';
import { WhaleRetailPositions } from './WhaleRetailPositions';

interface FuturesSurveillanceProps {
  futures: FuturesMetrics;
  symbol: string;
}

export function FuturesSurveillance({ futures, symbol }: FuturesSurveillanceProps) {
  if (!futures.hasFutures) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-center text-zinc-400">
        <Zap className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
        <h3 className="text-base font-semibold text-white">No Perpetual Futures Contract Found</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
          {symbol} does not currently trade on Binance Perpetual Futures. Spot & DEX liquidity surveillance remains active above.
        </p>
      </div>
    );
  }

  const {
    openInterest,
    openInterestUsd,
    openInterestChange24h,
    openInterestHistory,
    fundingRate,
    fundingRatePercent,
    annualizedFundingRate,
    fundingCountdown,
    fundingPayer,
    topLongShortPositionRatio,
    topLongShortAccountRatio,
    globalLongShortAccountRatio,
    takerBuySell,
    squeezeRisk,
    markPrice,
  } = futures;

  const isFundingPositive = fundingRate >= 0;
  const isOIPositive = openInterestChange24h >= 0;

  const formatLargeUSD = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  // Sparkline for Open Interest
  const oiValues = openInterestHistory.map((h) => h.value);
  const minOI = Math.min(...oiValues);
  const maxOI = Math.max(...oiValues);
  const oiRange = maxOI - minOI || 1;
  const sparkPoints = openInterestHistory
    .map((h, i) => {
      const x = (i / Math.max(1, openInterestHistory.length - 1)) * 200;
      const y = 45 - ((h.value - minOI) / oiRange) * 35;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Perpetual Futures & Derivatives Surveillance</h2>
          <span className="rounded bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            Binance Futures Live
          </span>
        </div>

        {/* Squeeze Risk Pill */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
            squeezeRisk === 'HIGH SHORT SQUEEZE RISK'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : squeezeRisk === 'HIGH LONG LIQUIDATION RISK'
              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>{squeezeRisk}</span>
        </div>
      </div>

      {/* Top Grid: Open Interest & Funding Rate */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Open Interest USD */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
            <span>Open Interest (OI)</span>
            <span
              className={`flex items-center text-[11px] font-bold ${
                isOIPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isOIPositive ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
              {isOIPositive ? '+' : ''}
              {openInterestChange24h.toFixed(1)}% (24h)
            </span>
          </div>

          <div className="mt-2 text-2xl font-black text-white">
            {formatLargeUSD(openInterestUsd)}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {openInterest.toLocaleString(undefined, { maximumFractionDigits: 1 })} contracts
          </div>

          {/* Mini OI Sparkline */}
          {openInterestHistory.length > 2 && (
            <div className="mt-2.5 h-10 w-full">
              <svg viewBox="0 0 200 50" className="h-full w-full overflow-visible">
                <polyline
                  fill="none"
                  stroke={isOIPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth="2"
                  points={sparkPoints}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Funding Rate */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
            <span>8h Funding Rate</span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <Clock className="h-3 w-3 text-cyan-400" />
              Settles in {fundingCountdown}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                isFundingPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isFundingPositive ? '+' : ''}
              {fundingRatePercent.toFixed(4)}%
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Annualized:</span>
            <span className="font-semibold text-zinc-300">{annualizedFundingRate.toFixed(2)}% APR</span>
          </div>

          <div className="mt-2 rounded bg-zinc-900 px-2 py-1 text-center text-[10px] font-semibold text-zinc-300 border border-zinc-800">
            {fundingPayer}
          </div>
        </div>

        {/* Top Trader Position Ratio */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
            <span>Top Trader Positions (Whales)</span>
            <span className="text-cyan-400 font-bold">{topLongShortPositionRatio.ratio.toFixed(2)}x</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400">Long: {topLongShortPositionRatio.longPercent}%</span>
            <span className="text-rose-400">Short: {topLongShortPositionRatio.shortPercent}%</span>
          </div>

          <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${topLongShortPositionRatio.longPercent}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${topLongShortPositionRatio.shortPercent}%` }}
            />
          </div>

          <div className="mt-2 text-[10px] text-zinc-400">
            Smart money position ratio: {topLongShortPositionRatio.longPercent >= 55 ? 'Bullish Whale Bias' : topLongShortPositionRatio.shortPercent >= 55 ? 'Bearish Whale Bias' : 'Neutral Position Balance'}
          </div>
        </div>

        {/* Taker Buy / Sell Volume Aggression */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
            <span>Taker Buy/Sell Volume</span>
            <span className="text-amber-400 font-bold">{takerBuySell.ratio.toFixed(2)}x</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400">Buy: {takerBuySell.buyPercent}%</span>
            <span className="text-rose-400">Sell: {takerBuySell.sellPercent}%</span>
          </div>

          <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${takerBuySell.buyPercent}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${takerBuySell.sellPercent}%` }}
            />
          </div>

          <div className="mt-2 text-[10px] text-zinc-400">
            {takerBuySell.buyPercent >= 55
              ? 'Aggressive market orders are buying'
              : takerBuySell.sellPercent >= 55
              ? 'Aggressive market orders are dumping'
              : 'Market taker orders balanced'}
          </div>
        </div>
      </div>

      {/* Comparison: Whales vs Retail Account Ratios */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-300">Top Traders (Accounts Ratio)</span>
            <span className="text-zinc-400">Ratio: {topLongShortAccountRatio.ratio.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400">Long: {topLongShortAccountRatio.longPercent}%</span>
            <span className="text-rose-400">Short: {topLongShortAccountRatio.shortPercent}%</span>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${topLongShortAccountRatio.longPercent}%` }}
            />
            <div
              className="h-full bg-rose-500"
              style={{ width: `${topLongShortAccountRatio.shortPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-300">Global Traders (Retail Account Ratio)</span>
            <span className="text-zinc-400">Ratio: {globalLongShortAccountRatio.ratio.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400">Long: {globalLongShortAccountRatio.longPercent}%</span>
            <span className="text-rose-400">Short: {globalLongShortAccountRatio.shortPercent}%</span>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${globalLongShortAccountRatio.longPercent}%` }}
            />
            <div
              className="h-full bg-rose-500"
              style={{ width: `${globalLongShortAccountRatio.shortPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Whale vs Retail Positions & Long/Short Differential */}
      <div className="mt-6">
        <WhaleRetailPositions futures={futures} symbol={symbol} />
      </div>

      {/* Liquidation Walls Ladder */}
      <div className="mt-6">
        <LiquidationWalls futures={futures} symbol={symbol} />
      </div>
    </div>
  );
}
