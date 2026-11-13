'use client';

import React, { useState } from 'react';
import { BarChart3, Clock, Activity } from 'lucide-react';
import { KlinePoint } from '@/types/crypto';

interface PriceChartProps {
  klines: KlinePoint[];
  symbol: string;
  currentInterval?: string;
  onSelectInterval?: (interval: string) => void;
}

export function PriceChart({ klines, symbol, currentInterval = '1h', onSelectInterval }: PriceChartProps) {
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!klines || klines.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-500">
        No candlestick surveillance data available.
      </div>
    );
  }

  const minPrice = Math.min(...klines.map((k) => k.low));
  const maxPrice = Math.max(...klines.map((k) => k.high));
  const priceRange = maxPrice - minPrice || 1;

  const volumes = klines.map((k) => k.volume);
  const maxVolume = Math.max(...volumes) || 1;

  const isNetPositive = klines[klines.length - 1].close >= klines[0].open;
  const strokeColor = isNetPositive ? '#10b981' : '#f43f5e';
  const fillColor = isNetPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

  const activePoint = hoverIndex !== null ? klines[hoverIndex] : klines[klines.length - 1];

  const width = 800;
  const chartHeight = 170;
  const rsiHeight = showRSI ? 60 : 0;
  const totalSvgHeight = chartHeight + (showRSI ? 80 : 40);

  const getX = (idx: number) => (idx / (klines.length - 1)) * (width - 40) + 20;
  const getY = (val: number) => chartHeight - ((val - minPrice) / priceRange) * (chartHeight - 30) - 15;

  const points = klines.map((k, i) => `${getX(i)},${getY(k.close)}`).join(' ');
  const areaPath = `M ${getX(0)},${chartHeight} L ${points} L ${getX(klines.length - 1)},${chartHeight} Z`;
  const linePath = `M ${points}`;

  // EMA paths
  const ema20Points = klines.map((k, i) => `${getX(i)},${getY(k.ema20 || k.close)}`).join(' ');
  const ema50Points = klines.map((k, i) => `${getX(i)},${getY(k.ema50 || k.close)}`).join(' ');

  // RSI points
  const rsiYBase = chartHeight + 35;
  const getRSI_Y = (rsiVal: number) => rsiYBase + 35 - (rsiVal / 100) * 30;
  const rsiPoints = klines.map((k, i) => `${getX(i)},${getRSI_Y(k.rsi || 50)}`).join(' ');

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(6)}`;
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Surveillance Technical Price Chart</h2>
        </div>

        {/* Timeframe & Indicator Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Intervals */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
            {['15m', '1h', '4h', '1d'].map((intvl) => (
              <button
                key={intvl}
                onClick={() => onSelectInterval?.(intvl)}
                className={`rounded px-2 py-0.5 text-xs font-semibold uppercase transition-colors ${
                  currentInterval === intvl
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {intvl}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                showEMA ? 'bg-purple-950 text-purple-300 border border-purple-800/60' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              EMA
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                showRSI ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              RSI (14)
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
            <button
              onClick={() => setChartType('area')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                chartType === 'area' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('candles')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                chartType === 'candles' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Candles
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Hover Inspector Banner */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-zinc-500">Close: </span>
            <span className="font-bold text-white">{formatPrice(activePoint.close)}</span>
          </div>
          <div>
            <span className="text-zinc-500">High: </span>
            <span className="font-semibold text-emerald-400">{formatPrice(activePoint.high)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Low: </span>
            <span className="font-semibold text-rose-400">{formatPrice(activePoint.low)}</span>
          </div>
          {showEMA && (
            <>
              <div>
                <span className="text-yellow-400">EMA20: </span>
                <span className="font-mono text-zinc-300">{formatPrice(activePoint.ema20 || activePoint.close)}</span>
              </div>
              <div>
                <span className="text-purple-400">EMA50: </span>
                <span className="font-mono text-zinc-300">{formatPrice(activePoint.ema50 || activePoint.close)}</span>
              </div>
            </>
          )}
          {showRSI && (
            <div>
              <span className="text-amber-400">RSI(14): </span>
              <span
                className={`font-bold ${
                  (activePoint.rsi || 50) >= 70
                    ? 'text-rose-400'
                    : (activePoint.rsi || 50) <= 30
                    ? 'text-emerald-400'
                    : 'text-zinc-200'
                }`}
              >
                {activePoint.rsi || 50}
                {(activePoint.rsi || 50) >= 70 ? ' (Overbought)' : (activePoint.rsi || 50) <= 30 ? ' (Oversold)' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="text-[11px] text-zinc-400">
          {new Date(activePoint.time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-2 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${totalSvgHeight}`}
          className="w-full overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Subtle grid lines */}
          <line x1="20" y1="20" x2={width - 20} y2="20" stroke="#27272a" strokeDasharray="3 3" />
          <line x1="20" y1={chartHeight / 2} x2={width - 20} y2={chartHeight / 2} stroke="#27272a" strokeDasharray="3 3" />
          <line x1="20" y1={chartHeight} x2={width - 20} y2={chartHeight} stroke="#3f3f46" />

          {/* Area / Line mode */}
          {chartType === 'area' && (
            <>
              <path d={areaPath} fill={fillColor} />
              <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2.5" />
            </>
          )}

          {/* Candlestick Mode */}
          {chartType === 'candles' &&
            klines.map((k, idx) => {
              const cx = getX(idx);
              const isGreen = k.close >= k.open;
              const candleColor = isGreen ? '#10b981' : '#f43f5e';
              const yHigh = getY(k.high);
              const yLow = getY(k.low);
              const yOpen = getY(k.open);
              const yClose = getY(k.close);
              const top = Math.min(yOpen, yClose);
              const barH = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g key={idx}>
                  <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={candleColor} strokeWidth="1.2" />
                  <rect x={cx - 4} y={top} width="8" height={barH} fill={candleColor} rx="1" />
                </g>
              );
            })}

          {/* EMA Lines */}
          {showEMA && (
            <>
              <polyline fill="none" stroke="#facc15" strokeWidth="1.5" points={ema20Points} opacity="0.8" />
              <polyline fill="none" stroke="#c084fc" strokeWidth="1.5" points={ema50Points} opacity="0.8" />
            </>
          )}

          {/* RSI Subgraph */}
          {showRSI && (
            <g>
              {/* RSI divider line */}
              <line x1="20" y1={rsiYBase} x2={width - 20} y2={rsiYBase} stroke="#3f3f46" />
              {/* Overbought 70 line */}
              <line x1="20" y1={getRSI_Y(70)} x2={width - 20} y2={getRSI_Y(70)} stroke="#f43f5e" strokeDasharray="2 2" opacity="0.5" />
              <text x={width - 35} y={getRSI_Y(70) + 3} fill="#f43f5e" fontSize="9">70</text>
              {/* Oversold 30 line */}
              <line x1="20" y1={getRSI_Y(30)} x2={width - 20} y2={getRSI_Y(30)} stroke="#10b981" strokeDasharray="2 2" opacity="0.5" />
              <text x={width - 35} y={getRSI_Y(30) + 3} fill="#10b981" fontSize="9">30</text>
              {/* RSI Curve */}
              <polyline fill="none" stroke="#fbbf24" strokeWidth="1.5" points={rsiPoints} />
            </g>
          )}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <>
              <line
                x1={getX(hoverIndex)}
                y1="10"
                x2={getX(hoverIndex)}
                y2={totalSvgHeight}
                stroke="#06b6d4"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(klines[hoverIndex].close)}
                r="4.5"
                fill="#06b6d4"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </>
          )}

          {/* Invisible hover capture zones */}
          {klines.map((_, idx) => (
            <rect
              key={`hover-zone-${idx}`}
              x={getX(idx) - (width / klines.length) / 2}
              y="0"
              width={width / klines.length}
              height={totalSvgHeight}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(idx)}
            />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-2">
        <span>Timeframe: {currentInterval.toUpperCase()} Candle Bars</span>
        <div className="flex items-center gap-3">
          {showEMA && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="h-1.5 w-3 bg-yellow-400 rounded-full" /> EMA 20
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="h-1.5 w-3 bg-purple-400 rounded-full" /> EMA 50
              </span>
            </div>
          )}
          <span>Hover anywhere on chart to inspect</span>
        </div>
      </div>
    </div>
  );
}
