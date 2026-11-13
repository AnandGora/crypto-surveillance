'use client';

import React, { useState } from 'react';
import {
  Flame,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  Clock,
  Layers,
  DollarSign,
  Activity,
  Calculator,
  Calendar,
  Lock,
  Zap,
  BarChart2,
  Cpu,
} from 'lucide-react';
import { SurveillanceReport } from '@/types/crypto';

interface CoinGlassIntelligenceProps {
  report: SurveillanceReport;
  onOpenAiModal?: () => void;
}

export function CoinGlassIntelligence({ report, onOpenAiModal }: CoinGlassIntelligenceProps) {
  const {
    coin,
    ticker,
    liquidationData: l,
    aiNarrative: n,
    marketExchanges: m,
    atAGlance: a,
    historicalPrices: h,
  } = report;

  // Currency Converter State
  const [tokenAmount, setTokenAmount] = useState<string>('1000');
  const numericAmount = parseFloat(tokenAmount) || 0;
  const convertedUsd = (numericAmount * ticker.price).toFixed(ticker.price < 0.01 ? 4 : 2);

  const formatPrice = (p: number) => (p < 0.01 ? p.toFixed(6) : p.toFixed(4));
  const formatCompact = (val: number) =>
    val >= 1e6 ? `$${(val / 1e6).toFixed(2)}M` : val >= 1e3 ? `$${(val / 1e3).toFixed(1)}K` : `$${val.toFixed(2)}`;

  const dynamicShortClusterPrice = ticker.price * (1 + Math.abs(l.shortCluster.percentFromCurrent) / 100);
  const dynamicLongClusterPrice = ticker.price * (1 - Math.abs(l.longCluster.percentFromCurrent) / 100);

  return (
    <div className="space-y-6">
      {/* 1. KEY LIQUIDATION CLUSTERS & AI NARRATIVE BANNER */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Key Liquidation Levels (Left 1/3) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Key Liquidation Levels</h3>
              </div>
              <span className="rounded bg-amber-950/80 border border-amber-800 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Heatmap
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Estimated liquidation order book clusters where forced stop cascades and squeezes occur.
            </p>

            <div className="space-y-4">
              {/* Short Liquidation Cluster (Above) */}
              <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-3.5 transition-all hover:border-rose-700/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
                    Short Liquidation Cluster
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-400">
                    +{l.shortCluster.percentFromCurrent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-lg font-black text-white">
                    ${formatPrice(dynamicShortClusterPrice)}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Intensity: <strong className="text-rose-300">{l.shortCluster.intensityLabel}</strong>
                  </span>
                </div>
              </div>

              {/* Current Price Reference */}
              <div className="rounded-xl border border-cyan-800/80 bg-cyan-950/40 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-medium text-cyan-200">Current Price</span>
                </div>
                <span className="font-mono text-base font-bold text-white">
                  ${formatPrice(ticker.price)}
                </span>
              </div>

              {/* Long Liquidation Cluster (Below) */}
              <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-3.5 transition-all hover:border-emerald-700/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                    Long Liquidation Cluster
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {l.longCluster.percentFromCurrent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-lg font-black text-white">
                    ${formatPrice(dynamicLongClusterPrice)}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Intensity: <strong className="text-emerald-300">{l.longCluster.intensityLabel}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
            <span>24h Total Liq: <strong className="text-white">${(l.totalLiquidations24hUsd / 1e6).toFixed(2)}M</strong></span>
            <span className="text-rose-400">Longs {l.longLiquidationPercent}%</span>
            <span className="text-emerald-400">Shorts {l.shortLiquidationPercent}%</span>
          </div>
        </div>

        {/* AI Market Narrative: "Why is Coin moving today?" (Right 2/3) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-black shadow-md shadow-cyan-500/20">
                  <Cpu className="h-4 w-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {n.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Algorithmic market microstructure explanation generated from real-time spot & derivatives data.
                  </p>
                </div>
              </div>

              {onOpenAiModal && (
                <button
                  onClick={onOpenAiModal}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>AI Review / Export</span>
                </button>
              )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 mb-4 text-xs text-zinc-300 leading-relaxed">
              <p>{n.summary}</p>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
              {n.drivers.map((drv, i) => {
                const isBull = drv.status === 'bullish';
                const isBear = drv.status === 'bearish';
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 ${
                      isBull
                        ? 'border-emerald-900/40 bg-emerald-950/20'
                        : isBear
                        ? 'border-rose-900/40 bg-rose-950/20'
                        : 'border-zinc-800 bg-zinc-950/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span>{drv.label}</span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-zinc-400'
                        }`}
                      >
                        {drv.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold font-mono text-white mb-0.5">{drv.value}</div>
                    <p className="text-[10px] text-zinc-400 truncate" title={drv.detail}>
                      {drv.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-3 flex items-start gap-2 text-xs text-amber-200">
            <Zap className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{n.whatToWatchNext}</span>
          </div>
        </div>
      </div>

      {/* 2. MULTI-EXCHANGE FUTURES & SPOT MARKETS TABLE */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {coin.symbol} Markets: Multi-Exchange Futures & Spot Breakdown
              </h3>
              <p className="text-[11px] text-zinc-400">
                Aggregated cross-exchange Open Interest, Funding Rates, Volume, and Liquidation Order Flow
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {m.length} Active Exchange Pairs Tracked
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-950/50">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Exchange</th>
                <th className="py-2.5 px-3">Pair</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">24h Change</th>
                <th className="py-2.5 px-3 text-right">Open Interest (OI)</th>
                <th className="py-2.5 px-3 text-right">OI 24h</th>
                <th className="py-2.5 px-3 text-right">Funding Rate</th>
                <th className="py-2.5 px-3 text-right">24h Long / Short Liq</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {m.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-3 text-zinc-500">{idx + 1}</td>
                  <td className="py-3 px-3 font-sans font-bold text-white">{row.exchange}</td>
                  <td className="py-3 px-3 text-cyan-400 text-[11px]">{row.pair}</td>
                  <td className="py-3 px-3 text-right font-semibold text-white">
                    ${formatPrice(row.price)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      row.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {row.change24h >= 0 ? '+' : ''}
                    {row.change24h}%
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-200">
                    ${(row.openInterestUsd / 1e6).toFixed(2)}M
                  </td>
                  <td
                    className={`py-3 px-3 text-right text-[11px] ${
                      row.oiChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {row.oiChange24h >= 0 ? '+' : ''}
                    {row.oiChange24h}%
                  </td>
                  <td
                    className={`py-3 px-3 text-right ${
                      row.fundingRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(row.fundingRate * 100).toFixed(4)}%
                  </td>
                  <td className="py-3 px-3 text-right text-[11px]">
                    <span className="text-emerald-400">${(row.longLiqUsd / 1e3).toFixed(1)}K</span>
                    <span className="text-zinc-600 mx-1">/</span>
                    <span className="text-rose-400">${(row.shortLiqUsd / 1e3).toFixed(1)}K</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. AT-A-GLANCE METRICS, TOKEN CONVERTER & TOKEN UNLOCKS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* At-a-Glance Microstructure Stats */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">{coin.symbol} At a Glance Microstructure</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
              <span className="text-[11px] text-zinc-400">Daily RSI (14D)</span>
              <div className="text-base font-bold font-mono text-cyan-400 mt-1">{a.dailyRsi}</div>
              <span className="text-[10px] text-zinc-500">Weekly: {a.weeklyRsi}</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
              <span className="text-[11px] text-zinc-400">30D Volatility</span>
              <div className="text-base font-bold font-mono text-amber-400 mt-1">{a.volatility30dPercent}%</div>
              <span className="text-[10px] text-zinc-500">High Dispersion</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
              <span className="text-[11px] text-zinc-400">Spot Turnover</span>
              <div className="text-base font-bold font-mono text-white mt-1">{a.spotTurnoverPercent}%</div>
              <span className="text-[10px] text-zinc-500">Top: {a.topExchangeByVolume}</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
              <span className="text-[11px] text-zinc-400">OI / Market Cap</span>
              <div className="text-base font-bold font-mono text-rose-400 mt-1">{a.oiToMarketCapPercent}%</div>
              <span className="text-[10px] text-zinc-500">Derivatives Heavy</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
              <span className="text-[11px] text-zinc-400">Spot Net Inflow</span>
              <div
                className={`text-base font-bold font-mono mt-1 ${
                  a.spotNetInflow24hUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCompact(a.spotNetInflow24hUsd)}
              </div>
              <span className="text-[10px] text-zinc-500">24h Net Movement</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
              <span className="text-[11px] text-zinc-400">Futures Net Inflow</span>
              <div
                className={`text-base font-bold font-mono mt-1 ${
                  a.futuresNetInflow24hUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCompact(a.futuresNetInflow24hUsd)}
              </div>
              <span className="text-[10px] text-zinc-500">Taker Order Flow</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Token Unlock Schedule</span>
              </div>
              <div className="text-sm font-bold text-white">
                Next: {a.tokenUnlocks?.nextDate} ({a.tokenUnlocks?.amountFormatted})
              </div>
              <span className="text-[10px] text-zinc-500">
                Est. {a.tokenUnlocks?.amountUsdFormatted} • 100% Unlocked by {a.tokenUnlocks?.fullyUnlockedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Live Token Currency Converter */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
              <Calculator className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">{coin.symbol} Currency Converter</h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Calculate live portfolio value at real-time market price.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Amount of {coin.symbol}:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 pl-3 pr-16 text-sm font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="1000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400">
                    {coin.symbol}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1.5">
                {['1', '100', '1000', '10000'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTokenAmount(preset)}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 py-1 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Result Card */}
              <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-3.5 mt-3">
                <span className="text-[11px] text-zinc-400">Equivalent Value (USD):</span>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-0.5">
                  ${convertedUsd}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">
                  1 {coin.symbol} = ${formatPrice(ticker.price)} USD
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT HISTORICAL PRICES TABLE */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
          <Calendar className="h-5 w-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Recent {coin.symbol} Daily Prices & Liquidity History
            </h3>
            <p className="text-[11px] text-zinc-400">
              Historical daily candles (OHLCV) and 24h performance across major trading sessions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 bg-zinc-950/50">
                <th className="py-2.5 px-3">Date (UTC)</th>
                <th className="py-2.5 px-3 text-right">Open</th>
                <th className="py-2.5 px-3 text-right">High</th>
                <th className="py-2.5 px-3 text-right">Low</th>
                <th className="py-2.5 px-3 text-right">Close</th>
                <th className="py-2.5 px-3 text-right">Change %</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {h.map((day, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans text-zinc-300">{day.date}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">${formatPrice(day.open)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">${formatPrice(day.high)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">${formatPrice(day.low)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-white">${formatPrice(day.close)}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      day.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {day.changePercent >= 0 ? '+' : ''}
                    {day.changePercent}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">${(day.volumeUsd / 1e6).toFixed(2)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
