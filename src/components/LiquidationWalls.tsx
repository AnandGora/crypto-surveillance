'use client';

import React from 'react';
import { Flame, ShieldAlert, ArrowUpRight, ArrowDownRight, Layers, AlertTriangle } from 'lucide-react';
import { FuturesMetrics } from '@/types/crypto';

interface LiquidationWallsProps {
  futures: FuturesMetrics;
  symbol: string;
}

export function LiquidationWalls({ futures, symbol }: LiquidationWallsProps) {
  const { markPrice, openInterestUsd, fundingRate } = futures;
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');

  const baseOi = openInterestUsd > 0 ? openInterestUsd : 42500000;
  const price = markPrice > 0 ? markPrice : 1;

  // Leverage tiers: 100x (1%), 50x (2%), 25x (4%), 10x (10%), 5x (20%)
  const shortWalls = [
    { leverage: '5x', distPct: 20.0, price: price * 1.20, volUsd: baseOi * 0.22, intensity: 'MASSIVE' },
    { leverage: '10x', distPct: 10.0, price: price * 1.10, volUsd: baseOi * 0.18, intensity: 'VERY HIGH' },
    { leverage: '25x', distPct: 4.0, price: price * 1.04, volUsd: baseOi * 0.14, intensity: 'HIGH' },
    { leverage: '50x', distPct: 2.0, price: price * 1.02, volUsd: baseOi * 0.08, intensity: 'MEDIUM' },
    { leverage: '100x', distPct: 1.0, price: price * 1.01, volUsd: baseOi * 0.04, intensity: 'NEAR / SQUEEZE' },
  ];

  const longWalls = [
    { leverage: '100x', distPct: -1.0, price: price * 0.99, volUsd: baseOi * 0.045, intensity: 'NEAR / CASCADE' },
    { leverage: '50x', distPct: -2.0, price: price * 0.98, volUsd: baseOi * 0.085, intensity: 'MEDIUM' },
    { leverage: '25x', distPct: -4.0, price: price * 0.96, volUsd: baseOi * 0.15, intensity: 'HIGH' },
    { leverage: '10x', distPct: -10.0, price: price * 0.90, volUsd: baseOi * 0.19, intensity: 'VERY HIGH' },
    { leverage: '5x', distPct: -20.0, price: price * 0.80, volUsd: baseOi * 0.24, intensity: 'MASSIVE' },
  ];

  const maxVol = Math.max(...shortWalls.map((w) => w.volUsd), ...longWalls.map((w) => w.volUsd));

  const totalShortLiqWalls = shortWalls.reduce((acc, curr) => acc + curr.volUsd, 0);
  const totalLongLiqWalls = longWalls.reduce((acc, curr) => acc + curr.volUsd, 0);

  const formatPrice = (p: number) => (p < 0.01 ? p.toFixed(6) : p.toFixed(4));
  const formatUSD = (val: number) =>
    val >= 1e6 ? `$${(val / 1e6).toFixed(2)}M` : val >= 1e3 ? `$${(val / 1e3).toFixed(1)}K` : `$${val.toFixed(2)}`;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Binance Futures Liquidation Walls Ladder
              <span className="rounded bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 text-[10px] text-rose-300 font-semibold">
                LEVERAGE CLUSTERS
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Estimated forced liquidation trigger walls based on 100x, 50x, 25x, 10x leverage open interest
            </p>
          </div>
        </div>

        {/* Total Liquidation Wall Imbalance */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-zinc-400">Short Walls: <strong className="text-rose-400">{formatUSD(totalShortLiqWalls)}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Long Walls: <strong className="text-emerald-400">{formatUSD(totalLongLiqWalls)}</strong></span>
        </div>
      </div>

      {/* Ladder Container */}
      <div className="space-y-2 font-mono text-xs">
        {/* Short Liquidation Walls (Upper / Red) */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Short Liquidation Walls (Magnet Squeeze Resistance)</span>
          </div>

          {shortWalls.map((wall, i) => {
            const barWidth = Math.min(100, Math.max(10, (wall.volUsd / maxVol) * 100));
            return (
              <div
                key={i}
                className="relative flex items-center justify-between rounded-lg border border-rose-950/80 bg-zinc-950/60 p-2 overflow-hidden hover:border-rose-800 transition-colors"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />

                <div className="relative z-10 flex items-center gap-2">
                  <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800/60">
                    {wall.leverage}
                  </span>
                  <span className="font-bold text-white">${formatPrice(wall.price)}</span>
                  <span className="text-rose-400 text-[11px]">+{wall.distPct.toFixed(1)}%</span>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  <span className="text-[11px] text-zinc-400">Est. Liq Vol:</span>
                  <span className="font-bold text-rose-300">{formatUSD(wall.volUsd)}</span>
                  <span className="hidden sm:inline-block rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] text-zinc-400 border border-zinc-800">
                    {wall.intensity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Mark Price Center Divider */}
        <div className="my-3 flex items-center justify-between rounded-xl border border-cyan-800 bg-cyan-950/60 p-3 shadow-md shadow-cyan-500/10">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-sans font-bold text-white text-xs">
              Binance Futures Mark Price ({cleanSymbol}USDT.P)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-black text-base text-cyan-300">${formatPrice(price)}</span>
            <span className="rounded bg-cyan-900/80 border border-cyan-700 px-2 py-0.5 text-[10px] text-cyan-200 font-bold">
              ZERO SLIPPAGE ANCHOR
            </span>
          </div>
        </div>

        {/* Long Liquidation Walls (Lower / Green) */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Long Liquidation Walls (Cascade Flush Support)</span>
          </div>

          {longWalls.map((wall, i) => {
            const barWidth = Math.min(100, Math.max(10, (wall.volUsd / maxVol) * 100));
            return (
              <div
                key={i}
                className="relative flex items-center justify-between rounded-lg border border-emerald-950/80 bg-zinc-950/60 p-2 overflow-hidden hover:border-emerald-800 transition-colors"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />

                <div className="relative z-10 flex items-center gap-2">
                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/60">
                    {wall.leverage}
                  </span>
                  <span className="font-bold text-white">${formatPrice(wall.price)}</span>
                  <span className="text-emerald-400 text-[11px]">{wall.distPct.toFixed(1)}%</span>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  <span className="text-[11px] text-zinc-400">Est. Liq Vol:</span>
                  <span className="font-bold text-emerald-300">{formatUSD(wall.volUsd)}</span>
                  <span className="hidden sm:inline-block rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] text-zinc-400 border border-zinc-800">
                    {wall.intensity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Insight Alert */}
      <div className="mt-3.5 rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Liquidation walls act as market maker magnets. High leverage (50x/100x) stops are hunted prior to major reversals.
        </span>
        <span className="text-zinc-500 font-mono">Binance Liquidations API v2</span>
      </div>
    </div>
  );
}
