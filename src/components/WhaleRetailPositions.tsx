'use client';

import React from 'react';
import { Users, Shield, Zap, TrendingUp, TrendingDown, Scale, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { FuturesMetrics } from '@/types/crypto';

interface WhaleRetailPositionsProps {
  futures: FuturesMetrics;
  symbol: string;
}

export function WhaleRetailPositions({ futures, symbol }: WhaleRetailPositionsProps) {
  const {
    topLongShortPositionRatio,
    topLongShortAccountRatio,
    globalLongShortAccountRatio,
    openInterestUsd,
    takerBuySell,
  } = futures;

  const baseOi = openInterestUsd > 0 ? openInterestUsd : 42500000;

  // Whale Positions (Top Traders)
  const whaleLong = topLongShortPositionRatio.longPercent;
  const whaleShort = topLongShortPositionRatio.shortPercent;
  const whaleRatio = topLongShortPositionRatio.ratio;
  const whaleDelta = Math.round((whaleLong - whaleShort) * 10) / 10;
  const whaleLongUsd = Math.round(baseOi * (whaleLong / 100));
  const whaleShortUsd = Math.round(baseOi * (whaleShort / 100));

  // Retail Positions (Global Public Accounts)
  const retailLong = globalLongShortAccountRatio.longPercent;
  const retailShort = globalLongShortAccountRatio.shortPercent;
  const retailRatio = globalLongShortAccountRatio.ratio;
  const retailDelta = Math.round((retailLong - retailShort) * 10) / 10;

  // Divergence between Whales and Retail
  // e.g., if Whales are 60% Long and Retail is 45% Long -> Divergence is +15%
  const divergence = Math.round((whaleLong - retailLong) * 10) / 10;

  // Imbalance Analysis
  let divergenceTitle = 'BALANCED ACCUMULATION';
  let divergenceTone = 'text-cyan-400 border-cyan-800 bg-cyan-950/60';
  let divergenceDescription = 'Whales and retail positions are relatively aligned.';

  if (whaleLong >= 54 && retailShort >= 52) {
    divergenceTitle = '🚨 RETAIL SHORT SQUEEZE TRAP';
    divergenceTone = 'text-emerald-300 border-emerald-800 bg-emerald-950/80';
    divergenceDescription = `Smart money whales are ${whaleLong}% LONG while retail crowd is ${retailShort}% SHORT. Retail is aggressively shorting into whale absorption — High probability of short squeeze wick!`;
  } else if (whaleShort >= 54 && retailLong >= 52) {
    divergenceTitle = '⚠️ BULL TRAP / LONG LIQUIDATION CASCADE';
    divergenceTone = 'text-rose-300 border-rose-800 bg-rose-950/80';
    divergenceDescription = `Whales are ${whaleShort}% SHORT while retail crowd is ${retailLong}% LONG. Retail is buying whale distribution — Elevated risk of sudden long flush cascade!`;
  } else if (whaleLong >= 56) {
    divergenceTitle = 'WHALE BULLISH BIAS';
    divergenceTone = 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
    divergenceDescription = `Whales maintain a strong long bias (${whaleLong}%), absorbing order book sell pressure.`;
  } else if (whaleShort >= 56) {
    divergenceTitle = 'WHALE BEARISH DISTRIBUTION';
    divergenceTone = 'text-rose-400 border-rose-800 bg-rose-950/40';
    divergenceDescription = `Whales maintain a short bias (${whaleShort}%), placing heavy resistance on perp order books.`;
  }

  const formatUSD = (val: number) =>
    val >= 1e6 ? `$${(val / 1e6).toFixed(2)}M` : `$${(val / 1e3).toFixed(1)}K`;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Whale vs Retail Trading Positions & Long/Short Differential
              <span className="rounded bg-indigo-950/80 border border-indigo-800 px-1.5 py-0.5 text-[10px] text-indigo-300 font-semibold">
                SMART MONEY RADAR
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Comparing Binance Top 20% Whales positioning against Global Retail public traders
            </p>
          </div>
        </div>

        {/* Divergence Alert Badge */}
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${divergenceTone}`}>
          <span>{divergenceTitle}</span>
        </div>
      </div>

      {/* Divergence Description Banner */}
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-xs text-zinc-300 flex items-start gap-2.5">
        <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{divergenceDescription}</p>
      </div>

      {/* Main Grid: Whales vs Retail Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Card 1: Whales (Top Traders / Smart Money) */}
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🐋</span>
              <div>
                <h4 className="text-xs font-bold text-white">Whales (Top Trader Positions)</h4>
                <p className="text-[10px] text-zinc-500">Largest 20% accounts by Open Interest</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-cyan-400">{whaleRatio.toFixed(2)}x Ratio</span>
              <div className="text-[10px] text-zinc-400">
                Net Delta: <strong className={whaleDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {whaleDelta >= 0 ? '+' : ''}{whaleDelta}%
                </strong>
              </div>
            </div>
          </div>

          {/* Numbers */}
          <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Long: {whaleLong}% ({formatUSD(whaleLongUsd)})
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Short: {whaleShort}% ({formatUSD(whaleShortUsd)})
            </span>
          </div>

          {/* Position Bar */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800 p-0.5 shadow-inner">
            <div
              className="h-full rounded-l-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${whaleLong}%` }}
            />
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
              style={{ width: `${whaleShort}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/40">
            <span>Whale Accounts Ratio: <strong>{topLongShortAccountRatio.ratio.toFixed(2)}x</strong></span>
            <span className="text-zinc-500">
              Bias: <strong className="text-white">{whaleLong > whaleShort ? 'Accumulating Long' : 'Hedging / Short'}</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Retail Traders (Global Public Accounts) */}
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">👥</span>
              <div>
                <h4 className="text-xs font-bold text-white">Retail Traders (Global Accounts)</h4>
                <p className="text-[10px] text-zinc-500">General crowd / Public trader sentiment</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-zinc-300">{retailRatio.toFixed(2)}x Ratio</span>
              <div className="text-[10px] text-zinc-400">
                Net Delta: <strong className={retailDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {retailDelta >= 0 ? '+' : ''}{retailDelta}%
                </strong>
              </div>
            </div>
          </div>

          {/* Numbers */}
          <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Long: {retailLong}%
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Short: {retailShort}%
            </span>
          </div>

          {/* Position Bar */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800 p-0.5 shadow-inner">
            <div
              className="h-full rounded-l-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${retailLong}%` }}
            />
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
              style={{ width: `${retailShort}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/40">
            <span>Crowd Sentiment Spread: <strong className={divergence > 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {divergence > 0 ? `+${divergence}% Whale Lead` : `${divergence}% Retail Lead`}
            </strong></span>
            <span className="text-zinc-500">
              Bias: <strong className="text-white">{retailLong > retailShort ? 'Retail Long' : 'Retail Short'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Long vs Short Net Imbalance Summary Bar */}
      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-cyan-400" />
          <span className="font-bold text-white">Net Market Long/Short Imbalance:</span>
          <span className="font-mono text-zinc-300">
            Whales are <strong className="text-cyan-400">{whaleLong}% Long</strong> vs Retail <strong className="text-zinc-400">{retailLong}% Long</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-zinc-400">
            Taker Aggression: <strong className={takerBuySell.buyPercent >= 50 ? 'text-emerald-400' : 'text-rose-400'}>
              {takerBuySell.ratio.toFixed(2)}x ({takerBuySell.buyPercent}% Buys)
            </strong>
          </span>
          <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
            Binance Real-Time API
          </span>
        </div>
      </div>
    </div>
  );
}
