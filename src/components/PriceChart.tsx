'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';
import { KlinePoint } from '@/types/crypto';

interface PriceChartProps {
  klines: KlinePoint[];
  symbol: string;
}

export function PriceChart({ klines, symbol }: PriceChartProps) {
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!klines || klines.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-500">
        No candlestick surveillance data available.
      </div>
    );
  }

  const prices = klines.map((k) => k.close);
  const minPrice = Math.min(...klines.map((k) => k.low));
  const maxPrice = Math.max(...klines.map((k) => k.high));
  const priceRange = maxPrice - minPrice || 1;

  const volumes = klines.map((k) => k.volume);
  const maxVolume = Math.max(...volumes) || 1;

  const isNetPositive = klines[klines.length - 1].close >= klines[0].open;
  const strokeColor = isNetPositive ? '#10b981' : '#f43f5e';
  const fillColor = isNetPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

  const activePoint = hoverIndex !== null ? klines[hoverIndex] : klines[klines.length - 1];

  // SVG Area path generation
  const width = 800;
  const height = 240;
  const chartHeight = 180;
  const volumeHeight = 50;

  const getX = (idx: number) => (idx / (klines.length - 1)) * (width - 40) + 20;
  const getY = (val: number) => chartHeight - ((val - minPrice) / priceRange) * (chartHeight - 30) - 15;

  const points = klines.map((k, i) => `${getX(i)},${getY(k.close)}`).join(' ');
  const areaPath = `M ${getX(0)},${chartHeight} L ${points} L ${getX(klines.length - 1)},${chartHeight} Z`;
  const linePath = `M ${points}`;

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
          <h2 className="text-base font-bold text-white">24h Surveillance Price Action</h2>
          <span className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
            <Clock className="h-2.5 w-2.5" />
            1H Intervals
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <button
            onClick={() => setChartType('area')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              chartType === 'area' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Area Line
          </button>
          <button
            onClick={() => setChartType('candles')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              chartType === 'candles' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Candlesticks
          </button>
        </div>
      </div>

      {/* Dynamic Hover Inspector Banner */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
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
        </div>
        <div className="text-[11px] text-zinc-400">
          {new Date(activePoint.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-2 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-60 w-full overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Subtle horizontal grid lines */}
          <line x1="20" y1="20" x2={width - 20} y2="20" stroke="#27272a" strokeDasharray="3 3" />
          <line x1="20" y1={chartHeight / 2} x2={width - 20} y2={chartHeight / 2} stroke="#27272a" strokeDasharray="3 3" />
          <line x1="20" y1={chartHeight} x2={width - 20} y2={chartHeight} stroke="#3f3f46" />

          {/* Area Chart Mode */}
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
                  {/* Wick */}
                  <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={candleColor} strokeWidth="1.2" />
                  {/* Body */}
                  <rect
                    x={cx - 5}
                    y={top}
                    width="10"
                    height={barH}
                    fill={candleColor}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* Volume bars at bottom */}
          {klines.map((k, idx) => {
            const cx = getX(idx);
            const vHeight = (k.volume / maxVolume) * volumeHeight;
            const isGreen = k.close >= k.open;
            return (
              <rect
                key={`vol-${idx}`}
                x={cx - 3}
                y={height - vHeight}
                width="6"
                height={vHeight}
                fill={isGreen ? '#10b981' : '#f43f5e'}
                opacity={hoverIndex === idx ? 0.9 : 0.35}
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}

          {/* Hover crosshair & point marker */}
          {hoverIndex !== null && (
            <>
              <line
                x1={getX(hoverIndex)}
                y1="10"
                x2={getX(hoverIndex)}
                y2={height}
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
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-2">
        <span>Surveillance Range: 24 Hours ago</span>
        <span>Current Timestamp: Live</span>
      </div>
    </div>
  );
}
